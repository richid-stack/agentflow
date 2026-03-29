import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PLANS = [
  { id: "free", name: "Free", price: 0, agents: 2, tasks: 500, features: ["2 agents", "500 tasks/mo", "3 integrations", "Community support"], color: "#00FFB2" },
  { id: "starter", name: "Starter", price: 49, agents: 5, tasks: 2000, features: ["5 agents", "2,000 tasks/mo", "All integrations", "Email support"], color: "#60A5FA" },
  { id: "pro", name: "Pro", price: 129, agents: 15, tasks: 10000, features: ["15 agents", "10,000 tasks/mo", "Priority support", "Analytics", "Webhooks"], color: "#00FFB2", popular: true },
  { id: "agency", name: "Agency", price: 399, agents: 999, tasks: 999999, features: ["Unlimited agents", "Unlimited tasks", "White-label", "Dedicated support"], color: "#FFD600" },
];

const AGENTS = [
  { id: 1, name: "Aria", role: "Customer Support", icon: "💬", status: "active", tasks: 142, successRate: 97, color: "#00FFB2", description: "Handles WhatsApp and email enquiries, resolves complaints, and escalates only when needed.", triggers: ["WhatsApp message received", "New email enquiry", "Contact form submitted"], actions: ["Send instant reply", "Create support ticket", "Escalate to human agent"], logs: [{ msg: "Resolved complaint from Ama K. — late delivery refund approved", ok: true, time: "4m ago" }, { msg: "Replied to 6 WhatsApp enquiries", ok: true, time: "31m ago" }, { msg: "Escalated billing dispute #4819 to human — needs review", ok: false, time: "2h ago" }] },
  { id: 2, name: "Rex", role: "Appointment Booking", icon: "📅", status: "active", tasks: 89, successRate: 100, color: "#FFD600", description: "Books appointments via WhatsApp and SMS, sends reminders, and prevents double-booking.", triggers: ["Booking request via WhatsApp", "Calendar slot opens up", "Daily 8am check"], actions: ["Confirm appointment", "Send SMS reminder 24h before", "Reschedule on conflict"], logs: [{ msg: "Booked 3 appointments for Friday — all confirmed via SMS", ok: true, time: "12m ago" }, { msg: "Sent reminder to 5 clients for tomorrow's sessions", ok: true, time: "1h ago" }] },
  { id: 3, name: "Finn", role: "Invoicing & Payments", icon: "🧾", status: "idle", tasks: 54, successRate: 99, color: "#FF6B6B", description: "Generates invoices after jobs are completed and follows up on overdue payments automatically.", triggers: ["Job marked complete", "Payment 3 days overdue", "End of month"], actions: ["Generate and send invoice", "Send payment reminder via WhatsApp", "Flag unresolved debts"], logs: [{ msg: "Invoice #INV-0094 sent to Darko Enterprises — GHS 4,800", ok: true, time: "2h ago" }, { msg: "Payment reminder sent to 2 clients with overdue balances", ok: true, time: "5h ago" }] },
  { id: 4, name: "Nova", role: "Lead Capture", icon: "🎯", status: "active", tasks: 201, successRate: 94, color: "#A78BFA", description: "Captures leads from all channels, scores them by intent, and notifies the sales team instantly.", triggers: ["Website form submitted", "WhatsApp enquiry received", "Email from new contact"], actions: ["Score lead by intent", "Add to pipeline", "Notify sales team on WhatsApp"], logs: [{ msg: "Captured 3 new leads from website — 2 scored high intent", ok: true, time: "9m ago" }, { msg: "Qualified: Mensah & Sons (Score: 91) — notified sales team", ok: true, time: "44m ago" }] },
];

const INTEGRATIONS = [
  { name: "WhatsApp", icon: "📱", connected: true, desc: "Send/receive messages" },
  { name: "Gmail", icon: "📧", connected: true, desc: "Email automation" },
  { name: "Stripe", icon: "💳", connected: false, desc: "Payments & invoicing" },
  { name: "QuickBooks", icon: "📊", connected: true, desc: "Accounting sync" },
  { name: "Calendar", icon: "🗓️", connected: true, desc: "Scheduling" },
  { name: "Slack", icon: "💬", connected: false, desc: "Team notifications" },
  { name: "Zapier", icon: "⚡", connected: false, desc: "1000+ connections" },
  { name: "HubSpot", icon: "🎯", connected: false, desc: "CRM & pipeline" },
];

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "agents", label: "Agents", icon: "◉" },
  { id: "command", label: "Command", icon: "◎" },
  { id: "integrations", label: "Connect", icon: "◇" },
  { id: "billing", label: "Billing", icon: "◆" },
];

function useTypewriter(text, speed = 14, active = true) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setOut(text); setDone(true); return; }
    setOut(""); setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text, active]);
  return { out, done };
}

