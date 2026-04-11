// api/meta-send.js
// ─────────────────────────────────────────────────────────────────────────────
// AgentFlow — Reusable Meta Message Sender
// Call this from any agent or cron job to send a Facebook/Instagram message
//
// POST /api/meta-send
// Body: { platform, recipientId, message, accessToken }
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { platform, recipientId, message, accessToken } = req.body;

  if (!platform || !recipientId || !message || !accessToken) {
    return res.status(400).json({ error: "Missing required fields: platform, recipientId, message, accessToken" });
  }

  if (!["facebook", "instagram"].includes(platform)) {
    return res.status(400).json({ error: "platform must be 'facebook' or 'instagram'" });
  }

  try {
    const result = await sendMetaMessage(platform, recipientId, message, accessToken);
    return res.status(200).json({ success: true, messageId: result.message_id });
  } catch (err) {
    console.error("meta-send error:", err);
    return res.status(500).json({ error: err.message || "Failed to send message" });
  }
}

// ── Core send function (also exported for direct import by other files) ───────
export async function sendMetaMessage(platform, recipientId, messageText, accessToken) {
  const apiVersion = "v19.0";
  const url = `https://graph.facebook.com/${apiVersion}/me/messages?access_token=${accessToken}`;

  const body = {
    recipient: { id: recipientId },
    message: { text: messageText },
    messaging_type: "RESPONSE",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg = data?.error?.message || "Meta API error";
    const errCode = data?.error?.code;

    // Token expired — code 190
    if (errCode === 190) {
      throw new Error("TOKEN_EXPIRED: " + errMsg);
    }

    throw new Error(errMsg);
  }

  return data;
}
