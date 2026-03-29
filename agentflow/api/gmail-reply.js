// api/gmail-reply.js
// Aria reads an email, drafts a smart reply using Gemini, and sends it via Gmail

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, emailId, threadId, to, subject, originalBody } = req.body;
  if (!userId || !to) return res.status(400).json({ error: "Missing required fields" });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Get Gmail tokens
  const { data: intg } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("user_id", userId)
    .eq("name", "gmail")
    .single();

  if (!intg?.credentials?.access_token) {
    return res.status(400).json({ error: "Gmail not connected" });
  }

  // ── Ask Gemini to draft a reply ──
  let draftReply = "";
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are Aria, the AI assistant for AgentFlow — a business automation platform built in Ghana 🇬🇭.
Draft a professional, helpful, and concise email reply.
- Keep it under 100 words
- Be warm and professional
- Sign off as "Aria | AgentFlow Team"
- Plain text only, no markdown`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: `Draft a reply to this email:\nFrom: ${to}\nSubject: ${subject}\nMessage: ${originalBody}` }]
          }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.65 }
        })
      }
    );
    const geminiData = await geminiRes.json();
    draftReply = geminiData?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim()
      || "Thank you for your email. We'll get back to you shortly.\n\nAria | AgentFlow Team";
  } catch (e) {
    draftReply = "Thank you for reaching out. We'll respond to your enquiry shortly.\n\nAria | AgentFlow Team";
  }

  // ── Send via Gmail API ──
  try {
    const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
    const emailContent = [
      `To: ${to}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${emailId}`,
      `References: ${emailId}`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      draftReply,
    ].join("\n");

    const encoded = Buffer.from(emailContent).toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const sendRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${intg.credentials.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encoded, threadId }),
      }
    );

    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      console.error("Gmail send error:", sendData);
      return res.status(400).json({ error: sendData.error?.message || "Failed to send" });
    }

    return res.status(200).json({ success: true, messageId: sendData.id, reply: draftReply });
  } catch (err) {
    console.error("Gmail reply error:", err);
    return res.status(500).json({ error: "Failed to send reply" });
  }
}
