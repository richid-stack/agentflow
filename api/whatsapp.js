// api/whatsapp.js — Vercel Serverless Function
// Handles sending WhatsApp messages via Twilio

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, message, type } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message'" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";

  if (!accountSid || !authToken) {
    return res.status(500).json({ error: "Twilio credentials not configured" });
  }

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
      From: `whatsapp:${from}`,
      To:   `whatsapp:${to}`,
      Body: message,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", data);
      return res.status(400).json({ error: data.message || "Failed to send message" });
    }

    return res.status(200).json({
      success: true,
      sid: data.sid,
      status: data.status,
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}