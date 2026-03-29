// api/gmail-callback.js
// Handles OAuth redirect from Google after user authorizes Gmail

export default async function handler(req, res) {
  const { code, state: userId, error } = req.query;

  if (error) {
    return res.status(400).send(`<html><body><script>window.close();</script><p>Authorization failed: ${error}</p></body></html>`);
  }

  if (!code || !userId) {
    return res.status(400).send("Missing code or state");
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = `${process.env.NEXT_PUBLIC_APP_URL || "https://agentflow-rouge-nu.vercel.app"}/api/gmail-callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      console.error("Token exchange failed:", tokens);
      return res.status(400).send(`<html><body><script>window.close();</script><p>Token exchange failed</p></body></html>`);
    }

    // Save tokens to Supabase integrations table
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY // service key for backend writes
    );

    await supabase.from("integrations").upsert({
      user_id: userId,
      name: "gmail",
      connected: true,
      credentials: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry: Date.now() + (tokens.expires_in * 1000),
      },
      connected_at: new Date().toISOString(),
    }, { onConflict: "user_id,name" });

    // Close popup and notify parent window
    return res.status(200).send(`
      <html><body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: "GMAIL_CONNECTED" }, "*");
          }
          window.close();
        </script>
        <p>Gmail connected! You can close this window.</p>
      </body></html>
    `);

  } catch (err) {
    console.error("Gmail callback error:", err);
    return res.status(500).send("Internal error");
  }
}
