// api/cron-finn.js
// Runs daily at 9am — Finn sends payment reminders for overdue invoices

export const config = { runtime: "edge" };

export default async function handler(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const today = new Date().toISOString().split("T")[0];

  // Get all pending invoices where due_date has passed
  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("status", "pending")
    .lt("due_date", today);

  // Mark them as overdue
  if (overdueInvoices && overdueInvoices.length > 0) {
    const ids = overdueInvoices.map(i => i.id);
    await supabase.from("invoices").update({ status: "overdue" }).in("id", ids);
  }

  // Get all overdue invoices
  const { data: allOverdue } = await supabase
    .from("invoices")
    .select("*")
    .eq("status", "overdue");

  if (!allOverdue || allOverdue.length === 0) {
    return new Response(JSON.stringify({ ok: true, msg: "No overdue invoices" }), { status: 200 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const results = [];

  const byUser = {};
  allOverdue.forEach(inv => {
    if (!byUser[inv.user_id]) byUser[inv.user_id] = [];
    byUser[inv.user_id].push(inv);
  });

  for (const [userId, userInvoices] of Object.entries(byUser)) {
    const { data: waIntg } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("user_id", userId)
      .eq("name", "whatsapp")
      .eq("connected", true)
      .single();

    const businessNumber = waIntg?.credentials?.businessNumber || process.env.VITE_TEST_WHATSAPP_NUMBER;
    if (!businessNumber) continue;

    const totalOwed = userInvoices.reduce((s, i) => s + Number(i.amount), 0);
    const invList = userInvoices.map(i => `• ${i.client_name} — GHS ${Number(i.amount).toLocaleString()} (${i.invoice_number})`).join("\n");

    const message = `Finn here — overdue payment alert!\n\n⚠️ ${userInvoices.length} invoice(s) are overdue:\n\n${invList}\n\nTotal outstanding: GHS ${totalOwed.toLocaleString()}\n\nFinn has queued reminder messages to these clients. Reply PAID [invoice#] to mark any as settled.`;

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ From: `whatsapp:${fromNumber}`, To: `whatsapp:${businessNumber}`, Body: message }).toString(),
        }
      );
      await supabase.from("agent_logs").insert({
        agent_id: null, user_id: userId,
        message: `Finn flagged ${userInvoices.length} overdue invoice(s) — GHS ${totalOwed.toLocaleString()} outstanding`,
        success: res.ok,
      });
      results.push({ user: userId, overdue: userInvoices.length, total: totalOwed, ok: res.ok });
    } catch (e) {
      results.push({ user: userId, ok: false, error: e.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}
