// api/meta-onboard.js
// ─────────────────────────────────────────────────────────────────────────────
// AgentFlow — Manual Meta Onboarding (Admin)
// Allows admin to manually connect a business's Facebook Page or Instagram
// account without going through OAuth. Just paste the page_id + access_token.
//
// POST /api/meta-onboard
// Body: { adminSecret, userId, businessName, pageId, instagramId, accessToken }
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    adminSecret,    // Must match ADMIN_SECRET env var — protects this endpoint
    userId,         // Supabase user_id of the business owner
    businessName,   // Display name for the business
    pageId,         // Facebook Page ID (from Meta Business Suite)
    instagramId,    // Instagram Business Account ID (optional)
    accessToken,    // Long-lived Page Access Token
  } = req.body;

  // ── Auth check ──
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!userId || !pageId || !accessToken) {
    return res.status(400).json({ error: "Missing required fields: userId, pageId, accessToken" });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // ── Verify the token is valid before saving ──
  try {
    const verifyRes = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${accessToken}`
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData.error) {
      return res.status(400).json({
        error: "Invalid access token",
        detail: verifyData.error?.message || "Token verification failed",
      });
    }

    console.log(`✅ Token valid for page: ${verifyData.name || verifyData.id}`);
  } catch (e) {
    return res.status(500).json({ error: "Could not verify token with Meta API" });
  }

  // ── Upsert business record ──
  const { data: business, error } = await supabase
    .from("businesses")
    .upsert(
      {
        owner_id:        userId,
        name:            businessName || "My Business",
        page_id:         pageId,
        instagram_id:    instagramId || null,
        fb_access_token: accessToken,
        meta_status:     "live",
        meta_error:      null,
        updated_at:      new Date().toISOString(),
      },
      { onConflict: "page_id" }   // If this page was already registered, update it
    )
    .select()
    .single();

  if (error) {
    console.error("Supabase upsert error:", error);
    return res.status(500).json({ error: "Failed to save business", detail: error.message });
  }

  // ── Also update the integrations table so the UI shows "connected" ──
  await supabase.from("integrations").upsert(
    {
      user_id:      userId,
      name:         "facebook",
      connected:    true,
      credentials:  { page_id: pageId, business_id: business.id },
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,name" }
  );

  if (instagramId) {
    await supabase.from("integrations").upsert(
      {
        user_id:      userId,
        name:         "instagram",
        connected:    true,
        credentials:  { instagram_id: instagramId, business_id: business.id },
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,name" }
    );
  }

  console.log(`✅ Business onboarded: ${business.name} (page: ${pageId})`);
  return res.status(200).json({
    success: true,
    business: {
      id:           business.id,
      name:         business.name,
      page_id:      business.page_id,
      instagram_id: business.instagram_id,
      meta_status:  business.meta_status,
    },
  });
}
