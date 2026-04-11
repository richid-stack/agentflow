// api/webhooks/meta.js
// ─────────────────────────────────────────────────────────────────────────────
// AgentFlow — Meta Webhook Handler
// Handles Facebook Messenger + Instagram DM messages via Meta Graph API
//
// GET  /api/webhooks/meta  → Meta verification handshake
// POST /api/webhooks/meta  → Incoming messages
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

// ── Intent Detection ──────────────────────────────────────────────────────────
// Simple keyword router — assigns message to the right agent
const INTENT_MAP = [
  {
    agent: "Rex",
    role: "Appointment Booking",
    keywords: ["book", "appointment", "schedule", "reserve", "session", "slot", "available", "reschedule", "cancel booking"],
  },
  {
    agent: "Finn",
    role: "Invoicing & Payments",
    keywords: ["invoice", "payment", "pay", "owe", "balance", "receipt", "overdue", "amount", "bill", "charge"],
  },
  {
    agent: "Nova",
    role: "Lead Capture",
    keywords: ["price", "pricing", "cost", "quote", "interested", "inquiry", "enquiry", "services", "how much", "partnership", "proposal"],
  },
  {
    agent: "Aria",
    role: "Customer Support",
    keywords: [], // Aria is the default fallback
  },
];

function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const intent of INTENT_MAP) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      return { agent: intent.agent, role: intent.role, intent: intent.keywords.find((kw) => lower.includes(kw)) };
    }
  }
  return { agent: "Aria", role: "Customer Support", intent: "general" };
}

// ── Agent Prompt Builder ──────────────────────────────────────────────────────
function buildSystemPrompt(agentName, role, businessName, platform) {
  const platformNote = platform === "instagram" ? "Instagram DM" : "Facebook Messenger";

  const agentPersonas = {
    Aria: `You are Aria, the customer support agent for ${businessName}. You handle enquiries, complaints, and general questions. Be warm, helpful, and resolve issues quickly. If you truly cannot help, say you'll pass it on to the team.`,
    Rex: `You are Rex, the appointment booking agent for ${businessName}. Help customers schedule, reschedule, or cancel appointments. Ask for their preferred date and time if not given. Confirm clearly.`,
    Finn: `You are Finn, the payments and invoicing agent for ${businessName}. Help customers with payment queries, invoice questions, and billing issues. Be clear about amounts and due dates.`,
    Nova: `You are Nova, the lead capture agent for ${businessName}. Engage potential customers warmly. Understand their needs, collect their contact info (name, phone/email), and let them know the team will follow up.`,
  };

  return `${agentPersonas[agentName] || agentPersonas.Aria}

You are responding via ${platformNote}.
Rules:
- Keep replies under 120 words — this is a chat platform
- Plain text only — no markdown, no asterisks, no bullet symbols
- Be warm and conversational
- You are a business assistant, not an AI — do not say you are AI unless directly asked
- Use 1-2 emojis maximum for warmth
- If you don't know something specific, say you'll get back to them`;
}

// ── Generate AI Reply (Gemini) ────────────────────────────────────────────────
async function generateReply(messageText, agentName, role, businessName, platform) {
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: buildSystemPrompt(agentName, role, businessName, platform) }],
          },
          contents: [{ role: "user", parts: [{ text: messageText }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );
    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    return reply || null;
  } catch (e) {
    console.error("Gemini error:", e);
    return null;
  }
}

// ── Send Message via Meta Graph API ──────────────────────────────────────────
async function sendMetaMessage(platform, recipientId, messageText, accessToken) {
  const apiVersion = "v19.0";

  // Messenger and Instagram use the same /messages endpoint, different recipient field
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
    console.error(`Meta send error [${platform}]:`, JSON.stringify(data));
    throw new Error(data.error?.message || "Meta API error");
  }

  return data;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // ── GET: Webhook Verification (Meta calls this when you save the webhook URL)
  if (req.method === "GET") {
    const mode      = req.query["hub.mode"];
    const token     = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      console.log("✅ Meta webhook verified");
      return res.status(200).send(challenge);
    }

    console.warn("⚠️ Webhook verification failed — token mismatch");
    return res.status(403).json({ error: "Verification failed" });
  }

  // ── POST: Incoming Messages
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;

  // Meta always sends object: "page"
  if (payload.object !== "page" && payload.object !== "instagram") {
    return res.status(200).json({ status: "ignored" }); // Respond 200 so Meta doesn't retry
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Process each entry (Meta can batch multiple pages in one webhook call)
  for (const entry of payload.entry || []) {
    const pageId = entry.id; // Facebook Page ID or Instagram ID

    // ── Find which business owns this page ──
    const { data: business } = await supabase
      .from("businesses")
      .select("id, owner_id, name, fb_access_token, meta_status")
      .or(`page_id.eq.${pageId},instagram_id.eq.${pageId}`)
      .single();

    if (!business || !business.fb_access_token) {
      console.warn(`No business found for page_id: ${pageId}`);
      continue;
    }

    // Process each message in this entry
    const messagingEvents = entry.messaging || entry.changes?.flatMap((c) => c.value?.messages || []) || [];

    for (const event of messagingEvents) {
      // Handle both Messenger format and Instagram webhooks format
      const senderId   = event.sender?.id || event.from?.id;
      const messageText = event.message?.text || event.value?.message || "";

      if (!senderId || !messageText) continue;

      // Ignore echo messages (sent by the page itself)
      if (event.message?.is_echo) continue;

      const platform = payload.object === "instagram" ? "instagram" : "facebook";

      console.log(`📨 [${platform}] from ${senderId}: "${messageText.slice(0, 60)}"`);

      // ── Route to correct agent ──
      const { agent: agentName, role, intent } = detectIntent(messageText);

      // ── Generate AI reply ──
      const reply = await generateReply(
        messageText,
        agentName,
        role,
        business.name,
        platform
      ) || "Thanks for reaching out! Our team will get back to you shortly. 👋";

      // ── Send reply via Meta API ──
      let sendSuccess = true;
      try {
        await sendMetaMessage(platform, senderId, reply, business.fb_access_token);
      } catch (e) {
        console.error("Failed to send Meta reply:", e.message);
        sendSuccess = false;

        // Mark business token as errored
        await supabase
          .from("businesses")
          .update({ meta_status: "error", meta_error: e.message })
          .eq("id", business.id);
      }

      // ── Store conversation in messages table ──
      await supabase.from("messages").insert({
        business_id:   business.id,
        user_id:       business.owner_id,
        sender_id:     senderId,
        platform,
        message_text:  messageText,
        response_text: sendSuccess ? reply : null,
        agent_name:    agentName,
        intent,
        resolved:      sendSuccess,
        escalated:     !sendSuccess,
      });

      // ── Log to agent_logs ──
      await supabase.from("agent_logs").insert({
        agent_id: null,
        user_id:  business.owner_id,
        message:  `${agentName} replied to ${platform} message from ${senderId.slice(0, 8)}... — "${messageText.slice(0, 60)}"`,
        success:  sendSuccess,
      });
    }
  }

  // Always return 200 to Meta — otherwise they'll retry for 24h
  return res.status(200).json({ status: "ok" });
}
