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
  { name: "Facebook", icon: "📘", connected: false, desc: "Messenger automation", isMeta: true },
  { name: "Instagram", icon: "📸", connected: false, desc: "Instagram DM automation", isMeta: true },
  { name: "Stripe", icon: "💳", connected: false, desc: "Payments & invoicing" },
  { name: "QuickBooks", icon: "📊", connected: true, desc: "Accounting sync" },
  { name: "Calendar", icon: "🗓️", connected: true, desc: "Scheduling" },
  { name: "Slack", icon: "💬", connected: false, desc: "Team notifications" },
  { name: "Zapier", icon: "⚡", connected: false, desc: "1000+ connections" },
  { name: "HubSpot", icon: "🎯", connected: false, desc: "CRM & pipeline" },
];

const ADMIN_UID = "f54313b9-7f30-4749-906d-85122471540d";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "agents", label: "Agents", icon: "◉" },
  { id: "appointments", label: "Bookings", icon: "📅" },
  { id: "invoices", label: "Invoices", icon: "🧾" },
  { id: "messages", label: "Messages", icon: "💬" },
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
        background: hov
          ? "linear-gradient(135deg,rgba(0,255,178,.05) 0%,rgba(255,255,255,.04) 100%)"
          : "linear-gradient(135deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.02) 100%)",
        border: hov ? "1px solid rgba(0,255,178,.25)" : "1px solid rgba(255,255,255,.07)",
        borderRadius: "20px",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        boxShadow: hov
          ? "0 8px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,255,178,.06)"
          : "0 4px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all .3s cubic-bezier(.16,1,.3,1)",
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
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app`,
      });
      if (error) setError(error.message);
      else setMessage("Password reset link sent! Check your email.");
    }
    setAuthLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "10px", color: "#fff", fontSize: "13px", fontFamily: "inherit", outline: "none", marginBottom: "10px" };
  const btnStyle = { width: "100%", padding: "13px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", letterSpacing: ".06em", marginTop: "6px" };

  return (
    <div style={{ width: "100%", maxWidth: "360px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "18px", padding: "28px" }}>
      <div style={{ fontSize: "9px", color: "#777", letterSpacing: ".2em", marginBottom: "20px", textAlign: "center" }}>
        {mode === "signin" ? "SIGN IN TO YOUR WORKSPACE" : mode === "signup" ? "CREATE YOUR ACCOUNT" : "RESET YOUR PASSWORD"}
      </div>
      <input style={inputStyle} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={e => e.target.style.borderColor="rgba(0,255,178,.35)"} onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"} />
      {mode !== "reset" && (
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onFocus={e => e.target.style.borderColor="rgba(0,255,178,.35)"} onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"} onKeyDown={e => e.key === "Enter" && handle()} />
      )}
      {error && <div style={{ color: "#FF6B6B", fontSize: "11px", marginBottom: "10px", padding: "8px 12px", background: "rgba(255,107,107,.06)", borderRadius: "7px", border: "1px solid rgba(255,107,107,.15)" }}>{error}</div>}
      {message && <div style={{ color: "#00FFB2", fontSize: "11px", marginBottom: "10px", padding: "8px 12px", background: "rgba(0,255,178,.06)", borderRadius: "7px", border: "1px solid rgba(0,255,178,.15)" }}>{message}</div>}
      <button style={btnStyle} onClick={handle} disabled={authLoading}>
        {authLoading ? "Please wait..." : mode === "signin" ? "Sign In →" : mode === "signup" ? "Create Account →" : "Send Reset Link →"}
      </button>
      <div style={{ textAlign: "center", marginTop: "14px", fontSize: "11px", color: "#666", display: "flex", flexDirection: "column", gap: "6px" }}>
        {mode === "signin" && (
          <>
            <span>No account? <span style={{ color: "#00FFB2", cursor: "pointer" }} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Sign up</span></span>
            <span style={{ color: "#555", cursor: "pointer" }} onClick={() => { setMode("reset"); setError(""); setMessage(""); }}>Forgot password?</span>
          </>
        )}
        {mode === "signup" && (
          <span>Have an account? <span style={{ color: "#00FFB2", cursor: "pointer" }} onClick={() => { setMode("signin"); setError(""); setMessage(""); }}>Sign in</span></span>
        )}
        {mode === "reset" && (
          <span style={{ color: "#00FFB2", cursor: "pointer" }} onClick={() => { setMode("signin"); setError(""); setMessage(""); }}>← Back to sign in</span>
        )}
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
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmails, setGmailEmails] = useState([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [showWaSetup, setShowWaSetup] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showApptForm, setShowApptForm] = useState(false);
  const [showInvForm, setShowInvForm] = useState(false);
  const [newAppt, setNewAppt] = useState({ client_name: "", client_phone: "", service: "", date: "", time: "", notes: "" });
  const [newInv, setNewInv] = useState({ client_name: "", client_phone: "", amount: "", description: "", due_date: "" });
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('af_dark') !== 'false');
  const [activeAgentChat, setActiveAgentChat] = useState(null); // agent being chatted with
  const [agentChatLog, setAgentChatLog] = useState({});
  const [agentChatInput, setAgentChatInput] = useState("");
  const [agentChatLoading, setAgentChatLoading] = useState(false);
  const [showPersonaEditor, setShowPersonaEditor] = useState(null);
  const [personas, setPersonas] = useState({});
  const [schedulers, setSchedulers] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [voiceMode, setVoiceMode] = useState(false); // full voice mode overlay
  const [audioLevel, setAudioLevel] = useState(0);
  const [metaMessages, setMetaMessages] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [showMetaSetup, setShowMetaSetup] = useState(false);
  const [metaForm, setMetaForm] = useState({ pageId: "", instagramId: "", accessToken: "", businessName: "" });
  const [metaFormLoading, setMetaFormLoading] = useState(false);
  const [metaBusiness, setMetaBusiness] = useState(null);
  const [metaMsgFilter, setMetaMsgFilter] = useState("all"); // all | facebook | instagram
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const chatRef = useRef(null);
  const plan = PLANS.find(p => p.id === planId);
  const isAdmin = user?.id === ADMIN_UID;
  const unreadNotifs = notifications.filter(n => !n.read).length;

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
    await Promise.all([loadAgents(), loadIntegrations(), loadSubscription(), loadAppointments(), loadInvoices(), loadMetaData()]);
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
    // Auto-load Gmail if already connected
    const gmailRecord = (data || []).find(d => d.name === "gmail" && d.connected);
    if (gmailRecord) {
      setGmailConnected(true);
      setTimeout(() => loadGmailEmails(), 800);
    }
    // Load saved WhatsApp business number
    const waRecord = (data || []).find(d => d.name === "whatsapp" && d.connected);
    if (waRecord?.credentials?.businessNumber) {
      setWhatsappNumber(waRecord.credentials.businessNumber);
    }
  };

  const loadSubscription = async () => {
    const { data, error } = await supabase.from("subscriptions").select("*").single();
    if (error) return;
    if (data?.plan) setPlanId(data.plan);
  };

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true });
    if (error) { console.error("appointments:", error); return; }
    setAppointments(data || []);
  };

  const loadInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("invoices:", error); return; }
    setInvoices(data || []);
  };

  // ── Meta: load business info and message history ──
  const loadMetaData = async () => {
    if (!user) return;
    setMetaLoading(true);
    try {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      setMetaBusiness(biz || null);

      if (biz?.id) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("business_id", biz.id)
          .order("created_at", { ascending: false })
          .limit(50);
        setMetaMessages(msgs || []);

        // Sync Facebook/Instagram connected status with integrations UI
        if (biz.page_id && biz.meta_status === "live") {
          setIntegrations(p => p.map(x =>
            x.name === "Facebook" ? { ...x, connected: true } :
            (x.name === "Instagram" && biz.instagram_id) ? { ...x, connected: true } : x
          ));
        }
      }
    } catch (e) {
      console.error("loadMetaData:", e);
    }
    setMetaLoading(false);
  };

  // ── Meta: connect a Facebook Page manually ──
  const connectMeta = async () => {
    if (!metaForm.pageId || !metaForm.accessToken) {
      notify("Page ID and Access Token are required.");
      return;
    }
    setMetaFormLoading(true);
    try {
      const res = await fetch("/api/meta-onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminSecret: import.meta.env.VITE_ADMIN_SECRET,
          userId: user.id,
          businessName: metaForm.businessName || "My Business",
          pageId: metaForm.pageId,
          instagramId: metaForm.instagramId || undefined,
          accessToken: metaForm.accessToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      setShowMetaSetup(false);
      setMetaForm({ pageId: "", instagramId: "", accessToken: "", businessName: "" });
      notify("Facebook Page connected! ✓");
      await loadMetaData();
    } catch (e) {
      notify("Error: " + e.message);
    }
    setMetaFormLoading(false);
  };

  const saveAppointment = async () => {
    if (!newAppt.client_name || !newAppt.service || !newAppt.date || !newAppt.time) {
      notify("Fill in all required fields"); return;
    }
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      ...newAppt,
    });
    if (error) { notify("Failed to save appointment"); return; }
    setNewAppt({ client_name: "", client_phone: "", service: "", date: "", time: "", notes: "" });
    setShowApptForm(false);
    await loadAppointments();
    notify("Appointment saved! Rex will send a reminder.");
  };

  const saveInvoice = async () => {
    if (!newInv.client_name || !newInv.amount) {
      notify("Fill in client name and amount"); return;
    }
    const invoiceNumber = "INV-" + Date.now().toString().slice(-5);
    const { error } = await supabase.from("invoices").insert({
      user_id: user.id,
      ...newInv,
      amount: parseFloat(newInv.amount),
      invoice_number: invoiceNumber,
      status: "pending",
    });
    if (error) { notify("Failed to save invoice"); return; }
    setNewInv({ client_name: "", client_phone: "", amount: "", description: "", due_date: "" });
    setShowInvForm(false);
    await loadInvoices();
    notify("Invoice saved! Finn will follow up on payment.");
  };

  const markInvoicePaid = async (id) => {
    await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    await loadInvoices();
    notify("Invoice marked as paid ✓");
  };

  const deleteAppointment = async (id) => {
    await supabase.from("appointments").delete().eq("id", id);
    await loadAppointments();
    notify("Appointment removed.");
  };

  const deleteInvoice = async (id) => {
    await supabase.from("invoices").delete().eq("id", id);
    await loadInvoices();
    notify("Invoice removed.");
  };

  // ── Admin: load all users + their agents (admin only) ──
  const loadAdminData = async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      // Get all agents grouped by user
      const { data: allAgents } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: allSubs } = await supabase
        .from("subscriptions")
        .select("*");

      // Group agents by user_id
      const byUser = {};
      (allAgents || []).forEach(a => {
        if (!byUser[a.user_id]) byUser[a.user_id] = { user_id: a.user_id, agents: [], tasks: 0 };
        byUser[a.user_id].agents.push(a);
        byUser[a.user_id].tasks += a.tasks_completed || 0;
      });

      // Merge subscription data
      const users = Object.values(byUser).map(u => {
        const sub = (allSubs || []).find(s => s.user_id === u.user_id);
        return { ...u, plan: sub?.plan || "free" };
      });

      setAdminUsers(users);
    } catch (e) {
      console.error("Admin load error:", e);
    }
    setAdminLoading(false);
  };

  // ── Gmail: initiate OAuth flow ──
  const connectGmail = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      notify("Set VITE_GOOGLE_CLIENT_ID in .env to connect Gmail");
      return;
    }
    const redirectUri = `${window.location.origin}/api/gmail-callback`;
    const scope = encodeURIComponent([
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
    ].join(" "));
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${user.id}`;
    window.open(authUrl, "_blank", "width=500,height=600");
    notify("Gmail OAuth window opened — authorize access and return here");
  };

  // ── Gmail: load recent emails from our serverless function ──
  const loadGmailEmails = async () => {
    setGmailLoading(true);
    try {
      const res = await fetch("/api/gmail-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.emails) {
        setGmailEmails(data.emails);
        setGmailConnected(true);
        notify(`Loaded ${data.emails.length} recent emails ✓`);
      } else {
        notify("Gmail not connected yet — click Connect first");
      }
    } catch (e) {
      notify("Gmail error: " + e.message);
    }
    setGmailLoading(false);
  };

  // ── Gmail postMessage listener (popup closes → load emails) ──
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "GMAIL_CONNECTED") {
        notify("Gmail authorized! Loading emails...");
        setGmailConnected(true);
        loadGmailEmails();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [user]);

  // ── Add notification ──
  const addNotification = (msg, type = "info", agentName = "") => {
    const notif = { id: Date.now(), msg, type, agentName, time: new Date(), read: false };
    setNotifications(prev => [notif, ...prev].slice(0, 50));
  };

  // ── Override triggerAgent to also add notification ──
  const addAgentNotification = (agentName, action, ok = true) => {
    addNotification(`${agentName}: ${action}`, ok ? "success" : "error", agentName);
  };

  // ── Agent scheduler: set time for agent to auto-trigger ──
  const setAgentSchedule = (agentId, time) => {
    setSchedulers(prev => ({ ...prev, [agentId]: time }));
    notify(`Schedule set for ${time} daily ✓`);
  };

  // ── Chat with any specific agent ──
  const sendAgentChat = async (agent, msg) => {
    if (!msg.trim() || agentChatLoading) return;
    setAgentChatLoading(true);
    const agentId = agent.id;
    setAgentChatLog(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), { from: "user", text: msg }]
    }));
    setAgentChatInput("");

    const persona = personas[agentId] || {};
    const systemPrompt = `You are ${persona.name || agent.name}, an AI agent for AgentFlow — a business automation platform built in Ghana 🇬🇭.
Your role: ${agent.role}
Your personality: ${persona.tone || "Professional, helpful, concise"}
${persona.instructions || ""}
You handle: ${agent.description}
Keep replies short and focused. Plain text only, no markdown.`;

    try {
      const history = (agentChatLog[agentId] || []).map(m => ({
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
            generationConfig: { maxOutputTokens: 400, temperature: 0.65 },
          }),
        }
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim()
        || "I'm having trouble responding right now.";
      setAgentChatLog(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), { from: "agent", text: reply }]
      }));
    } catch (e) {
      setAgentChatLog(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), { from: "agent", text: "Connection error. Try again." }]
      }));
    }
    setAgentChatLoading(false);
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
      ariaSpeak(reply);
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
    const notifyNumber = whatsappNumber || import.meta.env.VITE_TEST_WHATSAPP_NUMBER;
    if (!notifyNumber) { notify("Connect your WhatsApp number in the Connect tab first"); return; }
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
        addAgentNotification(agent.name, triggerType.replace(/_/g, " "), true);
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

  // ── Voice: start listening ──
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { notify("Voice not supported in this browser. Use Chrome or Edge."); return; }
    if (isListening) { stopListening(); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      finalTranscript = "";
      startAudioVisualizer();
    };

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      if (e.error === "not-allowed") {
        notify("Microphone blocked. Allow mic in browser settings then try again.");
      } else if (e.error !== "no-speech") {
        notify("Mic error: " + e.error);
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      stopAudioVisualizer();
      recognitionRef.current = null;
      // Send whatever was captured when recognition ends
      if (finalTranscript.trim()) {
        setChatInput(finalTranscript.trim());
        sendChatWithText(finalTranscript.trim());
        finalTranscript = "";
      }
    };
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      // Don't null it here — onend will handle cleanup and sending
    } else {
      setIsListening(false);
      setTranscript("");
      stopAudioVisualizer();
    }
  };

  // ── Audio visualizer for mic level ──
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(avg / 50, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch(e) { console.log("Visualizer error:", e); }
  };

  const stopAudioVisualizer = () => {
    setAudioLevel(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) { try { audioContextRef.current.close(); } catch(e) {} audioContextRef.current = null; }
  };

  // ── Aria speaks back ──
  const voiceEnabledRef = useRef(true);
  const ariaSpeak = (text) => {
    if (!voiceEnabledRef.current) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\n+/g, ". ").replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean || clean.length < 3) return;
    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = 1.0;
      utt.pitch = 1.05;
      utt.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en"))
        || voices.find(v => v.lang.startsWith("en-"))
        || voices[0];
      if (preferred) utt.voice = preferred;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => setIsSpeaking(false);
      utt.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utt);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { doSpeak(); window.speechSynthesis.onvoiceschanged = null; };
    } else {
      doSpeak();
    }
  };

  // ── sendChat with text param (for voice) ──
  const sendChatWithText = async (text) => {
    if (!text.trim() || loading) return;
    const msg = text.trim();
    const id = msgId;
    setMsgId(c => c + 2);
    setChatInput("");
    setChatLog(prev => [...prev.map(m => ({ ...m, fresh: false })), { from: "user", text: msg, id }]);
    setLoading(true);
    const systemPrompt = `You are Aria, the intelligent AI operations manager for AgentFlow — a business automation platform built in Ghana 🇬🇭.
Current platform state:
- Agents: ${agents.map(a => `${a.name} (${a.role}, ${a.status}, ${a.tasks} tasks, ${a.successRate}% success)`).join("; ")}
- Active agents: ${agents.filter(a=>a.status==="active").length}/${agents.length}
- Total tasks: ${agents.reduce((s,a)=>s+a.tasks,0)}
- Connected integrations: ${integrations.filter(i=>i.connected).map(i=>i.name).join(", ")}
- Plan: ${plan.name}
- Upcoming appointments: ${appointments.filter(a=>a.status==="confirmed").length} confirmed
- Pending invoices: ${invoices.filter(i=>i.status==="pending").length} pending, GHS ${invoices.filter(i=>i.status!=="paid").reduce((s,i)=>s+Number(i.amount),0).toLocaleString()} outstanding
- Meta messages: ${metaMessages.length} total (${metaMessages.filter(m=>m.platform==="facebook").length} Facebook, ${metaMessages.filter(m=>m.platform==="instagram").length} Instagram, ${metaMessages.filter(m=>m.escalated).length} escalated)
Be sharp, concise, data-driven. Plain text only. No markdown. Max 3 short paragraphs.`;
    try {
      const history = chatLog.filter(m => m.from === "user" || m.from === "aria").map(m => ({ role: m.from === "user" ? "user" : "model", parts: [{ text: m.text }] }));
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents: [...history, { role: "user", parts: [{ text: msg }] }], generationConfig: { maxOutputTokens: 600, temperature: 0.65, topP: 0.92 } }) });
      const data = await res.json();
      const allParts = data?.candidates?.[0]?.content?.parts ?? [];
      const reply = allParts.map(p => p.text ?? "").join("").trim() || data?.error?.message || "I ran into an issue. Please try again.";
      setChatLog(prev => [...prev, { from: "aria", text: reply, id: id + 1, fresh: true }]);
      ariaSpeak(reply);
    } catch (e) {
      setChatLog(prev => [...prev, { from: "aria", text: `Connection error: ${e.message}`, id: id + 1, fresh: true }]);
    }
    setLoading(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px", padding: "4px 0" }}>
        <div style={{ width: "36px", height: "36px", minWidth: "36px", borderRadius: "11px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: "900", color: "#04050A", fontSize: "18px", boxShadow: "0 0 24px rgba(0,255,178,.45), 0 4px 12px rgba(0,0,0,.3)" }}>A</div>
        <div>
          <div style={{ color: "#fff", fontWeight: "800", fontSize: "14px", fontFamily: "'Syne',sans-serif", letterSpacing: "-.01em" }}>AgentFlow</div>
          <div style={{ color: "#00FFB2", fontSize: "8px", letterSpacing: ".22em", opacity: .8 }}>GHANA 🇬🇭</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {[...TABS, ...(isAdmin ? [{ id: "admin", label: "Admin", icon: "⬡" }] : [])].map(t => (
          <button
            key={t.id}
            className="nav-btn"
            onClick={() => { setTab(t.id); setDrawerOpen(false); }}
            style={{
              display: "flex", gap: "12px", alignItems: "center", padding: "11px 14px",
              borderRadius: "11px", border: "none", cursor: "pointer",
              background: tab === t.id
                ? "linear-gradient(135deg,rgba(0,255,178,.12),rgba(0,255,178,.06))"
                : "transparent",
              color: tab === t.id ? "#00FFB2" : "#666",
              fontSize: "12px", fontFamily: "inherit", textAlign: "left", width: "100%",
              borderLeft: tab === t.id ? "2px solid #00FFB2" : "2px solid transparent",
              boxShadow: tab === t.id ? "inset 0 1px 0 rgba(0,255,178,.1)" : "none",
              transition: "all .2s cubic-bezier(.16,1,.3,1)",
              letterSpacing: ".02em",
            }}
          >
            <span style={{ fontSize: "14px", opacity: tab === t.id ? 1 : 0.6 }}>{t.icon}</span>
            <span style={{ fontWeight: tab === t.id ? "600" : "400" }}>{t.label}</span>
            {t.id === "messages" && metaMessages.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: "8px", padding: "2px 6px", borderRadius: "10px", background: "rgba(0,255,178,.1)", color: "#00FFB2", border: "1px solid rgba(0,255,178,.2)", fontWeight: "700" }}>
                  {metaMessages.length}
                </span>
              )}
              {t.id === "invoices" && invoices.filter(i => i.status === "pending").length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: "8px", padding: "2px 6px", borderRadius: "10px", background: "rgba(255,107,107,.15)", color: "#FF6B6B", border: "1px solid rgba(255,107,107,.2)", fontWeight: "700" }}>
                {invoices.filter(i => i.status === "pending").length}
              </span>
            )}
            {t.id === "appointments" && appointments.filter(a => a.status === "confirmed").length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: "8px", padding: "2px 6px", borderRadius: "10px", background: "rgba(255,214,0,.1)", color: "#FFD600", border: "1px solid rgba(255,214,0,.2)", fontWeight: "700" }}>
                {appointments.filter(a => a.status === "confirmed").length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        {/* Plan card */}
        <div style={{ padding: "14px", background: "linear-gradient(135deg,rgba(0,255,178,.06),rgba(0,255,178,.02))", border: "1px solid rgba(0,255,178,.12)", borderRadius: "14px", marginBottom: "14px", boxShadow: "inset 0 1px 0 rgba(0,255,178,.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "8px", color: "#555", letterSpacing: ".2em", marginBottom: "2px" }}>PLAN</div>
              <div style={{ color: "#00FFB2", fontWeight: "800", fontFamily: "'Syne',sans-serif", fontSize: "14px" }}>{plan.name}</div>
            </div>
            <div style={{ fontSize: "9px", color: "#666" }}>{agents.length}/{plan.agents}</div>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,.06)", borderRadius: "2px", marginBottom: "10px" }}>
            <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min((agents.length / plan.agents) * 100, 100)}%`, background: agents.length >= plan.agents ? "#FF6B6B" : "linear-gradient(90deg,#00FFB2,#00C88A)", boxShadow: "0 0 8px rgba(0,255,178,.5)", transition: "width .6s" }} />
          </div>
          <button onClick={() => setShowUpgrade(true)} style={{ width: "100%", padding: "7px", background: "rgba(0,255,178,.1)", border: "1px solid rgba(0,255,178,.18)", borderRadius: "8px", color: "#00FFB2", cursor: "pointer", fontSize: "10px", fontFamily: "inherit", letterSpacing: ".08em", fontWeight: "600", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,178,.18)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,255,178,.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,255,178,.1)"; e.currentTarget.style.boxShadow = "none"; }}
          >↑ UPGRADE</button>
        </div>

        {/* User row */}
        <div style={{ display: "flex", gap: "9px", alignItems: "center", padding: "8px 4px" }}>
          <div style={{ width: "30px", height: "30px", minWidth: "30px", borderRadius: "9px", background: "linear-gradient(135deg,rgba(0,255,178,.15),rgba(0,255,178,.05))", border: "1px solid rgba(0,255,178,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👤</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#ccc", fontSize: "10px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email?.split("@")[0] || "Your Business"}</div>
            <div style={{ color: "#555", fontSize: "9px" }}>Free plan</div>
          </div>
          <button onClick={() => setDarkMode(d => { const n = !d; localStorage.setItem('af_dark', String(n)); return n; })} title="Toggle theme" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "4px", opacity: .6, transition: "opacity .2s" }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=.6}>{darkMode ? "☀️" : "🌙"}</button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifs(s => !s)} className={unreadNotifs > 0 ? "bell-animate" : ""} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "4px", opacity: .6, transition: "opacity .2s" }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=.6}>🔔</button>
            {unreadNotifs > 0 && <div style={{ position: "absolute", top: "0", right: "0", width: "12px", height: "12px", borderRadius: "50%", background: "#FF6B6B", fontSize: "7px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", border: "2px solid #04050A" }}>{unreadNotifs > 9 ? "9+" : unreadNotifs}</div>}
          </div>
          <button onClick={() => supabase.auth.signOut()} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "4px", opacity: .4, transition: "opacity .2s, color .2s", color: "#fff" }} onMouseEnter={e => { e.currentTarget.style.opacity=1; e.currentTarget.style.color="#FF6B6B"; }} onMouseLeave={e => { e.currentTarget.style.opacity=.4; e.currentTarget.style.color="#fff"; }}>⏻</button>
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
    <div style={{ minHeight: "100vh", background: darkMode ? "#04050A" : "#F0F4F8", color: darkMode ? "#E0E0E0" : "#1A202C", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden" }} className={darkMode ? "" : "light-mode"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(0,255,178,.3),rgba(0,255,178,.1));border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(0,255,178,.5)}
        input::placeholder,textarea::placeholder{color:#444}
        input:focus,textarea:focus{outline:none!important;border-color:rgba(0,255,178,.4)!important;background:rgba(0,255,178,.03)!important;box-shadow:0 0 0 3px rgba(0,255,178,.06)!important}
        button{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px #00FFB2}50%{opacity:.3;box-shadow:0 0 2px #00FFB2}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,255,178,.2)}50%{box-shadow:0 0 40px rgba(0,255,178,.35)}}
        @keyframes toast{from{opacity:0;transform:translateX(20px) scale(.95)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes voicePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.8}}
        @keyframes voiceRing1{0%{transform:scale(1);opacity:.7}100%{transform:scale(2);opacity:0}}
        @keyframes voiceRing2{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.5);opacity:0}}
        @keyframes voiceRing3{0%{transform:scale(1);opacity:.3}100%{transform:scale(3);opacity:0}}
        @keyframes waveBar{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
        @keyframes speakPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,255,178,.5)}50%{box-shadow:0 0 0 14px rgba(0,255,178,0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes bellShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-15deg)}40%{transform:rotate(15deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
        @keyframes notifSlide{from{opacity:0;transform:translateY(-10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .bell-animate{animation:bellShake .5s ease}
        .voice-btn{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .voice-btn:hover{transform:scale(1.08)}
        .voice-btn:active{transform:scale(.93)}
        .nav-btn{position:relative;transition:all .2s cubic-bezier(.16,1,.3,1)}
        .nav-btn::before{content:'';position:absolute;inset:0;border-radius:11px;background:rgba(0,255,178,.0);transition:background .2s}
        .nav-btn:hover::before{background:rgba(0,255,178,.06)}
        .light-mode{background:#F0F4F8!important;color:#1A202C!important}
        .light-mode input,.light-mode textarea{color:#1A202C!important;background:#F7FAFC!important;border-color:#CBD5E0!important}
        .light-mode input::placeholder,.light-mode textarea::placeholder{color:#A0AEC0!important}
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

      {/* BG ambient orbs — richer, more premium */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-5%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,255,178,.09) 0%,rgba(0,255,178,.03) 40%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(79,156,249,.07) 0%,rgba(79,156,249,.02) 40%,transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "30%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,.05) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(0,255,178,.012) 40px,rgba(0,255,178,.012) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(0,255,178,.012) 40px,rgba(0,255,178,.012) 41px)" }} />
      </div>

      {/* ── NOTIFICATIONS PANEL ── */}
      {showNotifs && (
        <div style={{ position: "fixed", top: "60px", right: "16px", zIndex: 9998, width: "320px", maxHeight: "420px", background: "rgba(4,6,12,.98)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "16px", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", overflow: "hidden", animation: "notifSlide .25s ease" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#fff", fontWeight: "700", fontSize: "12px", fontFamily: "'Syne',sans-serif" }}>Notifications</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {unreadNotifs > 0 && <button onClick={() => setNotifications(p => p.map(n => ({ ...n, read: true })))} style={{ background: "none", border: "none", color: "#00FFB2", fontSize: "9px", cursor: "pointer", letterSpacing: ".08em" }}>MARK ALL READ</button>}
              <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", color: "#666", fontSize: "14px", cursor: "pointer" }}>✕</button>
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "340px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#555", fontSize: "12px" }}>No notifications yet</div>
            ) : notifications.map((n, i) => (
              <div key={n.id} onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.04)", cursor: "pointer", background: n.read ? "transparent" : "rgba(0,255,178,.03)", transition: "background .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ fontSize: "10px", color: n.type === "success" ? "#00FFB2" : n.type === "error" ? "#FF6B6B" : "#FFD600", letterSpacing: ".06em" }}>{n.agentName || "SYSTEM"}</span>
                  <span style={{ fontSize: "9px", color: "#555" }}>{Math.floor((Date.now() - n.time) / 60000)}m ago</span>
                </div>
                <div style={{ fontSize: "11px", color: n.read ? "#666" : "#bbb", lineHeight: "1.4" }}>{n.msg}</div>
                {!n.read && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FFB2", marginTop: "4px" }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AGENT CHAT MODAL ── */}
      {activeAgentChat && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setActiveAgentChat(null)}>
          <div style={{ width: "100%", maxWidth: "480px", height: "560px", background: "rgba(4,6,12,.99)", border: `1px solid ${activeAgentChat.color}30`, borderRadius: "20px", display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeUp .3s ease", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }} onClick={e => e.stopPropagation()}>
            {/* Agent chat header */}
            <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", minWidth: "38px", borderRadius: "10px", background: `${activeAgentChat.color}15`, border: `1px solid ${activeAgentChat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{activeAgentChat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "13px" }}>{activeAgentChat.name}</div>
                <div style={{ fontSize: "9px", color: activeAgentChat.color, letterSpacing: ".12em" }}>{activeAgentChat.role.toUpperCase()}</div>
              </div>
              <button onClick={() => setShowPersonaEditor(activeAgentChat)} style={{ padding: "4px 10px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "6px", color: "#888", cursor: "pointer", fontSize: "9px", fontFamily: "inherit" }}>✏️ Persona</button>
              <button onClick={() => setActiveAgentChat(null)} style={{ background: "none", border: "none", color: "#555", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {(agentChatLog[activeAgentChat.id] || []).length === 0 && (
                <div style={{ textAlign: "center", color: "#555", fontSize: "12px", marginTop: "20px" }}>
                  Chat with {activeAgentChat.name} about their tasks, performance, or anything related to their role.
                </div>
              )}
              {(agentChatLog[activeAgentChat.id] || []).map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.from === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: m.from === "user" ? "rgba(255,255,255,.07)" : `${activeAgentChat.color}10`, border: `1px solid ${m.from === "user" ? "rgba(255,255,255,.1)" : activeAgentChat.color + "20"}`, fontSize: "12px", color: m.from === "user" ? "#E0E0E0" : "#fff", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              ))}
              {agentChatLoading && (
                <div style={{ display: "flex", gap: "5px", padding: "10px 14px", background: `${activeAgentChat.color}08`, border: `1px solid ${activeAgentChat.color}15`, borderRadius: "4px 14px 14px 14px", width: "fit-content" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: activeAgentChat.color, animation: `dotBounce 1.2s ease ${i*.2}s infinite` }} />)}
                </div>
              )}
            </div>
            {/* Input */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", gap: "8px" }}>
              <input value={agentChatInput} onChange={e => setAgentChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (sendAgentChat(activeAgentChat, agentChatInput), setAgentChatInput(""))} placeholder={`Ask ${activeAgentChat.name} anything...`} style={{ flex: 1, padding: "10px 13px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9px", color: "#fff", fontSize: "12px", fontFamily: "inherit" }} />
              <button onClick={() => { sendAgentChat(activeAgentChat, agentChatInput); setAgentChatInput(""); }} style={{ padding: "10px 16px", background: `linear-gradient(135deg,${activeAgentChat.color},${activeAgentChat.color}bb)`, border: "none", borderRadius: "9px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>→</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSONA EDITOR MODAL ── */}
      {showPersonaEditor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowPersonaEditor(null)}>
          <div style={{ width: "100%", maxWidth: "400px", background: "rgba(4,6,12,.99)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "18px", padding: "24px", animation: "fadeUp .3s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em", marginBottom: "16px" }}>PERSONA EDITOR — {showPersonaEditor.name.toUpperCase()}</div>
            {[
              { label: "CUSTOM NAME", key: "name", placeholder: showPersonaEditor.name },
              { label: "TONE & PERSONALITY", key: "tone", placeholder: "e.g. Friendly, direct, professional" },
              { label: "SPECIAL INSTRUCTIONS", key: "instructions", placeholder: "e.g. Always mention our Ghana 🇬🇭 roots, focus on GHS pricing" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "5px" }}>{f.label}</div>
                <input value={personas[showPersonaEditor.id]?.[f.key] || ""} onChange={e => setPersonas(p => ({ ...p, [showPersonaEditor.id]: { ...(p[showPersonaEditor.id] || {}), [f.key]: e.target.value } }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "inherit" }} />
              </div>
            ))}
            {/* Scheduler */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "5px" }}>DAILY SCHEDULE (24H FORMAT)</div>
              <input type="time" value={schedulers[showPersonaEditor.id] || ""} onChange={e => setAgentSchedule(showPersonaEditor.id, e.target.value)} style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setShowPersonaEditor(null); notify(`${showPersonaEditor.name} persona saved! ✓`); }} style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "9px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>Save Persona</button>
              <button onClick={() => setShowPersonaEditor(null)} style={{ padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9px", color: "#888", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP SETUP MODAL ── */}
      {showWaSetup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowWaSetup(false)}>
          <div style={{ width: "100%", maxWidth: "420px", background: "rgba(4,6,12,.99)", border: "1px solid rgba(0,255,178,.18)", borderRadius: "20px", padding: "28px", animation: "fadeUp .3s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em", marginBottom: "12px" }}>WHATSAPP BUSINESS SETUP</div>
            <div style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: "17px", fontWeight: "700", marginBottom: "8px" }}>Connect Your Business Number</div>
            <p style={{ color: "#888", fontSize: "12px", marginBottom: "20px", lineHeight: "1.6" }}>
              Enter the WhatsApp number your customers will text. Aria will reply from this number.
              {whatsappNumber && <span style={{ color: "#00FFB2", display: "block", marginTop: "4px" }}>Current: {whatsappNumber}</span>}
            </p>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "6px" }}>WHATSAPP BUSINESS NUMBER</div>
              <input
                id="wa-num"
                type="tel"
                placeholder="+233XXXXXXXXX"
                defaultValue={whatsappNumber}
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "10px", color: "#fff", fontSize: "15px", fontFamily: "inherit" }}
              />
              <div style={{ fontSize: "10px", color: "#555", marginTop: "5px" }}>Include country code e.g. +233541392746</div>
            </div>
            <div style={{ padding: "12px", background: "rgba(255,214,0,.04)", border: "1px solid rgba(255,214,0,.12)", borderRadius: "10px", marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", color: "#FFD600", fontWeight: "700", marginBottom: "3px" }}>Using Twilio Sandbox currently</div>
              <div style={{ fontSize: "10px", color: "#666", lineHeight: "1.5" }}>Messages go through Twilio for now. Once you get Meta WhatsApp Business API approved, update this to your real business number.</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={async () => {
                  const num = document.getElementById("wa-num").value.trim();
                  if (!num) { notify("Enter a valid number"); return; }
                  setWhatsappNumber(num);
                  if (user) {
                    await supabase.from("integrations").upsert({
                      user_id: user.id,
                      name: "whatsapp",
                      connected: true,
                      credentials: { businessNumber: num },
                      connected_at: new Date().toISOString(),
                    }, { onConflict: "user_id,name" });
                    setIntegrations(p => p.map(x => x.name === "WhatsApp" ? { ...x, connected: true } : x));
                  }
                  setShowWaSetup(false);
                  notify("WhatsApp number saved!");
                  try {
                    await fetch("/api/whatsapp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ to: num, message: "WhatsApp connected to AgentFlow! Your agents can now reply to your customers automatically." }),
                    });
                    notify("Test message sent to " + num);
                  } catch(e) {}
                }}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
              >Save & Connect</button>
              <button onClick={() => setShowWaSetup(false)} style={{ padding: "12px 16px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", color: "#888", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, padding: "12px 18px", background: "rgba(2,8,5,.98)", border: "1px solid rgba(0,255,178,.3)", borderRadius: "12px", color: "#00FFB2", fontSize: "12px", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", animation: "toast .3s cubic-bezier(.16,1,.3,1)", letterSpacing: ".03em", boxShadow: "0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(0,255,178,.08)", display: "flex", alignItems: "center", gap: "8px", maxWidth: "320px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FFB2", boxShadow: "0 0 8px #00FFB2", flexShrink: 0 }} />
          {toast}
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
        <aside className="desktop-sidebar" style={{ width: "220px", minWidth: "220px", minHeight: "100vh", background: "linear-gradient(180deg,rgba(255,255,255,.025) 0%,rgba(255,255,255,.015) 100%)", borderRight: "1px solid rgba(255,255,255,.06)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", flexDirection: "column", padding: "28px 18px", position: "sticky", top: 0, height: "100vh", overflow: "auto", boxShadow: "inset -1px 0 0 rgba(0,255,178,.03)" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setDarkMode(d => { const n = !d; localStorage.setItem('af_dark', String(n)); return n; })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "2px" }}>{darkMode ? "☀️" : "🌙"}</button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowNotifs(s => !s)} className={unreadNotifs > 0 ? "bell-animate" : ""} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: "2px" }}>🔔</button>
                {unreadNotifs > 0 && <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "14px", height: "14px", borderRadius: "50%", background: "#FF6B6B", fontSize: "8px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>{unreadNotifs}</div>}
              </div>
            </div>
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

                {/* ── ONBOARDING — show only when no agents deployed ── */}
                {agents.length === 0 && (
                  <Glass style={{ padding: "32px", marginBottom: "20px", border: "1px solid rgba(0,255,178,.15)", background: "linear-gradient(135deg,rgba(0,255,178,.04),rgba(0,255,178,.01))", animation: "fadeUp .5s ease" }}>
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚀</div>
                      <div style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: "800", fontSize: "18px", marginBottom: "8px" }}>Welcome to AgentFlow!</div>
                      <div style={{ color: "#888", fontSize: "12px", lineHeight: "1.6", maxWidth: "400px", margin: "0 auto" }}>Your AI-powered business automation platform. Follow these steps to get started in under 5 minutes.</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
                      {[
                        { step: "1", icon: "◉", title: "Deploy your agents", desc: "Go to Agents tab and deploy Aria, Rex, Finn or Nova", tab: "agents", color: "#00FFB2" },
                        { step: "2", icon: "📱", title: "Connect WhatsApp", desc: "Go to Connect tab and add your WhatsApp business number", tab: "integrations", color: "#FFD600" },
                        { step: "3", icon: "📅", title: "Add a booking", desc: "Go to Bookings tab and add your first appointment", tab: "appointments", color: "#60A5FA" },
                        { step: "4", icon: "◎", title: "Chat with Aria", desc: "Go to Command tab and ask Aria anything about your business", tab: "command", color: "#A78BFA" },
                      ].map((s, i) => (
                        <div key={i} onClick={() => setTab(s.tab)} style={{ padding: "16px", background: "rgba(255,255,255,.03)", border: `1px solid ${s.color}20`, borderRadius: "14px", cursor: "pointer", transition: "all .2s", animation: `fadeUp .4s ease ${i * 80}ms both` }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${s.color}08`; e.currentTarget.style.borderColor = `${s.color}35`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = `${s.color}20`; e.currentTarget.style.transform = "translateY(0)"; }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${s.color}15`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{s.icon}</div>
                            <div style={{ fontSize: "8px", color: s.color, letterSpacing: ".15em", fontWeight: "700" }}>STEP {s.step}</div>
                          </div>
                          <div style={{ color: "#fff", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>{s.title}</div>
                          <div style={{ color: "#666", fontSize: "10px", lineHeight: "1.5" }}>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </Glass>
                )}
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

                {/* Metric cards */}
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
                            onClick={e => { e.stopPropagation(); setActiveAgentChat(a); }}
                            style={{ padding: "6px 10px", background: `${a.color}10`, border: `1px solid ${a.color}25`, borderRadius: "7px", color: a.color, cursor: "pointer", fontSize: "9px", fontFamily: "inherit", letterSpacing: ".06em" }}
                          >💬 CHAT</button>
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
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: isSpeaking ? "#FFD600" : "#00FFB2", boxShadow: isSpeaking ? "0 0 5px #FFD600" : "0 0 5px #00FFB2", animation: "pulse 2s infinite" }} />
                        <span style={{ color: isSpeaking ? "#FFD600" : "#00FFB2", fontSize: "9px", letterSpacing: ".13em" }}>
                          {isSpeaking ? "SPEAKING..." : isListening ? "LISTENING..." : "ONLINE · FULL CONTEXT"}
                        </span>
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

                  {/* Input bar with voice */}
                  <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.05)", flexShrink: 0 }}>
                    {/* Live transcript preview */}
                    {isListening && transcript && (
                      <div style={{ padding: "8px 12px", marginBottom: "8px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.18)", borderRadius: "8px", fontSize: "12px", color: "#BDFFD9", fontStyle: "italic" }}>
                        🎤 {transcript}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {/* Mic button */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {isListening && <>
                          <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: "1.5px solid rgba(0,255,178,.5)", animation: "voiceRing1 1.4s ease-out infinite" }} />
                          <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: "1.5px solid rgba(0,255,178,.35)", animation: "voiceRing2 1.4s ease-out .2s infinite" }} />
                          <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: "1.5px solid rgba(0,255,178,.2)", animation: "voiceRing3 1.4s ease-out .4s infinite" }} />
                        </>}
                        <button
                          onClick={isListening ? stopListening : startListening}
                          className="voice-btn"
                          style={{
                            width: "44px", height: "44px", borderRadius: "50%", border: "none", cursor: "pointer",
                            background: isListening
                              ? `radial-gradient(circle, rgba(0,255,178,${0.15 + audioLevel * 0.5}) 0%, rgba(0,255,178,.08) 100%)`
                              : "rgba(255,255,255,.05)",
                            boxShadow: isListening ? `0 0 ${12 + audioLevel * 24}px rgba(0,255,178,${0.3 + audioLevel * 0.5})` : "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background .1s, box-shadow .1s",
                            animation: isListening ? "voicePulse 1.2s ease infinite" : "none",
                          }}
                          title={isListening ? "Stop listening" : "Speak to Aria"}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            {isListening ? (
                              // Waveform bars when listening
                              <>
                                <rect x="3" y="9" width="3" height="6" rx="1.5" fill="#00FFB2" style={{animation:"waveBar 0.6s ease 0s infinite"}} />
                                <rect x="7.5" y="6" width="3" height="12" rx="1.5" fill="#00FFB2" style={{animation:"waveBar 0.6s ease 0.1s infinite"}} />
                                <rect x="12" y="4" width="3" height="16" rx="1.5" fill="#00FFB2" style={{animation:"waveBar 0.6s ease 0.2s infinite"}} />
                                <rect x="16.5" y="6" width="3" height="12" rx="1.5" fill="#00FFB2" style={{animation:"waveBar 0.6s ease 0.3s infinite"}} />
                              </>
                            ) : (
                              // Microphone icon when idle
                              <>
                                <rect x="9" y="3" width="6" height="11" rx="3" fill={isSpeaking ? "#00FFB2" : "#888"} />
                                <path d="M5 11a7 7 0 0 0 14 0" stroke={isSpeaking ? "#00FFB2" : "#888"} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                <line x1="12" y1="18" x2="12" y2="21" stroke={isSpeaking ? "#00FFB2" : "#888"} strokeWidth="1.5" strokeLinecap="round"/>
                                <line x1="9" y1="21" x2="15" y2="21" stroke={isSpeaking ? "#00FFB2" : "#888"} strokeWidth="1.5" strokeLinecap="round"/>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>

                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                        placeholder={isListening ? "Listening..." : "Ask Aria anything..."}
                        style={{ flex: 1, padding: "11px 14px", background: isListening ? "rgba(0,255,178,.04)" : "rgba(255,255,255,.04)", border: `1px solid ${isListening ? "rgba(0,255,178,.25)" : "rgba(255,255,255,.08)"}`, borderRadius: "10px", color: "#fff", fontSize: "13px", fontFamily: "inherit", minWidth: 0, transition: "all .2s" }}
                      />

                      {/* Voice toggle */}
                      <button
                        onClick={() => { const next = !voiceEnabledRef.current; voiceEnabledRef.current = next; setVoiceEnabled(next); if (!next) { window.speechSynthesis.cancel(); setIsSpeaking(false); } notify(next ? "Aria voice on 🔊" : "Aria muted 🔇"); }}
                        title={voiceEnabled ? "Mute Aria" : "Unmute Aria"}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "none", cursor: "pointer", background: voiceEnabled ? "rgba(0,255,178,.08)" : "rgba(255,255,255,.04)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", transition: "all .2s" }}
                      >{voiceEnabled ? "🔊" : "🔇"}</button>

                      <button
                        onClick={sendChat}
                        disabled={loading}
                        style={{ padding: "11px 18px", background: loading ? "rgba(0,255,178,.15)" : "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontSize: "13px", fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 14px rgba(0,255,178,.25)", transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0 }}
                      >{loading ? "···" : "→"}</button>
                    </div>
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
                          // Gmail — launch OAuth flow
                          if (intg.name === "Gmail" && newVal) {
                            connectGmail();
                            return;
                          }
                          // WhatsApp — show number setup modal
                          if (intg.name === "WhatsApp" && newVal) {
                            setShowWaSetup(true);
                            return;
                          }
                          // Facebook / Instagram — show Meta setup modal
                          if (intg.isMeta && newVal) {
                            setShowMetaSetup(true);
                            return;
                          }
                          setIntegrations(p => p.map(x => x.name === intg.name ? { ...x, connected: newVal } : x));
                          if (user) {
                            await supabase.from("integrations").upsert({
                              user_id: user.id,
                              name: intg.name.toLowerCase(),
                              connected: newVal,
                              connected_at: newVal ? new Date().toISOString() : null,
                            }, { onConflict: "user_id,name" });
                          }
                          // Gmail — launch OAuth flow
                          if (intg.name === "Gmail" && newVal) {
                            connectGmail();
                            return;
                          }
                          // WhatsApp — show number setup modal
                          if (intg.name === "WhatsApp" && newVal) {
                            setShowWaSetup(true);
                            return;
                          }
                          notify(intg.connected ? `${intg.name} disconnected.` : `${intg.name} connected! ✓`);
                        }}
                        style={{ width: "100%", padding: "7px", fontFamily: "inherit", fontSize: "10px", cursor: "pointer", background: intg.connected ? "rgba(255,107,107,.06)" : "rgba(0,255,178,.06)", border: `1px solid ${intg.connected ? "rgba(255,107,107,.18)" : "rgba(0,255,178,.18)"}`, borderRadius: "7px", color: intg.connected ? "#FF6B6B" : "#00FFB2", letterSpacing: ".08em", transition: "all .15s" }}
                      >{intg.connected ? "DISCONNECT" : "CONNECT"}</button>
                    </Glass>
                  ))}
                </div>
              </div>
            )}

            {/* ── META SETUP MODAL ── */}
            {showMetaSetup && (
              <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowMetaSetup(false)}>
                <div style={{ width: "100%", maxWidth: "440px", background: "rgba(4,6,12,.99)", border: "1px solid rgba(0,255,178,.18)", borderRadius: "20px", padding: "28px", animation: "fadeUp .3s ease", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                    <div>
                      <div style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em", marginBottom: "4px" }}>META INTEGRATION</div>
                      <div style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: "17px", fontWeight: "700" }}>Connect Facebook Page</div>
                    </div>
                    <button onClick={() => setShowMetaSetup(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "22px", lineHeight: 1 }}>×</button>
                  </div>

                  <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.65", marginBottom: "18px", padding: "10px 13px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "9px" }}>
                    📘 Get your Page ID and Access Token from{" "}
                    <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" style={{ color: "#00FFB2" }}>Meta Graph API Explorer</a>.
                    Generate a Page token then exchange it for a long-lived token.
                  </div>

                  {[
                    { key: "businessName", label: "BUSINESS NAME", placeholder: "e.g. Mensah & Sons", type: "text" },
                    { key: "pageId", label: "FACEBOOK PAGE ID *", placeholder: "e.g. 123456789012345", type: "text" },
                    { key: "instagramId", label: "INSTAGRAM ACCOUNT ID (OPTIONAL)", placeholder: "e.g. 987654321", type: "text" },
                    { key: "accessToken", label: "PAGE ACCESS TOKEN *", placeholder: "EAAxxxxxxxxxxxxxxxx...", type: "password" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: "13px" }}>
                      <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".18em", marginBottom: "5px" }}>{f.label}</div>
                      <input
                        type={f.type}
                        value={metaForm[f.key]}
                        onChange={e => setMetaForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width: "100%", padding: "11px 13px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "9px", color: "#fff", fontSize: "13px", fontFamily: "inherit" }}
                      />
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={connectMeta}
                      disabled={metaFormLoading}
                      style={{ flex: 1, padding: "12px", background: metaFormLoading ? "rgba(0,255,178,.2)" : "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", fontSize: "13px", fontFamily: "inherit", cursor: metaFormLoading ? "not-allowed" : "pointer", transition: "all .2s" }}
                    >{metaFormLoading ? "Verifying..." : "Connect Page →"}</button>
                    <button onClick={() => setShowMetaSetup(false)} style={{ padding: "12px 16px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", color: "#888", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── MESSAGES (META INBOX) ── */}
            {tab === "messages" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>INBOX</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Meta Messages</span>
                  {metaBusiness?.page_id && (
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "9px", letterSpacing: ".08em", background: metaBusiness.meta_status === "live" ? "rgba(0,255,178,.08)" : "rgba(255,107,107,.08)", border: `1px solid ${metaBusiness.meta_status === "live" ? "rgba(0,255,178,.2)" : "rgba(255,107,107,.2)"}`, color: metaBusiness.meta_status === "live" ? "#00FFB2" : "#FF6B6B" }}>
                      ● {metaBusiness.meta_status === "live" ? "LIVE" : "IDLE"} — {metaBusiness.name}
                    </span>
                  )}
                  <button onClick={loadMetaData} disabled={metaLoading} style={{ marginLeft: "auto", padding: "5px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "7px", color: "#888", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", letterSpacing: ".08em", opacity: metaLoading ? .5 : 1 }}>
                    {metaLoading ? "Loading..." : "↻ REFRESH"}
                  </button>
                </div>

                {/* Not connected yet */}
                {!metaBusiness?.page_id ? (
                  <Glass style={{ padding: "40px 28px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "14px" }}>📘</div>
                    <div style={{ color: "#fff", fontWeight: "700", fontFamily: "'Syne',sans-serif", fontSize: "16px", marginBottom: "8px" }}>No Facebook Page Connected</div>
                    <div style={{ color: "#666", fontSize: "12px", lineHeight: "1.6", marginBottom: "22px", maxWidth: "340px", margin: "0 auto 22px" }}>
                      Connect your Facebook Page to automatically receive and reply to Messenger and Instagram DMs using your AI agents.
                    </div>
                    <button
                      onClick={() => setShowMetaSetup(true)}
                      style={{ padding: "11px 24px", background: "linear-gradient(135deg,#00FFB2,#00C88A)", border: "none", borderRadius: "10px", color: "#04050A", fontWeight: "700", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,255,178,.22)" }}
                    >Connect Facebook Page →</button>
                  </Glass>
                ) : (
                  <>
                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: "8px", marginBottom: "16px" }}>
                      {[
                        { label: "TOTAL", value: metaMessages.length, color: "#00FFB2" },
                        { label: "FACEBOOK", value: metaMessages.filter(m => m.platform === "facebook").length, color: "#4267B2" },
                        { label: "INSTAGRAM", value: metaMessages.filter(m => m.platform === "instagram").length, color: "#C13584" },
                        { label: "ESCALATED", value: metaMessages.filter(m => m.escalated).length, color: "#FF6B6B" },
                      ].map((s, i) => (
                        <Glass key={i} style={{ padding: "14px", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />
                          <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".16em", marginBottom: "6px" }}>{s.label}</div>
                          <div style={{ fontSize: "24px", fontWeight: "800", color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                        </Glass>
                      ))}
                    </div>

                    {/* Filter buttons */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                      {["all", "facebook", "instagram"].map(f => (
                        <button key={f} onClick={() => setMetaMsgFilter(f)}
                          style={{ padding: "5px 13px", background: metaMsgFilter === f ? "rgba(0,255,178,.1)" : "rgba(255,255,255,.03)", border: `1px solid ${metaMsgFilter === f ? "rgba(0,255,178,.25)" : "rgba(255,255,255,.07)"}`, borderRadius: "20px", color: metaMsgFilter === f ? "#00FFB2" : "#666", cursor: "pointer", fontSize: "10px", fontFamily: "inherit", letterSpacing: ".06em", transition: "all .15s" }}>
                          {f === "all" ? "All" : f === "facebook" ? "📘 Facebook" : "📸 Instagram"}
                        </button>
                      ))}
                    </div>

                    {/* Messages list */}
                    {metaLoading ? (
                      <Glass style={{ padding: "28px", textAlign: "center" }}>
                        <div style={{ color: "#666", fontSize: "12px" }}>Loading messages...</div>
                      </Glass>
                    ) : metaMessages.filter(m => metaMsgFilter === "all" || m.platform === metaMsgFilter).length === 0 ? (
                      <Glass style={{ padding: "28px", textAlign: "center" }}>
                        <div style={{ color: "#666", fontSize: "12px" }}>No messages yet. Send a test message to your Facebook Page.</div>
                      </Glass>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        {metaMessages
                          .filter(m => metaMsgFilter === "all" || m.platform === metaMsgFilter)
                          .map((msg, i) => (
                          <Glass key={msg.id || i} style={{ padding: "14px 16px", animation: `fadeUp .3s ease ${i * 30}ms both` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "10px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "14px" }}>{msg.platform === "instagram" ? "📸" : "📘"}</span>
                                <div>
                                  <div style={{ color: "#bbb", fontSize: "11px", fontWeight: "600" }}>{msg.sender_name || msg.sender_id?.slice(0, 12) + "..."}</div>
                                  <div style={{ color: "#555", fontSize: "9px", letterSpacing: ".06em" }}>{msg.platform?.toUpperCase()}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                {msg.agent_name && (
                                  <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "12px", background: "rgba(0,255,178,.07)", border: "1px solid rgba(0,255,178,.15)", color: "#00FFB2" }}>
                                    {msg.agent_name}
                                  </span>
                                )}
                                {msg.escalated && (
                                  <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "12px", background: "rgba(255,107,107,.07)", border: "1px solid rgba(255,107,107,.15)", color: "#FF6B6B" }}>ESCALATED</span>
                                )}
                                <span style={{ color: "#555", fontSize: "9px" }}>{new Date(msg.created_at).toLocaleString("en-GH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>
                            <div style={{ background: "rgba(255,255,255,.02)", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px" }}>
                              <div style={{ fontSize: "9px", color: "#555", letterSpacing: ".1em", marginBottom: "4px" }}>CUSTOMER</div>
                              <div style={{ fontSize: "12px", color: "#ddd", lineHeight: "1.55" }}>{msg.message_text}</div>
                            </div>
                            {msg.response_text && (
                              <div style={{ background: "rgba(0,255,178,.04)", border: "1px solid rgba(0,255,178,.1)", borderRadius: "8px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".1em", marginBottom: "4px" }}>AGENT REPLY</div>
                                <div style={{ fontSize: "12px", color: "#BDFFD9", lineHeight: "1.55" }}>{msg.response_text}</div>
                              </div>
                            )}
                            {!msg.response_text && (
                              <div style={{ fontSize: "10px", color: "#FF6B6B", padding: "6px 10px", background: "rgba(255,107,107,.05)", border: "1px solid rgba(255,107,107,.12)", borderRadius: "6px" }}>
                                ⚠️ Reply failed — check your Page access token
                              </div>
                            )}
                          </Glass>
                        ))}
                      </div>
                    )}

                    {/* Connection info footer */}
                    <Glass style={{ padding: "14px 16px", marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        Page ID: <span style={{ color: "#bbb", fontFamily: "monospace" }}>{metaBusiness.page_id}</span>
                        {metaBusiness.instagram_id && <span style={{ marginLeft: "12px" }}>IG: <span style={{ color: "#bbb", fontFamily: "monospace" }}>{metaBusiness.instagram_id}</span></span>}
                      </div>
                      <button
                        onClick={() => setShowMetaSetup(true)}
                        style={{ padding: "5px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "7px", color: "#888", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", letterSpacing: ".08em" }}
                      >⚙ UPDATE TOKEN</button>
                    </Glass>
                  </>
                )}
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


            {/* ── GMAIL INBOX ── */}
            {tab === "integrations" && gmailConnected && (
              <div style={{ marginTop: "20px", animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#00FFB2", letterSpacing: ".22em" }}>GMAIL</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Recent Emails</span>
                  <button onClick={loadGmailEmails} disabled={gmailLoading} style={{ marginLeft: "auto", padding: "5px 12px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.15)", borderRadius: "6px", color: "#00FFB2", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", opacity: gmailLoading ? .5 : 1 }}>
                    {gmailLoading ? "Loading..." : "↻ Load Emails"}
                  </button>
                </div>
                {gmailEmails.length === 0 ? (
                  <Glass style={{ padding: "24px", textAlign: "center" }}>
                    <div style={{ color: "#666", fontSize: "12px" }}>Click "Load Emails" to fetch your recent Gmail inbox.</div>
                  </Glass>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {gmailEmails.map((email, i) => (
                    <Glass key={i} style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", gap: "10px" }}>
                        <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject || "(no subject)"}</span>
                        <span style={{ color: "#666", fontSize: "10px", flexShrink: 0 }}>{email.date}</span>
                      </div>
                      <div style={{ color: "#888", fontSize: "11px", marginBottom: "6px" }}>From: {email.from}</div>
                      <div style={{ color: "#bbb", fontSize: "11px", lineHeight: "1.5" }}>{email.snippet}</div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                        <button
                          onClick={async () => {
                            notify("Aria is drafting a reply...");
                            const res = await fetch("/api/gmail-reply", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ userId: user.id, emailId: email.id, threadId: email.threadId, to: email.from, subject: email.subject, originalBody: email.snippet }),
                            });
                            const data = await res.json();
                            if (data.success) notify("✅ Aria replied to the email!");
                            else notify("Reply failed: " + data.error);
                          }}
                          style={{ padding: "5px 10px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.15)", borderRadius: "6px", color: "#00FFB2", cursor: "pointer", fontSize: "9px", fontFamily: "inherit" }}>
                          ↩ Aria Reply
                        </button>
                      </div>
                    </Glass>
                  ))}
                </div>
                )}
              </div>
            )}
            {tab === "appointments" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#FFD600", letterSpacing: ".22em" }}>REX</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Bookings</span>
                  <span style={{ color: "#666", fontSize: "10px" }}>{appointments.length} total</span>
                  <button onClick={() => setShowApptForm(p => !p)} style={{ marginLeft: "auto", padding: "8px 16px", background: "linear-gradient(135deg,#FFD600,#F0A500)", border: "none", borderRadius: "9px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "11px", fontFamily: "inherit" }}>+ Book Appointment</button>
                </div>

                {showApptForm && (
                  <Glass style={{ padding: "18px", marginBottom: "14px", border: "1px solid rgba(255,214,0,.2)", animation: "fadeUp .3s ease" }}>
                    <div style={{ fontSize: "9px", color: "#FFD600", letterSpacing: ".22em", marginBottom: "14px" }}>NEW APPOINTMENT</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "10px" }}>
                      {[
                        { label: "CLIENT NAME *", key: "client_name", placeholder: "e.g. Kwame Asante" },
                        { label: "PHONE (WhatsApp)", key: "client_phone", placeholder: "+233XXXXXXXXX" },
                        { label: "SERVICE *", key: "service", placeholder: "e.g. Dental Checkup" },
                        { label: "DATE *", key: "date", type: "date" },
                        { label: "TIME *", key: "time", type: "time" },
                        { label: "NOTES", key: "notes", placeholder: "Optional notes" },
                      ].map(f => (
                        <div key={f.key}>
                          <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".15em", marginBottom: "5px" }}>{f.label}</div>
                          <input
                            type={f.type || "text"}
                            placeholder={f.placeholder || ""}
                            value={newAppt[f.key]}
                            onChange={e => setNewAppt(p => ({ ...p, [f.key]: e.target.value }))}
                            style={{ width: "100%", padding: "9px 11px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "inherit" }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button onClick={saveAppointment} style={{ padding: "9px 20px", background: "linear-gradient(135deg,#FFD600,#F0A500)", border: "none", borderRadius: "8px", color: "#04050A", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>Save Appointment</button>
                      <button onClick={() => setShowApptForm(false)} style={{ padding: "9px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "8px", color: "#888", cursor: "pointer", fontSize: "13px" }}>✕</button>
                    </div>
                  </Glass>
                )}

                {appointments.length === 0 ? (
                  <Glass style={{ padding: "32px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "10px" }}>📅</div>
                    <div style={{ color: "#666", fontSize: "12px" }}>No appointments yet. Book your first one above — Rex will send reminders automatically.</div>
                  </Glass>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {appointments.map((a, i) => (
                      <Glass key={a.id} style={{ padding: "14px 16px", animation: `fadeUp .3s ease ${i * 40}ms both` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <span style={{ color: "#fff", fontWeight: "700", fontSize: "13px", fontFamily: "'Syne',sans-serif" }}>{a.client_name}</span>
                              <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "10px", background: a.status === "confirmed" ? "rgba(0,255,178,.1)" : a.status === "completed" ? "rgba(96,165,250,.1)" : "rgba(255,107,107,.1)", color: a.status === "confirmed" ? "#00FFB2" : a.status === "completed" ? "#60A5FA" : "#FF6B6B", border: `1px solid ${a.status === "confirmed" ? "rgba(0,255,178,.2)" : a.status === "completed" ? "rgba(96,165,250,.2)" : "rgba(255,107,107,.2)"}` }}>{a.status}</span>
                            </div>
                            <div style={{ color: "#888", fontSize: "11px" }}>{a.service} · {new Date(a.date).toLocaleDateString("en-GH", { weekday: "short", day: "numeric", month: "short" })} at {a.time}</div>
                            {a.client_phone && <div style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>{a.client_phone}</div>}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {a.status !== "completed" && (
                              <button onClick={async () => { await supabase.from("appointments").update({ status: "completed" }).eq("id", a.id); await loadAppointments(); notify("Marked complete!"); }} style={{ padding: "5px 10px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.15)", borderRadius: "6px", color: "#00FFB2", cursor: "pointer", fontSize: "9px", fontFamily: "inherit" }}>✓ Done</button>
                            )}
                            <button onClick={() => deleteAppointment(a.id)} style={{ padding: "5px 8px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "6px", color: "#666", cursor: "pointer", fontSize: "11px" }}>🗑</button>
                          </div>
                        </div>
                      </Glass>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── INVOICES ── */}
            {tab === "invoices" && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#FF6B6B", letterSpacing: ".22em" }}>FINN</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Invoices</span>
                  <span style={{ color: "#666", fontSize: "10px" }}>{invoices.filter(i => i.status === "pending").length} pending</span>
                  <button onClick={() => setShowInvForm(p => !p)} style={{ marginLeft: "auto", padding: "8px 16px", background: "linear-gradient(135deg,#FF6B6B,#E05555)", border: "none", borderRadius: "9px", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "11px", fontFamily: "inherit" }}>+ New Invoice</button>
                </div>

                {/* Summary cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "10px", marginBottom: "14px" }}>
                  {[
                    { label: "TOTAL BILLED", value: `GHS ${invoices.reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}`, color: "#FF6B6B" },
                    { label: "COLLECTED", value: `GHS ${invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}`, color: "#00FFB2" },
                    { label: "OUTSTANDING", value: `GHS ${invoices.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}`, color: "#FFD600" },
                  ].map((s, i) => (
                    <Glass key={i} style={{ padding: "14px" }}>
                      <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".15em", marginBottom: "6px" }}>{s.label}</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                    </Glass>
                  ))}
                </div>

                {showInvForm && (
                  <Glass style={{ padding: "18px", marginBottom: "14px", border: "1px solid rgba(255,107,107,.2)", animation: "fadeUp .3s ease" }}>
                    <div style={{ fontSize: "9px", color: "#FF6B6B", letterSpacing: ".22em", marginBottom: "14px" }}>NEW INVOICE</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "10px" }}>
                      {[
                        { label: "CLIENT NAME *", key: "client_name", placeholder: "e.g. Darko Enterprises" },
                        { label: "PHONE (WhatsApp)", key: "client_phone", placeholder: "+233XXXXXXXXX" },
                        { label: "AMOUNT (GHS) *", key: "amount", placeholder: "e.g. 2500", type: "number" },
                        { label: "DESCRIPTION", key: "description", placeholder: "e.g. Web design services" },
                        { label: "DUE DATE", key: "due_date", type: "date" },
                      ].map(f => (
                        <div key={f.key}>
                          <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".15em", marginBottom: "5px" }}>{f.label}</div>
                          <input
                            type={f.type || "text"}
                            placeholder={f.placeholder || ""}
                            value={newInv[f.key]}
                            onChange={e => setNewInv(p => ({ ...p, [f.key]: e.target.value }))}
                            style={{ width: "100%", padding: "9px 11px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "inherit" }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button onClick={saveInvoice} style={{ padding: "9px 20px", background: "linear-gradient(135deg,#FF6B6B,#E05555)", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>Save Invoice</button>
                      <button onClick={() => setShowInvForm(false)} style={{ padding: "9px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "8px", color: "#888", cursor: "pointer", fontSize: "13px" }}>✕</button>
                    </div>
                  </Glass>
                )}

                {invoices.length === 0 ? (
                  <Glass style={{ padding: "32px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "10px" }}>🧾</div>
                    <div style={{ color: "#666", fontSize: "12px" }}>No invoices yet. Create your first one above — Finn will follow up on payments automatically.</div>
                  </Glass>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {invoices.map((inv, i) => (
                      <Glass key={inv.id} style={{ padding: "14px 16px", animation: `fadeUp .3s ease ${i * 40}ms both`, border: inv.status === "overdue" ? "1px solid rgba(255,107,107,.2)" : "1px solid rgba(255,255,255,.07)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <span style={{ color: "#fff", fontWeight: "700", fontSize: "13px", fontFamily: "'Syne',sans-serif" }}>{inv.client_name}</span>
                              <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "10px", background: inv.status === "paid" ? "rgba(0,255,178,.1)" : inv.status === "overdue" ? "rgba(255,107,107,.1)" : "rgba(255,214,0,.1)", color: inv.status === "paid" ? "#00FFB2" : inv.status === "overdue" ? "#FF6B6B" : "#FFD600", border: `1px solid ${inv.status === "paid" ? "rgba(0,255,178,.2)" : inv.status === "overdue" ? "rgba(255,107,107,.2)" : "rgba(255,214,0,.2)"}` }}>{inv.status}</span>
                              <span style={{ color: "#FF6B6B", fontWeight: "800", fontSize: "13px", fontFamily: "'Syne',sans-serif", marginLeft: "4px" }}>GHS {Number(inv.amount).toLocaleString()}</span>
                            </div>
                            <div style={{ color: "#888", fontSize: "11px" }}>{inv.invoice_number} · {inv.description || "No description"}</div>
                            {inv.due_date && <div style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>Due: {new Date(inv.due_date).toLocaleDateString("en-GH")}</div>}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {inv.status !== "paid" && (
                              <button onClick={() => markInvoicePaid(inv.id)} style={{ padding: "5px 10px", background: "rgba(0,255,178,.06)", border: "1px solid rgba(0,255,178,.15)", borderRadius: "6px", color: "#00FFB2", cursor: "pointer", fontSize: "9px", fontFamily: "inherit" }}>✓ Paid</button>
                            )}
                            <button onClick={() => deleteInvoice(inv.id)} style={{ padding: "5px 8px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "6px", color: "#666", cursor: "pointer", fontSize: "11px" }}>🗑</button>
                          </div>
                        </div>
                      </Glass>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ADMIN PANEL ── */}
            {tab === "admin" && isAdmin && (
              <div style={{ animation: "fadeUp .4s ease" }}>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "9px", color: "#FFD600", letterSpacing: ".22em" }}>ADMIN</span>
                  <span style={{ color: "rgba(255,255,255,.08)" }}>·</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "'Syne',sans-serif" }}>Platform Control</span>
                  <button onClick={loadAdminData} style={{ marginLeft: "auto", padding: "5px 12px", background: "rgba(255,214,0,.06)", border: "1px solid rgba(255,214,0,.15)", borderRadius: "7px", color: "#FFD600", cursor: "pointer", fontSize: "9px", fontFamily: "inherit", letterSpacing: ".08em" }}>↻ REFRESH</button>
                </div>

                {/* Platform stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { label: "TOTAL USERS", value: adminUsers.length, color: "#00FFB2" },
                    { label: "TOTAL AGENTS", value: adminUsers.reduce((s, u) => s + u.agents.length, 0), color: "#FFD600" },
                    { label: "TOTAL TASKS", value: adminUsers.reduce((s, u) => s + u.tasks, 0).toLocaleString(), color: "#A78BFA" },
                    { label: "PRO USERS", value: adminUsers.filter(u => u.plan === "pro" || u.plan === "agency").length, color: "#FF6B6B" },
                  ].map((s, i) => (
                    <Glass key={i} style={{ padding: "16px", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />
                      <div style={{ fontSize: "8px", color: "#777", letterSpacing: ".16em", marginBottom: "8px" }}>{s.label}</div>
                      <div style={{ fontSize: "26px", fontWeight: "800", color: s.color, fontFamily: "'Syne',sans-serif" }}>{adminLoading ? "..." : s.value}</div>
                    </Glass>
                  ))}
                </div>

                {/* Users list */}
                {adminLoading ? (
                  <Glass style={{ padding: "24px", textAlign: "center" }}>
                    <div style={{ color: "#666", fontSize: "12px" }}>Loading platform data...</div>
                  </Glass>
                ) : adminUsers.length === 0 ? (
                  <Glass style={{ padding: "24px", textAlign: "center" }}>
                    <div style={{ color: "#666", fontSize: "12px" }}>No users yet. Click REFRESH to load.</div>
                  </Glass>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {adminUsers.map((u, i) => (
                      <Glass key={i} style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: "160px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(0,255,178,.08)", border: "1px solid rgba(0,255,178,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>👤</div>
                              <span style={{ color: "#ccc", fontSize: "11px", fontFamily: "monospace" }}>{u.user_id.slice(0, 12)}...</span>
                              {u.user_id === ADMIN_UID && <span style={{ background: "#FFD600", color: "#04050A", fontSize: "7px", padding: "1px 6px", borderRadius: "10px", fontWeight: "700" }}>YOU</span>}
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginLeft: "32px" }}>
                              <span style={{ fontSize: "10px", color: "#888" }}>{u.agents.length} agents</span>
                              <span style={{ fontSize: "10px", color: "#888" }}>{u.tasks} tasks</span>
                              <span style={{ fontSize: "10px", color: u.plan === "pro" || u.plan === "agency" ? "#00FFB2" : "#666" }}>{u.plan} plan</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                            <button
                              onClick={async () => {
                                if (u.user_id === ADMIN_UID) { notify("Cannot delete your own account!"); return; }
                                if (!confirm("Delete this user and all their data?")) return;
                                await supabase.from("agents").delete().eq("user_id", u.user_id);
                                await supabase.from("subscriptions").delete().eq("user_id", u.user_id);
                                await supabase.from("integrations").delete().eq("user_id", u.user_id);
                                setAdminUsers(p => p.filter(x => x.user_id !== u.user_id));
                                notify("User data deleted.");
                              }}
                              style={{ padding: "5px 10px", background: "rgba(255,107,107,.06)", border: "1px solid rgba(255,107,107,.15)", borderRadius: "6px", color: "#FF6B6B", cursor: "pointer", fontSize: "9px", fontFamily: "inherit" }}>
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                        {/* User's agents */}
                        {u.agents.length > 0 && (
                          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,.04)", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {u.agents.map((a, j) => (
                              <span key={j} style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "12px", background: `${a.color || "#00FFB2"}12`, border: `1px solid ${a.color || "#00FFB2"}25`, color: a.color || "#00FFB2" }}>
                                {a.icon} {a.name} · {a.status}
                              </span>
                            ))}
                          </div>
                        )}
                      </Glass>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>

          {/* Mobile bottom nav — 5 key tabs */}
          <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(4,5,10,.97)", borderTop: "1px solid rgba(255,255,255,.06)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", padding: "8px 0 env(safe-area-inset-bottom, 10px)", justifyContent: "space-around", alignItems: "center" }}>
            {[
              { id: "dashboard", label: "Home", icon: "◈" },
              { id: "agents", label: "Agents", icon: "◉" },
              { id: "messages", label: "Messages", icon: "💬" },
              { id: "invoices", label: "Invoices", icon: "🧾" },
              { id: "command", label: "Aria", icon: "◎" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "5px 10px", background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#00FFB2" : "#444", fontFamily: "inherit", transition: "all .15s", minWidth: "52px", position: "relative" }}>
                <span style={{ fontSize: "17px" }}>{t.icon}</span>
                <span style={{ fontSize: "8px", letterSpacing: ".04em", fontWeight: tab === t.id ? "600" : "400" }}>{t.label}</span>
                {tab === t.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "20px", height: "2px", borderRadius: "2px", background: "#00FFB2", boxShadow: "0 0 6px #00FFB2" }} />}
                {t.id === "messages" && metaMessages.length > 0 && tab !== "messages" && (
                  <div style={{ position: "absolute", top: "2px", right: "8px", width: "14px", height: "14px", borderRadius: "50%", background: "#00FFB2", fontSize: "7px", color: "#04050A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", border: "2px solid #04050A" }}>{metaMessages.length > 9 ? "9+" : metaMessages.length}</div>
                )}
              </button>
            ))}
          </nav>

        </div>
      </div>
    </div>
  );
}