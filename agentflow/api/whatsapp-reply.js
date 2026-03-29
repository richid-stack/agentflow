// api/whatsapp-reply.js — Vercel Serverless Function
// Twilio calls this webhook when someone messages your WhatsApp number
// Aria reads the message, asks Gemini, and replies via WhatsApp

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // Twilio sends form data, not JSON
  const body = req.body;
  const incomingMsg = body.Body || "";
  const fromNumber  = body.From || ""; // e.g. "whatsapp:+233541392746"
  const toNumber    = body.To   || ""; // your Twilio sandbox number

  console.log(`📩 Message from ${fromNumber}: ${incomingMsg}`);

  if (!incomingMsg) {
    return res.status(200).send("<Response></Response>");
  }

  // ── Ask Gemini (Aria) to generate a reply ──
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
              text: `You are Aria, the AI business assistant for AgentFlow — a business automation platform built in Ghana 🇬🇭.

You are responding to a WhatsApp message from a customer or business contact.

Your job:
- Answer questions about the business clearly and helpfully
- Help with appointment bookings, enquiries, and support
- Be warm, professional, and concise (this is WhatsApp, keep replies short)
- If you don't know something specific about the business, say you'll pass it on to the team
- Never mention you are an AI unless directly asked
- Use plain text only — no markdown, no asterisks
- Keep replies under 150 words
- You can use 1-2 emojis for warmth`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: incomingMsg }]
          }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.65,
          }
        })
      }
    );

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    ariaReply = parts.map(p => p.text ?? "").join("").trim();

    if (!ariaReply) {
      ariaReply = "Thanks for your message! I'll get back to you shortly. 👋";
    }
  } catch (err) {
    console.error("Gemini error:", err);
    ariaReply = "Thanks for reaching out! We'll get back to you shortly. 👋";
  }

  // ── Send reply back via Twilio WhatsApp ──
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const msgBody = new URLSearchParams({
      From: toNumber,   // your Twilio number
      To:   fromNumber, // the person who messaged
      Body: ariaReply,
    });

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: msgBody.toString(),
      }
    );

    console.log(`✅ Aria replied to ${fromNumber}: ${ariaReply}`);
  } catch (err) {
    console.error("Twilio reply error:", err);
  }

  // Twilio expects a TwiML response (even if empty)
  res.setHeader("Content-Type", "text/xml");
  return res.status(200).send("<Response></Response>");
}
