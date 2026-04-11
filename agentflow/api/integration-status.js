// api/integration-status.js
// ─────────────────────────────────────────────────────────────────────────────
// AgentFlow — Integration Status Checker
// Returns live/idle/error status for all integrations, including Meta
//
// POST /api/integration-status
// Body: { userId }
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Fetch all integrations for this user
  const { data: integrations } = await supabase
    .from("integrations")
    .select("name, connected, credentials, connected_at")
    .eq("user_id", userId);

  // Fetch Meta business status
  const { data: business } = await supabase
    .from("businesses")
    .select("meta_status, meta_error, page_id, instagram_id, name")
    .eq("owner_id", userId)
    .single();

  const statusMap = {};

  for (const intg of integrations || []) {
    if (!intg.connected) {
      statusMap[intg.name] = { status: "idle", label: "Not connected" };
      continue;
    }

    // Gmail: check if token is expired
    if (intg.name === "gmail") {
      const expired = intg.credentials?.expiry && Date.now() > intg.credentials.expiry;
      statusMap["gmail"] = {
        status: expired ? "error" : "live",
        label: expired ? "Token expired — reconnect" : "Connected",
        connected_at: intg.connected_at,
      };
      continue;
    }

    // WhatsApp: just check connected flag
    if (intg.name === "whatsapp") {
      statusMap["whatsapp"] = {
        status: intg.credentials?.businessNumber ? "live" : "idle",
        label: intg.credentials?.businessNumber
          ? `Connected (${intg.credentials.businessNumber})`
          : "Number not set",
        connected_at: intg.connected_at,
      };
      continue;
    }

    // Facebook / Instagram: use business meta_status
    if (intg.name === "facebook") {
      statusMap["facebook"] = {
        status: business?.meta_status || "idle",
        label: business?.meta_status === "live"
          ? `Live (${business.name})`
          : business?.meta_status === "error"
          ? `Error: ${business.meta_error || "Token issue"}`
          : "Not connected",
        page_id: business?.page_id,
        connected_at: intg.connected_at,
      };
      continue;
    }

    if (intg.name === "instagram") {
      statusMap["instagram"] = {
        status: business?.meta_status || "idle",
        label: business?.meta_status === "live"
          ? `Live (${business.instagram_id})`
          : business?.meta_status === "error"
          ? `Error: ${business.meta_error || "Token issue"}`
          : "Not connected",
        instagram_id: business?.instagram_id,
        connected_at: intg.connected_at,
      };
      continue;
    }

    // Default: connected = live
    statusMap[intg.name] = { status: "live", connected_at: intg.connected_at };
  }

  return res.status(200).json({ statuses: statusMap, business: business || null });
}
