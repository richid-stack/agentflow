// api/gmail-emails.js
// Fetches recent emails from user's Gmail using stored OAuth tokens

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Get stored Gmail tokens
  const { data: intg } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("user_id", userId)
    .eq("name", "gmail")
    .single();

  if (!intg?.credentials?.access_token) {
    return res.status(200).json({ emails: null, message: "Gmail not connected" });
  }

  let accessToken = intg.credentials.access_token;

  // Refresh token if expired
  if (intg.credentials.expiry && Date.now() > intg.credentials.expiry - 60000) {
    try {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: intg.credentials.refresh_token,
          grant_type: "refresh_token",
        }).toString(),
      });
      const refreshData = await refreshRes.json();
      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        await supabase.from("integrations").update({
          credentials: { ...intg.credentials, access_token: accessToken, expiry: Date.now() + (refreshData.expires_in * 1000) }
        }).eq("user_id", userId).eq("name", "gmail");
      }
    } catch (e) {
      console.error("Token refresh error:", e);
    }
  }

  try {
    // Fetch recent emails
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const listData = await listRes.json();

    if (!listData.messages) return res.status(200).json({ emails: [] });

    // Fetch details for each email
    const emails = await Promise.all(
      listData.messages.slice(0, 8).map(async (msg) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        const get = (name) => headers.find(h => h.name === name)?.value || "";
        return {
          id: msg.id,
          threadId: msgData.threadId,
          subject: get("Subject"),
          from: get("From"),
          date: new Date(parseInt(msgData.internalDate)).toLocaleDateString(),
          snippet: msgData.snippet || "",
          unread: (msgData.labelIds || []).includes("UNREAD"),
        };
      })
    );

    return res.status(200).json({ emails });
  } catch (err) {
    console.error("Gmail fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch emails" });
  }
}