function AriaBubble({ text, animate }) {
  const { out, done } = useTypewriter(text, 14, animate);
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", animation: "fadeUp .35s ease" }}>
      <div style={{ width: "34px", height: "34px", minWidth: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", boxShadow: "0 0 18px rgba(0,255,178,.4)", marginTop: "2px" }}>💬</div>
      <div style={{ maxWidth: "82%", padding: "13px 16px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.18)", borderRadius: "4px 14px 14px 14px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontSize: "13px", lineHeight: "1.75", color: "#BDFFD9", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
        {out}{!done && <span style={{ display: "inline-block", width: "2px", height: "13px", background: "#00FFB2", marginLeft: "2px", animation: "blink .65s infinite", verticalAlign: "middle" }} />}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", animation: "fadeUp .3s ease" }}>
      <div style={{ maxWidth: "82%", padding: "12px 16px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "14px 4px 14px 14px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", fontSize: "13px", lineHeight: "1.65", color: "#E0E0E0", wordBreak: "break-word" }}>{text}</div>
    </div>
  );
}

function Pill({ active, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "20px", fontSize: "10px", letterSpacing: ".05em", background: active ? "rgba(0,255,178,.1)" : "rgba(255,255,255,.05)", border: `1px solid ${active ? "rgba(0,255,178,.22)" : "rgba(255,255,255,.1)"}`, color: active ? "#00FFB2" : "#666", whiteSpace: "nowrap" }}>
      <span style={{ width: "5px", height: "5px", minWidth: "5px", borderRadius: "50%", background: active ? "#00FFB2" : "#444", boxShadow: active ? "0 0 6px #00FFB2" : "none", animation: active ? "pulse 2s infinite" : "none" }} />
      {label || (active ? "LIVE" : "IDLE")}
    </span>
  );
}

function Glass({ children, style = {}, onClick, hover = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: hov ? "rgba(0,255,178,.028)" : "rgba(255,255,255,.03)",
        border: hov ? "1px solid rgba(0,255,178,.18)" : "1px solid rgba(255,255,255,.08)",
        borderRadius: "18px",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all .25s cubic-bezier(.16,1,.3,1)",
        ...style
      }}>
      {children}
    </div>
  );
}

// ── Auth Form Component ──────────────────────────────────────
function AuthForm({ supabase }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handle = async () => {
    setAuthLoading(true); setError(""); setMessage("");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    }
    setAuthLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "10px", color: "#fff", fontSize: "13px", fontFamily: "inherit", outline: "none", marginBottom: "10px" };
  const btnStyle = { width: "100%", padding: "13px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", letterSpacing: ".06em", marginTop: "6px" };

  return (
    <div style={{ width: "100%", maxWidth: "360px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "18px", padding: "28px" }}>
      <div style={{ fontSize: "9px", color: "#777", letterSpacing: ".2em", marginBottom: "20px", textAlign: "center" }}>{mode === "signin" ? "SIGN IN TO YOUR WORKSPACE" : "CREATE YOUR ACCOUNT"}</div>
      <input style={inputStyle} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={e => e.target.style.borderColor="rgba(0,255,178,.35)"} onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"} />
      <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onFocus={e => e.target.style.borderColor="rgba(0,255,178,.35)"} onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"} onKeyDown={e => e.key === "Enter" && handle()} />
      {error && <div style={{ color: "#FF6B6B", fontSize: "11px", marginBottom: "10px", padding: "8px 12px", background: "rgba(255,107,107,.06)", borderRadius: "7px", border: "1px solid rgba(255,107,107,.15)" }}>{error}</div>}
      {message && <div style={{ color: "#00FFB2", fontSize: "11px", marginBottom: "10px", padding: "8px 12px", background: "rgba(0,255,178,.06)", borderRadius: "7px", border: "1px solid rgba(0,255,178,.15)" }}>{message}</div>}
      <button style={btnStyle} onClick={handle} disabled={authLoading}>{authLoading ? "Please wait..." : mode === "signin" ? "Sign In →" : "Create Account →"}</button>
      <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "#666" }}>
        {mode === "signin" ? "No account? " : "Have an account? "}
        <span style={{ color: "#00FFB2", cursor: "pointer" }} onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>
          {mode === "signin" ? "Sign up" : "Sign in"}
        </span>
      </div>
    </div>
  );
}

