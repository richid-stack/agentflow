// api/cron-nova.js
// Vercel Cron Job — runs every hour
// Nova scans Gmail for new lead emails and sends WhatsApp alerts

export const config = { runtime: "edge" };

const LEAD_KEYWORDS = [
  "inquiry", "enquiry", "interested", "quote", "pricing", "cost",
  "how much", "available", "book", "appointment", "services", "help",
  "looking for", "need", "want", "contact", "proposal", "partnership"
];

function scoreEmail(subject, body) {
  const text = (subject + " " + body).toLowerCase();
  let score = 0;
  for (const kw of LEAD_KEYWORDS) {
    if (text.includes(kw)) score += 10;
  }
  return Math.min(score, 95);
}

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

  // Get all users with active Nova agents AND Gmail connected
  const { data: novaAgents } = await supabase
    .from("agents")
    .select("user_id")
    .eq("role", "Lead Capture")
    .eq("status", "active");

  if (!novaAgents || novaAgents.length === 0) {
    return new Response(JSON.stringify({ ok: true, msg: "No active Nova agents" }), { status: 200 });
  }

  const results = [];

  for (const agent of novaAgents) {
    // Get Gmail tokens
    const { data: gmailIntg } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("user_id", agent.user_id)
      .eq("name", "gmail")
      .eq("connected", true)
      .single();

    if (!gmailIntg?.credentials?.access_token) continue;

    // Get WhatsApp number
    const { data: waIntg } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("user_id", agent.user_id)
      .eq("name", "whatsapp")
      .eq("connected", true)
      .single();

    const businessNumber = waIntg?.credentials?.businessNumber || process.env.VITE_TEST_WHATSAPP_NUMBER;
    if (!businessNumber) continue;

    try {
      // Fetch recent unread emails from last hour
      const oneHourAgo = Math.floor((Date.now() - 3600000) / 1000);
      const gmailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:unread after:${oneHourAgo}`,
        { headers: { Authorization: `Bearer ${gmailIntg.credentials.access_token}` } }
      );
      const gmailData = await gmailRes.json();

      if (!gmailData.messages || gmailData.messages.length === 0) {
        results.push({ user: agent.user_id, leads: 0 });
        continue;
      }

      // Check each email for lead potential
      const leads = [];
      for (const msg of gmailData.messages.slice(0, 10)) {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
          { headers: { Authorization: `Bearer ${gmailIntg.credentials.access_token}` } }
        );
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        const subject = headers.find(h => h.name === "Subject")?.value || "";
        const from = headers.find(h => h.name === "From")?.value || "";
        const snippet = msgData.snippet || "";
        const score = scoreEmail(subject, snippet);

        if (score >= 30) {
          leads.push({ from, subject, snippet, score });
        }
      }

      if (leads.length === 0) {
        results.push({ user: agent.user_id, leads: 0 });
        continue;
      }

      // Send WhatsApp alert for high-scoring leads
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const topLead = leads.sort((a, b) => b.score - a.score)[0];
      const message = `Nova here — new lead detected in your inbox!\n\nFrom: ${topLead.from}\nSubject: ${topLead.subject}\nIntent Score: ${topLead.score}/100\n\n"${topLead.snippet.slice(0, 100)}..."\n\n${topLead.score >= 70 ? "HIGH INTENT — follow up fast!" : "Added to pipeline."}\n\nTotal new leads this hour: ${leads.length}`;

      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ From: `whatsapp:${fromNumber}`, To: `whatsapp:${businessNumber}`, Body: message }).toString(),
        }
      );

      await supabase.from("agent_logs").insert({
        agent_id: null,
        user_id: agent.user_id,
        message: `Nova captured ${leads.length} lead(s) from Gmail`,
        success: true,
      });

      results.push({ user: agent.user_id, leads: leads.length });
    } catch (e) {
      results.push({ user: agent.user_id, ok: false, error: e.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
