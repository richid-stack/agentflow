/**
 * AgentFlow Backend — Node.js + Express + Supabase + Gemini
 * Run: npm install && node server.js
 */

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Clients ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Gemini helper ──────────────────────────────────────────────────────────
async function callGemini(systemPrompt, userMessage) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.82, topP: 0.92 },
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I couldn't generate a response right now.";
}

// ══════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  const { email, password, business_name } = req.body;
  const { data, error } = await supabase.auth.admin.createUser({
    email, password,
    user_metadata: { business_name },
  });
  if (error) return res.status(400).json({ error: error.message });

  // Create free tier subscription record
  await supabase.from("subscriptions").insert({
    user_id: data.user.id,
    plan: "free",
    agent_limit: 2,
    tasks_limit: 500,
  });

  res.json({ user: data.user });
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  res.json({ session: data.session, user: data.user });
});

// ══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE — verify JWT
// ══════════════════════════════════════════════════════════════════════════
async function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: "Invalid token" });
  req.user = data.user;
  next();
}

// ══════════════════════════════════════════════════════════════════════════
// AGENTS
// ══════════════════════════════════════════════════════════════════════════

// GET /agents
app.get("/agents", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("agents")
    .select("*, agent_logs(id, message, success, created_at)")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /agents
app.post("/agents", auth, async (req, res) => {
  const { name, role, icon, color, description } = req.body;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("agent_limit")
    .eq("user_id", req.user.id)
    .single();

  const { count } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", req.user.id);

  if (count >= sub.agent_limit) {
    return res.status(403).json({ error: "Agent limit reached. Upgrade your plan." });
  }

  const { data, error } = await supabase.from("agents").insert({
    user_id: req.user.id,
    name, role, icon, color,
    description: description || `Agent handling ${role} tasks.`,
    status: "idle",
    tasks_completed: 0,
    success_rate: 100,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /agents/:id
app.patch("/agents/:id", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("agents")
    .update(req.body)
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /agents/:id
app.delete("/agents/:id", auth, async (req, res) => {
  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════
// AGENT LOGS
// ══════════════════════════════════════════════════════════════════════════

app.post("/agents/:id/log", auth, async (req, res) => {
  const { message, success = true } = req.body;

  await supabase.from("agent_logs").insert({
    agent_id: req.params.id,
    user_id: req.user.id,
    message,
    success,
  });

  const { data: agent } = await supabase
    .from("agents").select("tasks_completed, success_rate")
    .eq("id", req.params.id).single();

  const newTotal = agent.tasks_completed + 1;
  const successCount = Math.round(agent.success_rate * agent.tasks_completed / 100) + (success ? 1 : 0);
  const newRate = Math.round((successCount / newTotal) * 100);

  await supabase.from("agents").update({
    tasks_completed: newTotal,
    success_rate: newRate,
  }).eq("id", req.params.id);

  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════
// AI COMMAND — Chat with Aria (Gemini 2.5 Flash)
// ══════════════════════════════════════════════════════════════════════════

app.post("/command", auth, async (req, res) => {
  const { message } = req.body;

  // Fetch live agent data for context
  const { data: agents } = await supabase
    .from("agents")
    .select("name, role, status, tasks_completed, success_rate")
    .eq("user_id", req.user.id);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, agent_limit, tasks_limit")
    .eq("user_id", req.user.id)
    .single();

  const totalTasks = agents.reduce((s, a) => s + a.tasks_completed, 0);
  const avgSuccess = agents.length
    ? Math.round(agents.reduce((s, a) => s + a.success_rate, 0) / agents.length)
    : 0;
  const activeAgents = agents.filter(a => a.status === "active").length;

  const systemPrompt = `You are Aria, the intelligent AI operations manager for AgentFlow — a business automation platform.

Current platform state:
- Agents: ${agents.map(a => `${a.name} (${a.role}, ${a.status}, ${a.tasks_completed} tasks, ${a.success_rate}% success)`).join("; ")}
- Active agents: ${activeAgents}/${agents.length}
- Total tasks completed: ${totalTasks}
- Hours saved: ${Math.round(totalTasks * 0.65)}h
- Overall success rate: ${avgSuccess}%
- Current plan: ${sub?.plan || "free"} (${sub?.agent_limit || 2} agent limit)

Your personality: Sharp, proactive, data-driven, friendly but efficient. Think like a smart COO with full operational visibility.

Instructions:
- Give thorough, helpful, complete answers — never cut yourself off.
- Use line breaks to structure longer responses for readability.
- Reference actual agent names, real numbers, and specific data when relevant.
- Proactively suggest improvements, spot patterns, flag issues.
- Plain text only. No markdown, no asterisks. Use line breaks and natural language.
- Use emojis sparingly for warmth.`;

  try {
    const reply = await callGemini(systemPrompt, message);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// METRICS / DASHBOARD
// ══════════════════════════════════════════════════════════════════════════

app.get("/metrics", auth, async (req, res) => {
  const userId = req.user.id;

  const [{ data: agents }, { count: totalLogs }, { data: sub }] = await Promise.all([
    supabase.from("agents").select("tasks_completed, success_rate, status").eq("user_id", userId),
    supabase.from("agent_logs").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("subscriptions").select("plan, agent_limit").eq("user_id", userId).single(),
  ]);

  const totalTasks = agents.reduce((s, a) => s + a.tasks_completed, 0);
  const avgSuccess = agents.length
    ? Math.round(agents.reduce((s, a) => s + a.success_rate, 0) / agents.length)
    : 0;
  const activeAgents = agents.filter(a => a.status === "active").length;
  const hoursSaved = Math.round(totalTasks * 0.65);

  res.json({
    totalTasks,
    hoursSaved,
    avgSuccess,
    activeAgents,
    totalAgents: agents.length,
    totalLogs,
    plan: sub?.plan || "free",
    agentLimit: sub?.agent_limit || 2,
  });
});

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ══════════════════════════════════════════════════════════════════════════

app.get("/integrations", auth, async (req, res) => {
  const { data } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", req.user.id);
  res.json(data || []);
});

app.post("/integrations/:name/connect", auth, async (req, res) => {
  const { name } = req.params;
  const { credentials } = req.body;

  const { data, error } = await supabase.from("integrations").upsert({
    user_id: req.user.id,
    name,
    connected: true,
    credentials,
    connected_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/integrations/:name/disconnect", auth, async (req, res) => {
  await supabase.from("integrations")
    .update({ connected: false, credentials: null })
    .eq("user_id", req.user.id)
    .eq("name", req.params.name);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════
// STRIPE BILLING
// ══════════════════════════════════════════════════════════════════════════

const PLANS = {
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID, agents: 5,   tasks: 2000   },
  pro:     { priceId: process.env.STRIPE_PRO_PRICE_ID,     agents: 15,  tasks: 10000  },
  agency:  { priceId: process.env.STRIPE_AGENCY_PRICE_ID,  agents: 999, tasks: 999999 },
};

app.post("/billing/checkout", auth, async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: "Invalid plan" });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/billing`,
    metadata: { user_id: req.user.id, plan },
    customer_email: req.user.email,
  });

  res.json({ url: session.url });
});

app.post("/billing/portal", auth, async (req, res) => {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", req.user.id)
    .single();

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.APP_URL}/billing`,
  });

  res.json({ url: session.url });
});

app.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send("Webhook error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { user_id, plan } = session.metadata;
    await supabase.from("subscriptions").upsert({
      user_id,
      plan,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      agent_limit: PLANS[plan].agents,
      tasks_limit: PLANS[plan].tasks,
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await supabase.from("subscriptions")
      .update({ plan: "free", agent_limit: 2, tasks_limit: 500 })
      .eq("stripe_subscription_id", sub.id);
  }

  res.json({ received: true });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgentFlow API running on :${PORT}`));