export default function AgentFlow() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [selAgent, setSelAgent] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", role: "", icon: "🤖" });
  const [chatLog, setChatLog] = useState([
    { from: "aria", text: "Hey! I'm Aria, your AI ops manager 👋\n\nLoading your agents and data...", id: 0, fresh: false }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [toast, setToast] = useState(null);
  const [msgId, setMsgId] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const chatRef = useRef(null);
  const plan = PLANS.find(p => p.id === planId);

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog]);

  // ── Auth: get current user ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load all data when user is ready ──
  useEffect(() => {
    if (!user) { setDbLoading(false); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setDbLoading(true);
    await Promise.all([loadAgents(), loadIntegrations(), loadSubscription()]);
    setDbLoading(false);
  };

  const loadAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*, agent_logs(*)")
      .order("created_at", { ascending: true });
    if (error) { console.error("agents:", error); return; }
    // Map DB shape → app shape
    const mapped = (data || []).map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      icon: a.icon || "🤖",
      color: a.color || "#00FFB2",
      description: a.description || "",
      status: a.status || "idle",
      tasks: a.tasks_completed || 0,
      successRate: a.success_rate || 100,
      triggers: (() => {
        const t = {
          "Customer Support": ["WhatsApp message received", "New email enquiry", "Contact form submitted"],
          "Appointment Booking": ["Booking request via WhatsApp", "Calendar slot opens up", "Daily 8am check"],
          "Invoicing & Payments": ["Job marked complete", "Payment 3 days overdue", "End of month"],
          "Lead Capture": ["Website form submitted", "WhatsApp enquiry received", "Email from new contact"],
        };
        return t[a.role] || ["Manual trigger"];
      })(),
      actions: (() => {
        const ac = {
          "Customer Support": ["Send instant reply", "Create support ticket", "Escalate to human agent"],
          "Appointment Booking": ["Confirm appointment", "Send SMS reminder 24h before", "Reschedule on conflict"],
          "Invoicing & Payments": ["Generate and send invoice", "Send payment reminder via WhatsApp", "Flag unresolved debts"],
          "Lead Capture": ["Score lead by intent", "Add to pipeline", "Notify sales team on WhatsApp"],
        };
        return ac[a.role] || ["Execute task"];
      })(),
      logs: (a.agent_logs || [])
        .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
        .slice(0, 5)
        .map(l => ({
          msg: l.message,
          ok: l.success,
          time: timeAgo(l.created_at),
        })),
    }));
    setAgents(mapped);
    // Update Aria greeting with real data
    if (mapped.length > 0) {
      const active = mapped.filter(a => a.status === "active").length;
      const totalTasks = mapped.reduce((s, a) => s + a.tasks, 0);
      const rate = Math.round(mapped.reduce((s, a) => s + a.successRate, 0) / mapped.length);
      setChatLog([{
        from: "aria",
        text: `Hey! I'm Aria, your AI ops manager 👋\n\n${active} of your ${mapped.length} agents are live right now. ${totalTasks} tasks completed so far with a ${rate}% success rate.\n\nWhat do you need?`,
        id: 0,
        fresh: false,
      }]);
    } else {
      setChatLog([{
        from: "aria",
        text: "Hey! I'm Aria, your AI ops manager 👋\n\nNo agents deployed yet. Head to the Agents tab and deploy your first one — it only takes a minute.\n\nWhat do you need?",
        id: 0,
        fresh: false,
      }]);
    }
  };

  const loadIntegrations = async () => {
    const { data, error } = await supabase.from("integrations").select("*");
    if (error) { console.error("integrations:", error); return; }
    // Merge DB state into default integrations list
    setIntegrations(INTEGRATIONS.map(intg => {
      const found = (data || []).find(d => d.name.toLowerCase() === intg.name.toLowerCase());
      return found ? { ...intg, connected: found.connected } : intg;
    }));
  };

  const loadSubscription = async () => {
    const { data, error } = await supabase.from("subscriptions").select("*").single();
    if (error) return; // no sub yet = free plan
    if (data?.plan) setPlanId(data.plan);
  };

  // ── Helpers ──
  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const metrics = {
    tasks: agents.reduce((s, a) => s + a.tasks, 0),
    hours: Math.round(agents.reduce((s, a) => s + a.tasks, 0) * 0.65),
    active: agents.filter(a => a.status === "active").length,
    rate: agents.length ? Math.round(agents.reduce((s, a) => s + a.successRate, 0) / agents.length) : 100,
  };

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const sendChat = async () => {
    if (!chatInput.trim() || loading) return;
    const msg = chatInput.trim();
    const id = msgId;
    setMsgId(c => c + 2);
    setChatInput("");
    setChatLog(prev => [...prev.map(m => ({ ...m, fresh: false })), { from: "user", text: msg, id }]);
    setLoading(true);

    const systemPrompt = `You are Aria, the intelligent AI operations manager for AgentFlow — a business automation platform built in Ghana 🇬🇭.

Current platform state:
- Agents: ${agents.map(a => `${a.name} (${a.role}, ${a.status}, ${a.tasks} tasks completed, ${a.successRate}% success rate)`).join("; ")}
- Active agents: ${metrics.active}/${agents.length}
- Total tasks completed: ${metrics.tasks}
- Hours saved for the business: ${metrics.hours}h
- Overall success rate: ${metrics.rate}%
- Integrations connected: ${integrations.filter(i => i.connected).map(i => i.name).join(", ")}
- Current plan: ${plan.name} at $${plan.price}/mo

Your personality: Sharp, proactive, data-driven, friendly but efficient. You are genuinely intelligent and give real, useful, complete answers. You think like a smart COO who has full visibility of the business operations.

Instructions:
- Give thorough, helpful answers. Don't cut yourself off.
- Use line breaks to structure longer responses for readability.
- Reference actual agent names, real numbers, and specific data when relevant.
- Proactively suggest improvements, spot patterns, flag issues.
- If asked for a summary or report, actually give one — don't just say "here's a summary" and give 1 sentence.
- Use plain text only. No markdown, no asterisks, no bullet symbols — use line breaks and natural language structure.
- You can use emojis sparingly for warmth.
- Never say you "cannot" help with something related to the platform.`;

    try {
      // Build full conversation history for Gemini (role: user/model alternating)
      const history = chatLog
        .filter(m => m.from === "user" || m.from === "aria")
        .map(m => ({
          role: m.from === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [...history, { role: "user", parts: [{ text: msg }] }],
            generationConfig: { maxOutputTokens: 600, temperature: 0.65, topP: 0.92 },
          }),
        }
      );
      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason;
      // Collect all text parts (Gemini sometimes splits across multiple parts)
      const allParts = candidate?.content?.parts ?? [];
      const rawText = allParts.map(p => p.text ?? "").join("").trim();

      let reply;
      if (rawText) {
        // If cut off by safety filter, append a note instead of silently truncating
        reply = rawText + (finishReason === "SAFETY" ? "\n\n(Response flagged by safety filter — try rephrasing.)" : "");
      } else if (finishReason === "SAFETY" || finishReason === "RECITATION") {
        reply = "I wasn't able to complete that response — Gemini's safety filter stepped in. Try rephrasing your question.";
      } else {
        reply = data?.error?.message || "I ran into an issue fetching a response. Please try again.";
      }
      setChatLog(prev => [...prev, { from: "aria", text: reply, id: id + 1, fresh: true }]);
    } catch (e) {
      setChatLog(prev => [...prev, { from: "aria", text: `Connection error: ${e.message}. Check your network and try again.`, id: id + 1, fresh: true }]);
    }
    setLoading(false);
  };

  const createAgent = async () => {
    if (agents.length >= plan.agents) { setShowUpgrade(true); return; }
    if (!newAgent.name || !newAgent.role) return;
    const colors = ["#00FFB2", "#FFD600", "#FF6B6B", "#A78BFA", "#60A5FA"];
    const color = colors[agents.length % colors.length];

    if (user) {
      // Save to Supabase
      const { data, error } = await supabase.from("agents").insert({
        user_id: user.id,
        name: newAgent.name,
        role: newAgent.role,
        icon: newAgent.icon,
        color,
        status: "idle",
        tasks_completed: 0,
        success_rate: 100,
        description: `Handles ${newAgent.role} tasks automatically.`,
      }).select().single();
      if (error) { notify("Failed to deploy agent. Try again."); return; }
      // Also log the deployment
      await supabase.from("agent_logs").insert({
        agent_id: data.id,
        user_id: user.id,
        message: "Agent deployed and ready.",
        success: true,
      });
      await loadAgents();
    } else {
      // No auth — local only (demo mode)
      const agent = {
        id: Date.now(), ...newAgent, color,
        status: "idle", tasks: 0, successRate: 100,
        description: `Handles ${newAgent.role} tasks automatically.`,
        triggers: ["Manual trigger"], actions: ["Execute task"],
        logs: [{ msg: "Agent deployed and ready.", ok: true, time: "just now" }]
      };
      setAgents(p => [...p, agent]);
    }
    setNewAgent({ name: "", role: "", icon: "🤖" });
    setShowBuilder(false);
    notify(`${newAgent.name} deployed! 🚀`);
  };

  // ── Trigger agent action → sends real WhatsApp notification ──
  const triggerAgent = async (agent, triggerType, data = {}) => {
    const notifyNumber = import.meta.env.VITE_TEST_WHATSAPP_NUMBER;
    if (!notifyNumber) { notify("Set VITE_TEST_WHATSAPP_NUMBER in .env to receive alerts"); return; }
    notify(`${agent.name} triggered — sending WhatsApp alert...`);
    try {
      const res = await fetch("/api/agent-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName: agent.name, triggerType, data, notifyNumber }),
      });
      const result = await res.json();
      if (result.success) {
        notify(`✅ ${agent.name} sent WhatsApp alert!`);
        // Log the action to Supabase
        if (user) {
          await supabase.from("agent_logs").insert({
            agent_id: agent.id,
            user_id: user.id,
            message: `Triggered: ${triggerType.replace(/_/g, " ")}`,
            success: true,
          });
          // Increment tasks_completed
          await supabase.from("agents")
            .update({ tasks_completed: agent.tasks + 1 })
            .eq("id", agent.id);
          await loadAgents();
        }
      } else {
        notify(`${agent.name} error: ${result.error}`);
      }
    } catch (e) {
      notify(`Connection error: ${e.message}`);
    }
  };

  const SidebarContent = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
        <div style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "9px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: "900", color: "#04050A", fontSize: "16px", boxShadow: "0 0 20px rgba(0,255,178,.35)" }}>A</div>
        <div>
          <div style={{ color: "#fff", fontWeight: "700", fontSize: "13px", fontFamily: "'Syne',sans-serif" }}>AgentFlow</div>
          <div style={{ color: "#00FFB2", fontSize: "8px", letterSpacing: ".2em" }}>GHANA 🇬🇭</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setDrawerOpen(false); }}
            style={{
              display: "flex", gap: "11px", alignItems: "center", padding: "10px 13px",
              borderRadius: "10px", border: "none", cursor: "pointer",
              background: tab === t.id ? "rgba(0,255,178,.09)" : "transparent",
              color: tab === t.id ? "#00FFB2" : "#888",
              fontSize: "12px", fontFamily: "inherit", textAlign: "left", width: "100%",
              borderLeft: tab === t.id ? "2px solid #00FFB2" : "2px solid transparent",
              transition: "all .15s",
            }}
            onMouseEnter={e => { if (tab !== t.id) { e.currentTarget.style.background = "rgba(0,255,178,.05)"; e.currentTarget.style.color = "#ccc"; } }}
            onMouseLeave={e => { if (tab !== t.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; } }}
          >
            <span style={{ fontSize: "13px" }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <div style={{ padding: "13px", background: "rgba(0,255,178,.04)", border: "1px solid rgba(0,255,178,.1)", borderRadius: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".2em", marginBottom: "3px" }}>CURRENT PLAN</div>
          <div style={{ color: "#00FFB2", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "15px" }}>{plan.name}</div>
          <div style={{ fontSize: "10px", color: "#888", marginBottom: "8px" }}>{agents.length}/{plan.agents} agents used</div>
          <div style={{ height: "2px", background: "rgba(255,255,255,.07)", borderRadius: "1px" }}>
            <div style={{ height: "100%", borderRadius: "1px", width: `${Math.min((agents.length / plan.agents) * 100, 100)}%`, background: agents.length >= plan.agents ? "#FF6B6B" : "#00FFB2", boxShadow: "0 0 8px rgba(0,255,178,.4)", transition: "width .5s" }} />
          </div>
          <button onClick={() => setShowUpgrade(true)} style={{ marginTop: "9px", width: "100%", padding: "7px", background: "rgba(0,255,178,.08)", border: "1px solid rgba(0,255,178,.14)", borderRadius: "7px", color: "#00FFB2", cursor: "pointer", fontSize: "10px", fontFamily: "inherit", letterSpacing: ".08em", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,178,.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,255,178,.08)"; }}
          >↑ UPGRADE</button>
        </div>
        <div style={{ display: "flex", gap: "9px", alignItems: "center" }}>
          <div style={{ width: "28px", height: "28px", minWidth: "28px", borderRadius: "8px", background: "rgba(0,255,178,.08)", border: "1px solid rgba(0,255,178,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👤</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#ccc", fontSize: "10px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email?.split("@")[0] || "Your Business"}</div>
            <div style={{ color: "#888", fontSize: "9px" }}>Ghana 🇬🇭</div>
          </div>
          <button onClick={() => supabase.auth.signOut()} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: "13px", padding: "3px", transition: "color .15s", flexShrink: 0 }}
            onMouseEnter={e => e.target.style.color="#FF6B6B"}
            onMouseLeave={e => e.target.style.color="#555"}
          >⏻</button>
        </div>
      </div>
    </>
  );

  // ── Loading screen ──
  if (dbLoading) return (
    <div style={{ minHeight: "100vh", background: "#04050A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "13px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#04050A", fontSize: "24px", marginBottom: "20px", boxShadow: "0 0 30px rgba(0,255,178,.4)" }}>A</div>
      <div style={{ color: "#00FFB2", fontSize: "11px", letterSpacing: ".25em", marginBottom: "24px" }}>LOADING YOUR WORKSPACE</div>
      <div style={{ width: "120px", height: "2px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#00FFB2", borderRadius: "2px", animation: "slideLoad 1.4s ease infinite" }} />
      </div>
      <style>{`@keyframes slideLoad{0%{width:0;margin-left:0}50%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}`}</style>
    </div>
  );

  // ── Auth gate — show sign in if no user ──
  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#04050A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", padding: "24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ width: "48px", height: "48px", borderRadius: "13px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#04050A", fontSize: "24px", marginBottom: "20px", boxShadow: "0 0 30px rgba(0,255,178,.4)", fontFamily: "'Syne',sans-serif" }}>A</div>
      <div style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: "800", fontSize: "22px", marginBottom: "8px" }}>AgentFlow</div>
      <div style={{ color: "#00FFB2", fontSize: "9px", letterSpacing: ".25em", marginBottom: "40px" }}>GHANA 🇬🇭</div>
      <AuthForm supabase={supabase} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#04050A", color: "#E0E0E0", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(0,255,178,.2);border-radius:2px}
        input::placeholder,textarea::placeholder{color:#555}
        input:focus,textarea:focus{outline:none!important;border-color:rgba(0,255,178,.35)!important;background:rgba(255,255,255,.05)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 6px #00FFB2}50%{opacity:.4;box-shadow:0 0 2px #00FFB2}}
        @keyframes glow{0%,100%{box-shadow:0 0 18px rgba(0,255,178,.15)}50%{box-shadow:0 0 30px rgba(0,255,178,.28)}}
        @keyframes toast{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .desktop-sidebar{display:flex}
        .mobile-header{display:none}
        .mobile-bottom-nav{display:none}
        @media(max-width:768px){
          .desktop-sidebar{display:none!important}
          .mobile-header{display:flex!important}
          .mobile-bottom-nav{display:flex!important}
          .main-content{padding:16px 14px 90px!important}
        }
      `}</style>

      {/* BG ambient orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-25%", right: "-10%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,255,178,.07) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,200,120,.05) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,178,.008) 3px,rgba(0,255,178,.008) 4px)" }} />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, padding: "10px 16px", background: "rgba(2,8,5,.98)", border: "1px solid rgba(0,255,178,.35)", borderRadius: "10px", color: "#00FFB2", fontSize: "12px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", animation: "toast .3s ease", letterSpacing: ".04em", boxShadow: "0 4px 20px rgba(0,255,178,.12)" }}>
          ✓ {toast}
        </div>
      )}

      {/* Upgrade modal */}
      {showUpgrade && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: "rgba(6,7,14,.99)", border: "1px solid rgba(0,255,178,.18)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "460px", animation: "fadeUp .3s ease", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".25em", marginBottom: "8px" }}>UPGRADE PLAN</div>
            <h2 style={{ color: "#fff", fontSize: "20px", fontFamily: "'Syne',sans-serif", marginBottom: "4px" }}>Choose a plan</h2>
            <p style={{ color: "#888", fontSize: "11px", marginBottom: "20px" }}>Unlock more agents, tasks, and features.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {PLANS.filter(p => p.id !== "free" && p.id !== planId).map(p => (
                <div key={p.id}
                  onClick={() => { setPlanId(p.id); setShowUpgrade(false); notify(`Upgraded to ${p.name}! 🎉`); }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", background: "rgba(255,255,255,.03)", border: `1px solid ${p.popular ? "rgba(0,255,178,.2)" : "rgba(255,255,255,.07)"}`, borderRadius: "11px", cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,178,.05)"; e.currentTarget.style.borderColor = `${p.color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = p.popular ? "rgba(0,255,178,.2)" : "rgba(255,255,255,.07)"; }}
                >
                  <div>
                    <div style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
                      {p.name}
                      {p.popular && <span style={{ background: "#00FFB2", color: "#04050A", fontSize: "7px", padding: "2px 7px", borderRadius: "20px", fontWeight: "700", letterSpacing: ".1em" }}>POPULAR</span>}
                    </div>
                    <div style={{ color: "#888", fontSize: "10px", marginTop: "2px" }}>{p.agents === 999 ? "Unlimited" : p.agents} agents · {p.tasks === 999999 ? "Unlimited" : p.tasks.toLocaleString()} tasks/mo</div>
                  </div>
                  <div style={{ color: p.color, fontWeight: "800", fontSize: "20px", fontFamily: "'Syne',sans-serif", textAlign: "right" }}>
                    ${p.price}<span style={{ fontSize: "10px", color: "#666", fontWeight: "400" }}>/mo</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowUpgrade(false)} style={{ marginTop: "14px", width: "100%", padding: "10px", background: "transparent", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9px", color: "#666", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "fadeIn .2s ease" }} onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "240px", zIndex: 999, background: "rgba(4,5,10,.98)", borderRight: "1px solid rgba(255,255,255,.07)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", animation: "slideRight .25s ease", padding: "24px 16px", display: "flex", flexDirection: "column" }}>
          <SidebarContent />
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{ width: "200px", minWidth: "200px", minHeight: "100vh", background: "rgba(255,255,255,.012)", borderRight: "1px solid rgba(255,255,255,.045)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", flexDirection: "column", padding: "28px 16px", position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
          <SidebarContent />
        </aside>

        {/* Content wrapper */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          {/* Mobile header */}
          <header className="mobile-header" style={{ alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "rgba(4,5,10,.94)", borderBottom: "1px solid rgba(255,255,255,.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
            <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", color: "#888", fontSize: "20px", cursor: "pointer", padding: "2px 6px", lineHeight: 1 }}>☰</button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: "900", color: "#04050A", fontSize: "13px" }}>A</div>
              <span style={{ color: "#fff", fontWeight: "700", fontSize: "13px", fontFamily: "'Syne',sans-serif" }}>AgentFlow</span>
            </div>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FFB2", boxShadow: "0 0 6px #00FFB2", animation: "pulse 2s infinite" }} />
          </header>

          {/* Main scroll area */}
          <main className="main-content" style={{ flex: 1, overflowY: "auto", padding: "28px 28px 40px", minHeight: 0 }}>

            {/* ── DASHBOARD ── */}
            {tab === "dashboard" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>OVERVIEW</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Dashboard</span>
                  <span style={{ color: "#666", fontSize: "10px", marginLeft: "auto" }}>{metrics.active} active · {metrics.rate}% success</span>
                </div>

                {/* Metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { l: "TASKS DONE", v: metrics.tasks.toLocaleString(), s: "this month", c: "#00FFB2" },
                    { l: "HOURS SAVED", v: `${metrics.hours}h`, s: "est. labour", c: "#60A5FA" },
                    { l: "ACTIVE AGENTS", v: `${metrics.active}/${agents.length}`, s: "online now", c: "#FFD600" },
                    { l: "SUCCESS RATE", v: `${metrics.rate}%`, s: "avg across agents", c: "#A78BFA" },
                  ].map((m, i) => (
                    <Glass key={i} style={{ padding: "18px", position: "relative", overflow: "hidden", animation: `fadeUp .4s ease ${i * 65}ms both` }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg,transparent,${m.c},transparent)` }} />
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg,${m.c}55,transparent)` }} />
                      <div style={{ fontSize: "9px", color: "#777", letterSpacing: ".16em", marginBottom: "9px" }}>{m.l}</div>
                      <div style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: "800", color: "#fff", fontFamily: "'Syne',sans-serif", lineHeight: 1.1 }}>{m.v}</div>
                      <div style={{ fontSize: "10px", color: m.c, marginTop: "5px" }}>{m.s}</div>
                    </Glass>
                  ))}
                </div>

                {/* Agent quick cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "10px" }}>
                  {agents.map((a, i) => (
                    <Glass key={a.id} hover onClick={() => { setSelAgent(a); setTab("agents"); }} style={{ padding: "18px", cursor: "pointer", animation: `fadeUp .4s ease ${i * 75}ms both` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "13px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div style={{ width: "42px", height: "42px", minWidth: "42px", borderRadius: "11px", background: `${a.color}12`, border: `1px solid ${a.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px" }}>{a.icon}</div>
                          <div>
                            <div style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "14px" }}>{a.name}</div>
                            <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>{a.role}</div>
                          </div>
                        </div>
                        <Pill active={a.status === "active"} />
                      </div>
                      <div style={{ display: "flex", gap: "18px", marginBottom: "10px" }}>
                        <div>
                          <div style={{ fontSize: "9px", color: "#777", letterSpacing: ".11em", marginBottom: "3px" }}>TASKS</div>
                          <div style={{ fontSize: "clamp(20px,3vw,24px)", fontWeight: "800", color: a.color, fontFamily: "'Syne',sans-serif" }}>{a.tasks}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "9px", color: "#777", letterSpacing: ".11em", marginBottom: "3px" }}>SUCCESS</div>
                          <div style={{ fontSize: "clamp(20px,3vw,24px)", fontWeight: "800", color: "#fff", fontFamily: "'Syne',sans-serif" }}>{a.successRate}%</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "11px", color: "#999", borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: "9px" }}>▸ {a.logs[0].msg}</div>
                    </Glass>
                  ))}
                </div>
              </div>
            )}

            {/* ── AGENTS ── */}
            {tab === "agents" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>AGENTS</span>
                    <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Your Agents</span>
                    <span style={{ color: "#666", fontSize: "10px" }}>{agents.length}/{plan.agents} deployed</span>
                  </div>
                  <button
                    onClick={() => agents.length >= plan.agents ? setShowUpgrade(true) : setShowBuilder(p => !p)}
                    style={{ padding: "10px 18px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", letterSpacing: ".07em", boxShadow: "0 4px 18px rgba(0,255,178,.22)", transition: "all .2s", flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,255,178,.32)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,255,178,.22)"; }}
                  >+ DEPLOY AGENT</button>
                </div>

                {showBuilder && (
                  <Glass style={{ padding: "18px", marginBottom: "14px", border: "1px solid rgba(0,255,178,.15)", animation: "fadeUp .3s ease" }}>
                    <div style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em", marginBottom: "14px" }}>NEW AGENT</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", alignItems: "flex-end" }}>
                      {[{ label: "ICON", key: "icon", w: "65px", center: true }, { label: "NAME", key: "name", placeholder: "e.g. Max" }, { label: "ROLE", key: "role", placeholder: "e.g. Inventory Manager" }].map(f => (
                        <div key={f.key} style={{ flex: f.w ? "none" : "1 1 130px", minWidth: f.w || "130px", width: f.w }}>
                          <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "5px" }}>{f.label}</div>
                          <input
                            value={newAgent[f.key]}
                            onChange={e => setNewAgent(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder || ""}
                            style={{ width: "100%", padding: "9px 11px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "8px", color: "#fff", fontSize: f.center ? "18px" : "13px", textAlign: f.center ? "center" : "left", fontFamily: "inherit", transition: "all .15s" }}
                          />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "7px", flexShrink: 0 }}>
                        <button onClick={createAgent} style={{ padding: "9px 16px", background: "#00FFB2", border: "none", borderRadius: "8px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>Deploy</button>
                        <button onClick={() => setShowBuilder(false)} style={{ padding: "9px 11px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "8px", color: "#888", cursor: "pointer", fontSize: "13px" }}>✕</button>
                      </div>
                    </div>
                  </Glass>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  {agents.map((a, i) => (
                    <Glass key={a.id} hover style={{ border: selAgent?.id === a.id ? `1px solid ${a.color}35` : "1px solid rgba(255,255,255,.07)", overflow: "hidden", animation: `fadeUp .4s ease ${i * 50}ms both` }}>
                      <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: "10px", flexWrap: "wrap" }} onClick={() => setSelAgent(selAgent?.id === a.id ? null : a)}>
                        <div style={{ display: "flex", gap: "11px", alignItems: "center", flex: 1, minWidth: "180px" }}>
                          <div style={{ width: "44px", height: "44px", minWidth: "44px", borderRadius: "11px", background: `${a.color}10`, border: `1px solid ${a.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{a.icon}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "14px" }}>{a.name}</span>
                              <span style={{ color: a.color, fontSize: "10px" }}>// {a.role}</span>
                            </div>
                            <div style={{ color: "#999", fontSize: "11px", marginTop: "2px" }}>{a.description}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "7px", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                          <div style={{ textAlign: "right", marginRight: "4px" }}>
                            <div style={{ color: "#fff", fontWeight: "800", fontSize: "18px", fontFamily: "'Syne',sans-serif" }}>{a.tasks}</div>
                            <div style={{ color: "#777", fontSize: "8px", letterSpacing: ".11em" }}>TASKS</div>
                          </div>
                          <Pill active={a.status === "active"} />
                          <button
                            onClick={async e => {
                            e.stopPropagation();
                            const newStatus = a.status === "active" ? "idle" : "active";
                            setAgents(p => p.map(x => x.id === a.id ? { ...x, status: newStatus } : x));
                            if (user) await supabase.from("agents").update({ status: newStatus }).eq("id", a.id);
                            notify(a.status === "active" ? `${a.name} paused.` : `${a.name} activated!`);
                          }}
                            style={{ padding: "6px 10px", background: a.status === "active" ? "rgba(255,107,107,.07)" : "rgba(0,255,178,.07)", border: `1px solid ${a.status === "active" ? "rgba(255,107,107,.2)" : "rgba(0,255,178,.2)"}`, borderRadius: "7px", color: a.status === "active" ? "#FF6B6B" : "#00FFB2", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", letterSpacing: ".06em", transition: "all .15s" }}
                          >{a.status === "active" ? "PAUSE" : "ACTIVATE"}</button>
                          <button
                            onClick={async e => {
                            e.stopPropagation();
                            setAgents(p => p.filter(x => x.id !== a.id));
                            if (selAgent?.id === a.id) setSelAgent(null);
                            if (user) await supabase.from("agents").delete().eq("id", a.id);
                            notify("Agent removed.");
                          }}
                            style={{ padding: "6px 8px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "7px", color: "#888", cursor: "pointer", fontSize: "12px", transition: "all .15s" }}
                          >🗑</button>
                        </div>
                      </div>

                      {selAgent?.id === a.id && (
                        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "14px", paddingTop: "14px" }}>
                            {[{ title: "TRIGGERS", items: a.triggers, prefix: "⚡" }, { title: "ACTIONS", items: a.actions, prefix: "→" }].map(s => (
                              <div key={s.title}>
                                <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "8px" }}>{s.title}</div>
                                {s.items.map((t, i) => (
                                  <div key={i} style={{ fontSize: "11px", color: "#bbb", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.035)" }}>{s.prefix} {t}</div>
                                ))}
                              </div>
                            ))}
                            {/* ── Real trigger buttons ── */}
                            <div>
                              <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "8px" }}>FIRE TRIGGER</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                {a.role === "Customer Support" && <>
                                  <button onClick={() => triggerAgent(a, "Aria:ticket_resolved", { customerName: "Test Customer", issue: "General enquiry", resolution: "Handled via WhatsApp" })} style={{ padding: "6px 10px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.15)", borderRadius: "7px", color: "#00FFB2", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>✅ Resolve ticket</button>
                                  <button onClick={() => triggerAgent(a, "Aria:escalation", { customerName: "Test Customer", issue: "Complex billing dispute", ticketId: "#TEST-001" })} style={{ padding: "6px 10px", background: "rgba(255,107,107,.06)", border: "1px solid rgba(255,107,107,.15)", borderRadius: "7px", color: "#FF6B6B", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>🚨 Escalate issue</button>
                                </>}
                                {a.role === "Appointment Booking" && <>
                                  <button onClick={() => triggerAgent(a, "Rex:appointment_booked", { clientName: "Test Client", date: "Tomorrow", time: "10:00 AM", service: "Consultation" })} style={{ padding: "6px 10px", background: "rgba(255,214,0,.06)", border: "1px solid rgba(255,214,0,.15)", borderRadius: "7px", color: "#FFD600", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>📅 Book appointment</button>
                                  <button onClick={() => triggerAgent(a, "Rex:appointment_reminder", { clientName: "Test Client", time: "10:00 AM", service: "Consultation" })} style={{ padding: "6px 10px", background: "rgba(255,214,0,.06)", border: "1px solid rgba(255,214,0,.15)", borderRadius: "7px", color: "#FFD600", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>⏰ Send reminder</button>
                                </>}
                                {a.role === "Invoicing & Payments" && <>
                                  <button onClick={() => triggerAgent(a, "Finn:invoice_sent", { clientName: "Test Client", amount: "GHS 2,500", invoiceNumber: "INV-TEST", dueDate: "30 days" })} style={{ padding: "6px 10px", background: "rgba(255,107,107,.06)", border: "1px solid rgba(255,107,107,.15)", borderRadius: "7px", color: "#FF6B6B", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>🧾 Send invoice</button>
                                  <button onClick={() => triggerAgent(a, "Finn:payment_overdue", { clientName: "Test Client", amount: "GHS 2,500", daysOverdue: "5" })} style={{ padding: "6px 10px", background: "rgba(255,107,107,.06)", border: "1px solid rgba(255,107,107,.15)", borderRadius: "7px", color: "#FF6B6B", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>⚠️ Chase payment</button>
                                </>}
                                {a.role === "Lead Capture" && <>
                                  <button onClick={() => triggerAgent(a, "Nova:lead_captured", { leadName: "Test Lead", source: "Website", score: 85, contact: "+233500000000" })} style={{ padding: "6px 10px", background: "rgba(167,139,250,.06)", border: "1px solid rgba(167,139,250,.15)", borderRadius: "7px", color: "#A78BFA", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>🎯 Capture lead</button>
                                  <button onClick={() => triggerAgent(a, "Nova:lead_qualified", { leadName: "Test Lead", score: 91, business: "Test Business" })} style={{ padding: "6px 10px", background: "rgba(167,139,250,.06)", border: "1px solid rgba(167,139,250,.15)", borderRadius: "7px", color: "#A78BFA", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", textAlign: "left" }}>✅ Qualify lead</button>
                                </>}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "8px" }}>ACTIVITY LOG</div>
                              {a.logs.map((l, i) => (
                                <div key={i} style={{ display: "flex", gap: "8px", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.035)", alignItems: "flex-start" }}>
                                  <div style={{ width: "5px", height: "5px", minWidth: "5px", borderRadius: "50%", background: l.ok ? "#00FFB2" : "#FF6B6B", marginTop: "4px", boxShadow: `0 0 4px ${l.ok ? "#00FFB2" : "#FF6B6B"}` }} />
                                  <span style={{ fontSize: "10px", color: "#bbb", flex: 1 }}>{l.msg}</span>
                                  <span style={{ fontSize: "9px", color: "#666", flexShrink: 0 }}>{l.time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Glass>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMMAND (ARIA CHAT) ── */}
            {tab === "command" && (
              <div style={{ animation: "fadeUp .4s ease", display: "flex", flexDirection: "column", height: "calc(100dvh - 120px)", minHeight: "400px" }}>
                <div style={{ marginBottom: "10px", flexShrink: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>COMMAND</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Aria</span>
                  <span style={{ color: "#666", fontSize: "10px", marginLeft: "auto" }}>Gemini 2.5 Flash</span>
                </div>

                <Glass style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                  {/* Aria header bar */}
                  <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,255,178,.02)", flexShrink: 0 }}>
                    <div style={{ width: "34px", height: "34px", minWidth: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", boxShadow: "0 0 15px rgba(0,255,178,.3)" }}>💬</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "13px" }}>Aria</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FFB2", boxShadow: "0 0 5px #00FFB2", animation: "pulse 2s infinite" }} />
                        <span style={{ color: "#00FFB2", fontSize: "9px", letterSpacing: ".13em" }}>ONLINE · FULL CONTEXT</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{chatLog.length} messages</div>
                  </div>

                  {/* Chat messages */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {chatLog.map(m =>
                      m.from === "aria"
                        ? <AriaBubble key={m.id} text={m.text} animate={m.fresh} />
                        : <UserBubble key={m.id} text={m.text} />
                    )}
                    {loading && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", animation: "fadeUp .3s ease" }}>
                        <div style={{ width: "34px", height: "34px", minWidth: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>💬</div>
                        <div style={{ padding: "12px 16px", background: "rgba(0,255,178,.05)", border: "1px solid rgba(0,255,178,.14)", borderRadius: "4px 14px 14px 14px", display: "flex", gap: "5px", alignItems: "center" }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FFB2", animation: `dotBounce 1.2s ease ${i * .2}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatRef} />
                  </div>

                  {/* Quick prompts */}
                  <div style={{ padding: "9px 16px", borderTop: "1px solid rgba(255,255,255,.04)", display: "flex", gap: "6px", flexWrap: "wrap", flexShrink: 0, background: "rgba(0,0,0,.1)" }}>
                    {["Full status report", "Any failures today?", "Who's busiest?", "Suggest improvements", "Hours saved this week?"].map(q => (
                      <button key={q} onClick={() => { setChatInput(q); }}
                        style={{ padding: "5px 10px", fontSize: "10px", fontFamily: "inherit", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "20px", color: "#888", cursor: "pointer", letterSpacing: ".03em", transition: "all .15s", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.target.style.color = "#00FFB2"; e.target.style.borderColor = "rgba(0,255,178,.2)"; e.target.style.background = "rgba(0,255,178,.05)"; }}
                        onMouseLeave={e => { e.target.style.color = "#888"; e.target.style.borderColor = "rgba(255,255,255,.07)"; e.target.style.background = "rgba(255,255,255,.03)"; }}
                      >{q}</button>
                    ))}
                  </div>

                  {/* Input bar */}
                  <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", gap: "8px", flexShrink: 0 }}>
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                      placeholder="Ask Aria anything about your operations..."
                      style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", color: "#fff", fontSize: "13px", fontFamily: "inherit", minWidth: 0, transition: "all .15s" }}
                    />
                    <button
                      onClick={sendChat}
                      disabled={loading}
                      style={{ padding: "11px 20px", background: loading ? "rgba(0,255,178,.15)" : "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontSize: "13px", fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 14px rgba(0,255,178,.25)", transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0 }}
                    >{loading ? "···" : "Send →"}</button>
                  </div>
                </Glass>
              </div>
            )}

            {/* ── INTEGRATIONS ── */}
            {tab === "integrations" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>CONNECT</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Integrations</span>
                  <span style={{ color: "#666", fontSize: "10px", marginLeft: "auto" }}>{integrations.filter(i => i.connected).length}/{integrations.length} connected</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                  {integrations.map((intg, i) => (
                    <Glass key={i} hover style={{ padding: "18px", border: `1px solid ${intg.connected ? "rgba(0,255,178,.12)" : "rgba(255,255,255,.06)"}`, animation: `fadeUp .4s ease ${i * 40}ms both` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <div style={{ fontSize: "26px" }}>{intg.icon}</div>
                        <Pill active={intg.connected} />
                      </div>
                      <div style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "13px", marginBottom: "3px" }}>{intg.name}</div>
                      <div style={{ fontSize: "10px", color: "#888", marginBottom: "13px" }}>{intg.desc}</div>
                      <button
                        onClick={async () => {
                          const newVal = !intg.connected;
                          setIntegrations(p => p.map(x => x.name === intg.name ? { ...x, connected: newVal } : x));
                          if (user) {
                            await supabase.from("integrations").upsert({
                              user_id: user.id,
                              name: intg.name.toLowerCase(),
                              connected: newVal,
                              connected_at: newVal ? new Date().toISOString() : null,
                            }, { onConflict: "user_id,name" });
                          }
                          // WhatsApp — send a real test message via Twilio when connecting
                          if (intg.name === "WhatsApp" && newVal) {
                            try {
                              const res = await fetch("/api/whatsapp", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  to: user?.phone || import.meta.env.VITE_TEST_WHATSAPP_NUMBER,
                                  message: `✅ WhatsApp connected to AgentFlow!

Your agents can now send messages through this number. Reply anything to test the connection.`,
                                }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                notify("WhatsApp connected! Check your phone 📱");
                              } else {
                                notify("WhatsApp saved — test message failed: " + data.error);
                              }
                            } catch (e) {
                              notify("WhatsApp connected ✓ (test message failed)");
                            }
                          } else {
                            notify(intg.connected ? `${intg.name} disconnected.` : `${intg.name} connected! ✓`);
                          }
                        }}
                        style={{ width: "100%", padding: "7px", fontFamily: "inherit", fontSize: "10px", cursor: "pointer", background: intg.connected ? "rgba(255,107,107,.06)" : "rgba(0,255,178,.06)", border: `1px solid ${intg.connected ? "rgba(255,107,107,.18)" : "rgba(0,255,178,.18)"}`, borderRadius: "7px", color: intg.connected ? "#FF6B6B" : "#00FFB2", letterSpacing: ".08em", transition: "all .15s" }}
                      >{intg.connected ? "DISCONNECT" : "CONNECT"}</button>
                    </Glass>
                  ))}
                </div>
              </div>
            )}

            {/* ── BILLING ── */}
            {tab === "billing" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>BILLING</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Plans</span>
                  <span style={{ color: "#666", fontSize: "10px", marginLeft: "auto" }}>{plan.name} · ${plan.price}/mo</span>
                </div>

                {/* Usage bars */}
                <Glass style={{ padding: "20px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "16px" }}>USAGE THIS MONTH</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "20px" }}>
                    {[
                      { label: "AGENTS", used: agents.length, limit: plan.agents, c: "#A78BFA" },
                      { label: "TASKS / MONTH", used: metrics.tasks, limit: plan.tasks, c: "#00FFB2" },
                      { label: "INTEGRATIONS", used: integrations.filter(i => i.connected).length, limit: 8, c: "#FFD600" },
                    ].map((u, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                          <span style={{ fontSize: "8px", color: "#777", letterSpacing: ".16em" }}>{u.label}</span>
                          <span style={{ color: "#bbb", fontSize: "11px" }}>{u.used}/{u.limit === 999999 ? "∞" : u.limit.toLocaleString()}</span>
                        </div>
                        <div style={{ height: "3px", background: "rgba(255,255,255,.05)", borderRadius: "2px" }}>
                          <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min((u.used / u.limit) * 100, 100)}%`, background: u.used / u.limit > 0.8 ? "#FF6B6B" : u.c, transition: "width .6s", boxShadow: `0 0 5px ${u.c}60` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Glass>

                {/* Plan cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: "10px" }}>
                  {PLANS.map((p, i) => (
                    <Glass key={i} style={{ padding: "20px", border: `1px solid ${planId === p.id ? p.color + "30" : "rgba(255,255,255,.05)"}`, background: planId === p.id ? "rgba(0,255,178,.025)" : "rgba(255,255,255,.018)", position: "relative", animation: `fadeUp .4s ease ${i * 65}ms both` }}>
                      {p.popular && <div style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", background: "#00FFB2", color: "#04050A", fontSize: "8px", padding: "2px 10px", borderRadius: "20px", fontWeight: "700", letterSpacing: ".1em", whiteSpace: "nowrap" }}>POPULAR</div>}
                      {planId === p.id && <div style={{ position: "absolute", top: "-8px", right: "10px", background: p.color, color: "#04050A", fontSize: "8px", padding: "2px 8px", borderRadius: "20px", fontWeight: "700" }}>ACTIVE</div>}
                      <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "9px" }}>{p.name.toUpperCase()}</div>
                      <div style={{ marginBottom: "14px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "800", color: "#fff", fontFamily: "'Syne',sans-serif" }}>${p.price}</span>
                        <span style={{ color: "#777", fontSize: "10px" }}>/mo</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                        {p.features.map((f, j) => (
                          <div key={j} style={{ fontSize: "10px", color: "#bbb", display: "flex", gap: "7px" }}>
                            <span style={{ color: p.color, flexShrink: 0 }}>✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        disabled={planId === p.id}
                        onClick={() => { if (p.id !== "free" && p.id !== planId) { setPlanId(p.id); notify(`Upgraded to ${p.name}! 🎉`); } }}
                        style={{ width: "100%", padding: "8px", fontFamily: "inherit", fontSize: "10px", cursor: planId === p.id ? "default" : "pointer", background: planId === p.id ? "rgba(255,255,255,.03)" : `${p.color}14`, border: `1px solid ${planId === p.id ? "rgba(255,255,255,.05)" : p.color + "30"}`, borderRadius: "7px", color: planId === p.id ? "#555" : p.color, letterSpacing: ".08em", transition: "all .2s" }}
                      >{planId === p.id ? "CURRENT PLAN" : "UPGRADE →"}</button>
                    </Glass>
                  ))}
                </div>
              </div>
            )}

          </main>

          {/* Mobile bottom nav */}
          <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(4,5,10,.97)", borderTop: "1px solid rgba(255,255,255,.07)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "8px 0 env(safe-area-inset-bottom, 12px)", justifyContent: "space-around", alignItems: "center" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "5px 10px", background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#00FFB2" : "#555", fontFamily: "inherit", transition: "all .15s", minWidth: "50px" }}>
                <span style={{ fontSize: "17px" }}>{t.icon}</span>
                <span style={{ fontSize: "8px", letterSpacing: ".06em" }}>{t.label}</span>
              </button>
            ))}
          </nav>

        </div>
      </div>
    </div>
  );
}