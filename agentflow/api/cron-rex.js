// api/cron-rex.js
// Runs daily at 8am — Rex sends reminders for tomorrow's appointments

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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: appts } = await supabase
    .from("appointments")
    .select("*")
    .eq("date", tomorrowStr)
    .eq("status", "confirmed");

  if (!appts || appts.length === 0) {
    return new Response(JSON.stringify({ ok: true, msg: "No appointments tomorrow" }), { status: 200 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const results = [];

  const byUser = {};
  appts.forEach(a => {
    if (!byUser[a.user_id]) byUser[a.user_id] = [];
    byUser[a.user_id].push(a);
  });

  for (const [userId, userAppts] of Object.entries(byUser)) {
    const { data: waIntg } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("user_id", userId)
      .eq("name", "whatsapp")
      .eq("connected", true)
      .single();

    const businessNumber = waIntg?.credentials?.businessNumber || process.env.VITE_TEST_WHATSAPP_NUMBER;
    if (!businessNumber) continue;

    const apptList = userAppts.map(a => `• ${a.client_name} — ${a.service} at ${a.time}`).join("\n");
    const dateStr = tomorrow.toLocaleDateString("en-GH", { weekday: "long", day: "numeric", month: "long" });
    const message = `Good morning! Rex here with tomorrow's schedule.\n\n📅 ${dateStr}\n\n${apptList}\n\nTotal: ${userAppts.length} appointment(s). Have a great day!`;

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
        message: `Rex sent reminders for ${userAppts.length} appointment(s) tomorrow`,
        success: res.ok,
      });
      results.push({ user: userId, appointments: userAppts.length, ok: res.ok });
    } catch (e) {
      results.push({ user: userId, ok: false, error: e.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}
