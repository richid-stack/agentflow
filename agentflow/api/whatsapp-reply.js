// api/whatsapp-reply.js
// Twilio calls this webhook when someone messages your WhatsApp number
// Looks up the business context from Supabase and replies intelligently

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const body = req.body;
  const incomingMsg = body.Body || "";
  const fromNumber  = body.From || "";
  const toNumber    = body.To   || "";

  if (!incomingMsg) {
    return res.status(200).send("<Response></Response>");
  }

  // ── Get business context from Supabase ──
  let businessContext = "";
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Find which user owns this WhatsApp number
    const cleanTo = toNumber.replace("whatsapp:", "");
    const { data: waIntg } = await supabase
      .from("integrations")
      .select("user_id, credentials")
      .eq("name", "whatsapp")
      .eq("connected", true);

    const ownerIntg = (waIntg || []).find(w =>
      w.credentials?.businessNumber === cleanTo ||
      cleanTo.includes("14155238886")
    );

    if (ownerIntg) {
      // Get their agents for context
      const { data: agents } = await supabase
        .from("agents")
        .select("name, role, description")
        .eq("user_id", ownerIntg.user_id)
        .eq("status", "active");

      if (agents && agents.length > 0) {
        businessContext = `\nThis business uses AgentFlow. Active agents: ${agents.map(a => `${a.name} (${a.role})`).join(", ")}.`;
      }
    }
  } catch (e) {
    console.error("Context fetch error:", e);
  }

  // ── Ask Gemini to reply ──
  let ariaReply = "";
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are Aria, the AI business assistant for AgentFlow — a business automation platform built in Ghana 🇬🇭.${businessContext}

You are responding to a WhatsApp message from a customer.
- Answer clearly and helpfully
- Be warm, professional, and concise — this is WhatsApp
- If you don't know something specific, say you'll pass it on to the team
- Never mention you are an AI unless directly asked
- Plain text only — no markdown, no asterisks
- Keep replies under 100 words
- You can use 1-2 emojis for warmth`
            }]
          },
          contents: [{ role: "user", parts: [{ text: incomingMsg }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.65 }
        })
      }
    );

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    ariaReply = parts.map(p => p.text ?? "").join("").trim();
    if (!ariaReply) ariaReply = "Thanks for your message! We'll get back to you shortly. 👋";
  } catch (err) {
    ariaReply = "Thanks for reaching out! We'll get back to you shortly. 👋";
  }

  // ── Send reply via Twilio ──
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: toNumber,
          To: fromNumber,
          Body: ariaReply,
        }).toString(),
      }
    );
  } catch (err) {
    console.error("Twilio reply error:", err);
  }

  res.setHeader("Content-Type", "text/xml");
  return res.status(200).send("<Response></Response>");
}