import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TICKER = ["Customer Responses", "Appointment Booking", "Invoice Collection", "Sales Follow-Ups", "Client Onboarding", "Payment Reminders", "Lead Qualification", "Daily Reporting"];

const FEATURES = [
  { icon: "⚡", title: "Live in under 5 minutes", body: "No developers. No lengthy setup. Choose a business function, configure your agent in plain language, and it starts working immediately." },
  { icon: "🔗", title: "Works with tools you already use", body: "WhatsApp Business, Gmail, Stripe, Google Calendar, and more. Your agents operate inside the systems your business already runs on." },
  { icon: "🧠", title: "Intelligent, not scripted", body: "Powered by Google Gemini AI, each agent understands context, handles nuance, and makes decisions — the way a trained employee would." },
  { icon: "📊", title: "Full visibility, always", body: "Every action your agent takes is logged with a clear reason. You stay in control while your agent handles the workload." },
  { icon: "🔒", title: "Built for business trust", body: "Your data is isolated, encrypted, and never used to train any AI model. Enterprise-grade security from day one." },
  { icon: "📈", title: "Grows as your business grows", body: "Start with one agent handling 100 tasks a month. Scale to a full team of agents running your entire operation — no infrastructure to manage." },
];

const TESTIMONIALS = [
  { name: "Kwame Asante", biz: "Asante Auto Services, Accra", quote: "I was spending hours every week on WhatsApp answering the same booking questions. AgentFlow handles all of that now. My team focuses on actual work, and customers get faster responses than ever.", avatar: "👨🏾‍🔧" },
  { name: "Abena Mensah", biz: "Mensah Legal, Kumasi", quote: "Every inquiry used to take 20 minutes of my time just to assess. Now my agent qualifies leads before I ever see them. I only speak to serious clients. My close rate has improved significantly.", avatar: "👩🏾‍💼" },
  { name: "Kofi Darko", biz: "Darko Consulting Group", quote: "Chasing overdue invoices was taking up real time and damaging relationships. AgentFlow sends reminders automatically, professionally, and on schedule. I have recovered revenue I would have written off.", avatar: "👨🏾‍💻" },
];

const PLANS = [
  {
    name: "Free", price: "GH₵0", period: "/mo",
    tag: null,
    who: "Perfect for testing the system",
    features: [
      "Up to 50 automated messages/mo",
      "1 WhatsApp number connected",
      "Basic dashboard",
      "Email support",
    ],
    cta: "Start free — no card", highlight: false
  },
  {
    name: "Starter", price: "GH₵179", period: "/mo",
    tag: null,
    who: "Shops, salons & freelancers",
    features: [
      "Up to 500 automated messages/mo",
      "1 WhatsApp number",
      "Quick replies & labels",
      "Appointment reminders",
      "Email + WhatsApp support",
    ],
    cta: "Get started", highlight: false
  },
  {
    name: "Growth", price: "GH₵449", period: "/mo",
    tag: "MOST POPULAR",
    who: "Clinics, restaurants & growing shops",
    features: [
      "Up to 2,000 automated messages/mo",
      "2–3 WhatsApp numbers",
      "Appointment & order reminders",
      "Customer tracking dashboard",
      "Analytics reports",
      "Email + WhatsApp support",
    ],
    cta: "Start Growth plan", highlight: true
  },
  {
    name: "Agency", price: "GH₵1,199", period: "/mo",
    tag: null,
    who: "Multi-location businesses & agencies",
    features: [
      "Unlimited automated messages",
      "Multiple WhatsApp numbers",
      "Full analytics dashboard",
      "Multi-user access",
      "Premium support (WhatsApp + call)",
      "Custom integrations",
    ],
    cta: "Contact us", highlight: false
  },
];

// Animated counter hook
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setVal(suffix === "%" ? (eased * numeric).toFixed(1) + suffix : Math.floor(eased * numeric) + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start]);
  return val || "0";
}

// Intersection observer hook
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// Metric card with animated counter
function MetricCard({ label, val, color, start }) {
  const animated = useCounter(val, 1600, start);
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "10px", padding: "20px 16px", transition: "border-color .3s" }}>
      <div style={{ fontSize: "10px", color: "#4a4a5a", fontFamily: "monospace", marginBottom: "10px", letterSpacing: ".08em" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: "30px", fontWeight: "700", color, fontFamily: "'Space Mono', monospace", letterSpacing: "-.02em" }}>{animated}</div>
    </div>
  );
}

// Demo Modal
function DemoModal({ onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Auto-advance steps
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    {
      icon: "✦",
      label: "Step 1",
      title: "Describe what you need",
      detail: "Tell AgentFlow what your business does. No forms, no technical setup — just plain language.",
      before: "You spend 2hrs/day answering the same WhatsApp messages.",
      after: "Your agent handles every inquiry instantly, 24/7.",
    },
    {
      icon: "✦",
      label: "Step 2",
      title: "Connect in one click",
      detail: "Link your WhatsApp, Gmail, or calendar. AgentFlow plugs directly into what you already use.",
      before: "Missed appointments cost you revenue every week.",
      after: "Automated reminders. Zero no-shows.",
    },
    {
      icon: "✦",
      label: "Step 3",
      title: "Watch your business run itself",
      detail: "Your agent goes live immediately. You see every action in your dashboard — always in control.",
      before: "Chasing late payments is awkward and time-consuming.",
      after: "Professional follow-ups sent automatically. Revenue recovered.",
    },
  ];

  const results = [
    { metric: "3.2hrs", label: "saved per day on average" },
    { metric: "94%", label: "of messages handled automatically" },
    { metric: "GH₵0", label: "to get started today" },
  ];

  const s = steps[activeStep];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(4,3,8,.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "modalIn .3s cubic-bezier(.16,1,.3,1)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0B0A12", border: "1px solid rgba(255,255,255,.08)", borderRadius: "24px", maxWidth: "780px", width: "100%", overflow: "hidden", animation: "modalSlide .45s cubic-bezier(.16,1,.3,1)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Top accent line */}
        <div style={{ height: "3px", background: "linear-gradient(90deg,transparent,#8B4513,#C1602A,transparent)" }} />

        {/* Header */}
        <div style={{ padding: "36px 44px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", letterSpacing: ".22em", color: "#8B4513", marginBottom: "10px" }}>SEE IT IN ACTION</p>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: "700", color: "#F5F0E8", lineHeight: 1.15 }}>
              This is what your business<br />looks like with AgentFlow.
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: "#666", fontSize: "16px", width: "38px", height: "38px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s", marginLeft: "20px" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.11)"; e.currentTarget.style.color = "#ccc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#666"; }}>✕</button>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", gap: "8px", padding: "0 44px 28px" }}>
          {steps.map((st, i) => (
            <button key={i} onClick={() => setActiveStep(i)} style={{ flex: 1, padding: "10px 8px", borderRadius: "8px", border: `1px solid ${activeStep === i ? "rgba(139,69,19,.5)" : "rgba(255,255,255,.06)"}`, background: activeStep === i ? "rgba(139,69,19,.1)" : "rgba(255,255,255,.02)", cursor: "pointer", transition: "all .25s", textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".12em", color: activeStep === i ? "#C1602A" : "#444", marginBottom: "4px" }}>{st.label.toUpperCase()}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: activeStep === i ? "#F5F0E8" : "#555", fontWeight: "500", lineHeight: 1.3 }}>{st.title}</div>
            </button>
          ))}
        </div>

        {/* Step detail */}
        <div style={{ padding: "0 44px 32px", animation: "modalStepIn .4s cubic-bezier(.16,1,.3,1)" }} key={activeStep}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "#7a7060", lineHeight: 1.7, fontWeight: "300", marginBottom: "28px" }}>{s.detail}</p>

          {/* Before / After */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
            <div style={{ background: "rgba(255,80,80,.04)", border: "1px solid rgba(255,80,80,.12)", borderRadius: "12px", padding: "20px 22px" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".18em", color: "#ff6060", marginBottom: "10px" }}>WITHOUT AGENTFLOW</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "#6a5a5a", lineHeight: 1.6, fontWeight: "300" }}>{s.before}</p>
            </div>
            <div style={{ background: "rgba(139,69,19,.06)", border: "1px solid rgba(139,69,19,.2)", borderRadius: "12px", padding: "20px 22px" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".18em", color: "#C1602A", marginBottom: "10px" }}>WITH AGENTFLOW ✦</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "#C8BFB0", lineHeight: 1.6, fontWeight: "300" }}>{s.after}</p>
            </div>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "32px" }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{ width: i === activeStep ? "24px" : "6px", height: "6px", borderRadius: "3px", background: i === activeStep ? "#8B4513" : "rgba(255,255,255,.12)", transition: "all .35s cubic-bezier(.16,1,.3,1)", cursor: "pointer" }} />
            ))}
          </div>
        </div>

        {/* Results bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {results.map((r, i) => (
            <div key={i} style={{ padding: "24px 20px", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: "28px", fontWeight: "700", color: "#F5F0E8", marginBottom: "6px", letterSpacing: "-.02em" }}>{r.metric}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#555", fontWeight: "300" }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* CTA inside modal */}
        <div style={{ padding: "24px 44px 36px", textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#555", marginBottom: "16px", fontWeight: "300" }}>
            Join business owners across Ghana already using AgentFlow.
          </p>
          <button onClick={onClose} style={{ background: "linear-gradient(135deg,#8B4513,#C1602A)", color: "#F5F0E8", border: "none", borderRadius: "6px", padding: "14px 40px", fontFamily: "'DM Sans',sans-serif", fontSize: "15px", fontWeight: "600", cursor: "pointer", letterSpacing: ".03em", transition: "all .25s", boxShadow: "0 8px 32px rgba(139,69,19,.35)" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            Start free — no credit card needed →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [dashRef, dashInView] = useInView(0.2);
  const [featRef, featInView] = useInView(0.1);
  const [testRef, testInView] = useInView(0.1);
  const [pricRef, pricInView] = useInView(0.1);
  const [ctaRef, ctaInView] = useInView(0.2);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouse = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  useEffect(() => { if (scrollY > 10) setMobileMenuOpen(false); }, [scrollY]);

  const submit = (e) => { e.preventDefault(); if (email) setSubmitted(true); };
  const launch = () => { setLaunching(true); setTimeout(() => navigate("/app"), 1800); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,600;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}

        /* ── Cursor glow ── */
        .cursor-glow{pointer-events:none;position:fixed;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(139,69,19,.07) 0%,transparent 70%);transform:translate(-50%,-50%);transition:opacity .4s;z-index:0;will-change:transform}

        /* ── Grain overlay ── */
        .grain::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9990;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px}

        /* ── Fonts ── */
        .sans{font-family:'DM Sans',sans-serif}
        .display{font-family:'Fraunces',serif}
        .mono{font-family:'Space Mono',monospace}

        /* ── Launch overlay ── */
        @keyframes launchFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes logoScale{0%{transform:scale(.7);opacity:0}40%{transform:scale(1.08);opacity:1}70%{transform:scale(.97)}100%{transform:scale(1);opacity:1}}
        @keyframes logoGlow{0%,100%{box-shadow:0 0 30px rgba(139,69,19,.4)}50%{box-shadow:0 0 70px rgba(139,69,19,.7)}}
        @keyframes taglineUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes launchBar{from{width:0}to{width:100%}}

        /* ── Hero animations ── */
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ticker{
          0%{opacity:0;transform:translateY(14px) scale(.96)}
          10%{opacity:1;transform:translateY(0) scale(1)}
          88%{opacity:1;transform:translateY(0) scale(1)}
          100%{opacity:0;transform:translateY(-14px) scale(.96)}
        }
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes revealLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes revealRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes dashIn{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes borderGlow{0%,100%{border-color:rgba(139,69,19,.2)}50%{border-color:rgba(139,69,19,.6)}}
        @keyframes orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(.97)}100%{transform:translate(0,0) scale(1)}}

        /* ── Modal ── */
        @keyframes modalIn{from{opacity:0}to{opacity:1}}
        @keyframes modalSlide{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes modalStepIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}

        /* ── Scroll-reveal ── */
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .reveal.in{opacity:1;transform:translateY(0)}
        .reveal-left{opacity:0;transform:translateX(-28px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .reveal-left.in{opacity:1;transform:translateX(0)}
        .reveal-scale{opacity:0;transform:scale(.94);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
        .reveal-scale.in{opacity:1;transform:scale(1)}

        /* ── Staggered cards ── */
        .stagger-0{transition-delay:.0s}
        .stagger-1{transition-delay:.1s}
        .stagger-2{transition-delay:.2s}
        .stagger-3{transition-delay:.3s}
        .stagger-4{transition-delay:.4s}
        .stagger-5{transition-delay:.5s}

        /* ── Buttons ── */
        .btn-primary{background:#1A1410;color:#F5F0E8;padding:16px 40px;border-radius:3px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.04em;transition:all .25s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}
        .btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent);opacity:0;transition:opacity .25s}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(26,20,16,.35)}
        .btn-primary:hover::after{opacity:1}
        .btn-primary:active{transform:translateY(0)}

        .btn-ghost{background:transparent;color:#1A1410;padding:15px 36px;border-radius:3px;border:1.5px solid rgba(26,20,16,.25);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.04em;transition:all .25s cubic-bezier(.16,1,.3,1)}
        .btn-ghost:hover{background:#1A1410;color:#F5F0E8;border-color:#1A1410;transform:translateY(-2px)}

        .btn-watch{background:transparent;color:#1A1410;padding:15px 36px;border-radius:3px;border:1.5px solid rgba(26,20,16,.25);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.04em;transition:all .25s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;gap:10px}
        .btn-watch:hover{background:#1A1410;color:#F5F0E8;border-color:#1A1410;transform:translateY(-2px)}
        .play-icon{width:28px;height:28px;border-radius:50%;background:#8B4513;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s}
        .btn-watch:hover .play-icon{transform:scale(1.1)}

        /* ── Cards ── */
        .feature-card{background:#F5F0E8;padding:48px 36px;transition:all .4s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;cursor:default}
        .feature-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(139,69,19,.03),transparent);opacity:0;transition:opacity .4s}
        .feature-card:hover{transform:translateY(-6px);background:#fff;box-shadow:0 24px 80px rgba(26,20,16,.12)}
        .feature-card:hover::before{opacity:1}
        .feature-icon{font-size:32px;margin-bottom:20px;display:inline-block;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
        .feature-card:hover .feature-icon{transform:scale(1.15) rotate(-4deg)}

        .plan-card{transition:all .35s cubic-bezier(.16,1,.3,1)}
        .plan-card:hover{transform:translateY(-8px)}

        .testimonial-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:6px;padding:40px 32px;transition:all .4s cubic-bezier(.16,1,.3,1)}
        .testimonial-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.13);transform:translateY(-4px)}

        /* ── Nav ── */
        .nav-link{text-decoration:none;color:#666;transition:color .2s;font-family:'DM Sans',sans-serif;font-size:14px;position:relative}
        .nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1px;background:#8B4513;transition:width .25s}
        .nav-link:hover{color:#1A1410}
        .nav-link:hover::after{width:100%}

        /* ── Ticker ── */
        .ticker-word{animation:ticker 2.2s ease;display:inline-block}

        /* ── Social bar marquee ── */
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .marquee-track{display:flex;gap:64px;animation:marquee 20s linear infinite;width:max-content}
        .marquee-track:hover{animation-play-state:paused}

        /* ── Dashboard live dot ── */
        @keyframes livePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#28CA41;animation:livePulse 1.8s ease infinite}

        /* ── Shimmer badge ── */
        .shimmer-badge{background:linear-gradient(90deg,rgba(139,69,19,.08) 0%,rgba(139,69,19,.18) 50%,rgba(139,69,19,.08) 100%);background-size:200% auto;animation:shimmer 2.5s linear infinite}

        /* ── Mobile ── */
        .mobile-menu{display:none;position:fixed;top:68px;left:0;right:0;z-index:99;background:rgba(245,240,232,.98);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(26,20,16,.1);padding:20px 24px 28px;flex-direction:column;gap:0;animation:slideDown .2s ease}
        .mobile-menu.open{display:flex}
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .desktop-cta{display:none!important}
          .hamburger{display:flex!important}
          .hero-trust{flex-direction:column;gap:12px!important;align-items:flex-start!important}
          .hero-btns{flex-direction:column;width:100%;gap:12px!important}
          .hero-btns button{width:100%!important;justify-content:center!important}
          .features-grid{grid-template-columns:1fr!important}
          .features-grid .feature-card{padding:32px 24px!important}
          .testimonials-grid{grid-template-columns:1fr!important}
          .pricing-grid{grid-template-columns:1fr!important;gap:12px!important}
          .footer-inner{flex-direction:column;gap:20px;text-align:center}
          .footer-links{justify-content:center!important}
          .dashboard-preview{display:none!important}
          .hero-section{padding:100px 24px 60px!important}
          .section-pad{padding:80px 24px!important}
          .hero-h1{font-size:clamp(38px,11vw,60px)!important}
          .ticker-min{min-width:150px!important}
          .cta-section{padding:80px 24px!important}
          .nav-pad{padding:0 20px!important}
          .cursor-glow{display:none}
        }
        @media(min-width:769px){
          .hamburger{display:none!important}
          .mobile-menu{display:none!important}
        }
      `}</style>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Grain */}
      <div className="grain" />

      {/* Demo modal */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

      {/* Launch transition */}
      {launching && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#04050A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "launchFadeIn .35s ease forwards" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "18px", background: "linear-gradient(135deg,#8B4513,#C1602A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',serif", fontWeight: "900", color: "#F5F0E8", fontSize: "36px", animation: "logoScale .6s cubic-bezier(.16,1,.3,1) forwards, logoGlow 1.2s ease .6s infinite", marginBottom: "24px" }}>A</div>
          <div style={{ color: "#fff", fontFamily: "'Fraunces',serif", fontSize: "22px", fontWeight: "700", letterSpacing: ".04em", animation: "taglineUp .5s ease .4s both", marginBottom: "8px" }}>AgentFlow</div>
          <div style={{ color: "#8B4513", fontFamily: "monospace", fontSize: "11px", letterSpacing: ".25em", animation: "taglineUp .5s ease .55s both", marginBottom: "48px" }}>GHANA 🇬🇭</div>
          <div style={{ width: "160px", height: "2px", background: "rgba(255,255,255,.08)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#8B4513", borderRadius: "2px", animation: "launchBar 1.4s cubic-bezier(.4,0,.2,1) .3s forwards", width: 0 }} />
          </div>
        </div>
      )}

      <div style={{ background: "#F5F0E8", color: "#1A1410", fontFamily: "'Georgia','Times New Roman',serif", overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav className="sans nav-pad" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 60px", height: "68px", background: scrollY > 40 ? "rgba(245,240,232,0.97)" : "transparent", backdropFilter: scrollY > 40 ? "blur(16px)" : "none", WebkitBackdropFilter: scrollY > 40 ? "blur(16px)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(26,20,16,.08)" : "none", transition: "all .35s cubic-bezier(.16,1,.3,1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 2 }}>
            <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg,#1A1410,#3D2E22)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", fontWeight: "900", fontSize: "15px", fontFamily: "'Fraunces', serif", boxShadow: "0 2px 8px rgba(26,20,16,.25)" }}>A</div>
            <span style={{ fontWeight: "600", fontSize: "15px", letterSpacing: ".02em" }}>AgentFlow</span>
          </div>
          <div className="desktop-nav" style={{ display: "flex", gap: "36px" }}>
            {["Features", "Pricing", "Testimonials"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
            ))}
          </div>
          <div className="desktop-cta" style={{ display: "flex", gap: "10px" }}>
            <button className="btn-ghost" onClick={launch} style={{ padding: "8px 20px", fontSize: "13px" }}>Log in</button>
            <button className="btn-primary" onClick={launch} style={{ padding: "9px 22px", fontSize: "13px" }}>Start free →</button>
          </div>
          <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "5px", zIndex: 2 }}>
            <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", transform: mobileMenuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", opacity: mobileMenuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", transform: mobileMenuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
          {["Features", "Pricing", "Testimonials"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#1A1410", fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: "500", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.07)", display: "block" }}>{l}</a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            <button className="btn-ghost" onClick={launch} style={{ width: "100%", textAlign: "center" }}>Log in</button>
            <button className="btn-primary" onClick={launch} style={{ width: "100%", textAlign: "center" }}>Start free →</button>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "130px 60px 90px", textAlign: "center", position: "relative", background: "linear-gradient(160deg,#F8F3EB 0%,#EDE5D8 55%,#E5DAC8 100%)", overflow: "hidden" }}>
          {/* Background orbs */}
          <div style={{ position: "absolute", top: "8%", left: "3%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.06) 0%,transparent 70%)", animation: "orb 12s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "4%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.05) 0%,transparent 70%)", animation: "orb 16s ease-in-out 3s infinite", pointerEvents: "none" }} />
          {/* Decorative lines */}
          <div style={{ position: "absolute", top: "18%", left: "6%", width: "1px", height: "180px", background: "linear-gradient(180deg,transparent,rgba(26,20,16,.12),transparent)" }} />
          <div style={{ position: "absolute", top: "22%", right: "9%", width: "1px", height: "120px", background: "linear-gradient(180deg,transparent,rgba(26,20,16,.1),transparent)" }} />

          {/* Badge */}
          <div className="sans shimmer-badge" style={{ animation: "fadeUp .6s ease .1s both, shimmer 2.5s linear infinite", fontSize: "11px", letterSpacing: ".22em", color: "#8B4513", marginBottom: "32px", textTransform: "uppercase", padding: "6px 16px", borderRadius: "100px", border: "1px solid rgba(139,69,19,.2)", display: "inline-block" }}>
            The Business Automation Platform · Built for Ghana 🇬🇭
          </div>

          {/* H1 */}
          <h1 className="display hero-h1" style={{ fontSize: "clamp(40px,6.5vw,88px)", fontWeight: "700", lineHeight: "1.05", maxWidth: "860px", marginBottom: "20px", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .2s both", letterSpacing: "-.02em" }}>
            Your business deserves a team that never sleeps.
          </h1>

          {/* Animated role line — separate so ticker never clips */}
          <div style={{ fontSize: "clamp(20px,3vw,36px)", fontFamily: "'Fraunces',serif", fontWeight: "300", fontStyle: "italic", color: "#8B4513", marginBottom: "28px", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .32s both", lineHeight: 1.3, minHeight: "1.4em", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ color: "#aaa", fontStyle: "normal", fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(16px,2.2vw,24px)", fontWeight: "300" }}>Right now, you're manually handling</span>
            <span style={{ display: "inline-block", minWidth: "260px", textAlign: "left" }}>
              <span key={tickerIdx} className="ticker-word">{TICKER[tickerIdx]}</span>
            </span>
          </div>

          {/* Subheading */}
          <p className="sans" style={{ fontSize: "17px", color: "#7a7060", maxWidth: "500px", lineHeight: "1.78", marginBottom: "48px", fontWeight: "300", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .44s both" }}>
            AgentFlow gives your business intelligent agents that handle operations 24/7 — responding to clients, collecting payments, booking appointments, and following up — while you focus on growing.
          </p>

          {/* CTA buttons */}
          <div className="hero-btns" style={{ display: "flex", gap: "14px", alignItems: "center", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .5s both" }}>
            <button className="btn-primary" onClick={launch} style={{ fontSize: "16px", padding: "17px 44px" }}>
              Start free — no card needed
            </button>
            <button className="btn-watch" onClick={() => setShowDemo(true)} style={{ fontSize: "15px", padding: "15px 28px" }}>
              <span className="play-icon">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M1 1L9 6L1 11V1Z" fill="#F5F0E8" /></svg>
              </span>
              See how it works
            </button>
          </div>

          {/* Trust line */}
          <div className="sans hero-trust" style={{ marginTop: "48px", fontSize: "13px", color: "#aaa", display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .65s both" }}>
            {["Free forever plan available", "No technical skills required", "Your first agent live in 5 minutes"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#8B4513" }}>✓</span> {t}
              </span>
            ))}
          </div>

          {/* Dashboard preview */}
          <div ref={dashRef} className="dashboard-preview" style={{ marginTop: "88px", width: "100%", maxWidth: "920px", background: "#080810", borderRadius: "16px", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden", boxShadow: "0 80px 160px rgba(26,20,16,.25), 0 0 0 1px rgba(255,255,255,.04)", animation: dashInView ? "dashIn .9s cubic-bezier(.16,1,.3,1) forwards" : "none", opacity: dashInView ? 1 : 0, transition: "animation .1s" }}>
            {/* Browser chrome */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", gap: "8px", alignItems: "center", background: "rgba(255,255,255,.02)" }}>
              {["#FF5F57","#FFBD2E","#28CA41"].map(c => <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c }} />)}
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "rgba(255,255,255,.05)", borderRadius: "6px", padding: "5px 18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="live-dot" />
                  <span style={{ color: "#444", fontSize: "12px", fontFamily: "monospace" }}>agentflow.io/dashboard</span>
                </div>
              </div>
            </div>
            {/* Metrics */}
            <div style={{ padding: "28px 28px 8px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
              {[
                { label: "Tasks Automated", val: "486", color: "#00FFB2" },
                { label: "Hours Saved", val: "312h", color: "#FFD600" },
                { label: "Active Agents", val: "3", color: "#A78BFA" },
                { label: "Success Rate", val: "97.5%", color: "#FF6B6B" },
              ].map(m => <MetricCard key={m.label} {...m} start={dashInView} />)}
            </div>
            {/* Agent rows */}
            <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Rex", role: "Customer Support", status: "Active", tasks: "142 tasks", color: "#00FFB2" },
                { name: "Finn", role: "Finance & Invoicing", status: "Active", tasks: "98 tasks", color: "#A78BFA" },
                { name: "Lea", role: "Lead Capture", status: "Idle", tasks: "57 tasks", color: "#FFD600" },
              ].map((a, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.05)", borderRadius: "8px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${a.color}18`, border: `1px solid ${a.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: a.color, fontFamily: "monospace" }}>{a.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#D0C8BC", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", fontWeight: "500" }}>{a.name} <span style={{ color: "#444", fontWeight: "300" }}>· {a.role}</span></div>
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#444" }}>{a.tasks}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.status === "Active" ? "#28CA41" : "#444", animation: a.status === "Active" ? "livePulse 1.8s ease infinite" : "none" }} />
                    <span style={{ fontSize: "11px", color: a.status === "Active" ? "#28CA41" : "#555", fontFamily: "monospace" }}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <div className="sans" style={{ background: "#1A1410", padding: "18px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <div className="marquee-track">
            {[...["Trusted by Ghanaian businesses 🇬🇭", "Powered by Google Gemini AI", "No technical skills needed", "First agent live in 5 minutes", "SOC 2 ready infrastructure", "WhatsApp & Gmail native", "Trusted by Ghanaian businesses 🇬🇭", "Powered by Google Gemini AI", "No technical skills needed", "First agent live in 5 minutes", "SOC 2 ready infrastructure", "WhatsApp & Gmail native"]].map((t, i) => (
              <span key={i} className="sans" style={{ color: "#555", whiteSpace: "nowrap", fontSize: "12px", letterSpacing: ".08em" }}>
                {t} <span style={{ color: "#3a2a20", marginLeft: "32px" }}>✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="section-pad" style={{ padding: "130px 60px", maxWidth: "1100px", margin: "0 auto" }}>
          <div ref={featRef} style={{ textAlign: "center", marginBottom: "88px" }}>
            <p className={`sans reveal stagger-0 ${featInView ? "in" : ""}`} style={{ fontSize: "11px", letterSpacing: ".25em", color: "#aaa", marginBottom: "18px" }}>WHAT AGENTFLOW DOES</p>
            <h2 className={`display reveal stagger-1 ${featInView ? "in" : ""}`} style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: "700", lineHeight: "1.08" }}>
              Your business, running itself.<br /><em style={{ fontStyle: "italic", color: "#8B4513" }}>Finally.</em>
            </h2>
            <p className={`sans reveal stagger-2 ${featInView ? "in" : ""}`} style={{ fontSize: "17px", color: "#999", maxWidth: "500px", margin: "20px auto 0", lineHeight: 1.7, fontWeight: "300" }}>
              Every feature is built around one goal: give business owners in Ghana back their time, while delivering a better experience to their customers.
            </p>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", background: "rgba(26,20,16,.07)", outline: "2px solid rgba(26,20,16,.07)" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card reveal stagger-${i} ${featInView ? "in" : ""}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="display" style={{ fontSize: "21px", fontWeight: "600", marginBottom: "14px", letterSpacing: "-.01em" }}>{f.title}</h3>
                <p className="sans" style={{ fontSize: "15px", color: "#888", lineHeight: "1.75", fontWeight: "300" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" style={{ background: "#110E0A", padding: "130px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.06) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div ref={testRef} style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "80px" }}>
              <p className={`sans reveal ${testInView ? "in" : ""}`} style={{ fontSize: "11px", letterSpacing: ".25em", color: "#555", marginBottom: "18px" }}>BUSINESSES ALREADY SAVING TIME</p>
              <h2 className={`display reveal stagger-1 ${testInView ? "in" : ""}`} style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: "700", color: "#F5F0E8", lineHeight: "1.08" }}>
                Hours saved. Revenue recovered.<br /><em style={{ color: "#8B4513", fontStyle: "italic" }}>Businesses transformed.</em>
              </h2>
              <p className={`sans reveal stagger-2 ${testInView ? "in" : ""}`} style={{ fontSize: "16px", color: "#555", maxWidth: "480px", margin: "20px auto 0", lineHeight: 1.7, fontWeight: "300" }}>
                Real owners running real businesses in Ghana — here's what changed when they let their agents handle the work.
              </p>
            </div>
            <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`testimonial-card reveal stagger-${i} ${testInView ? "in" : ""}`}>
                  <div style={{ fontSize: "44px", color: "#8B4513", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: "24px", opacity: .7 }}>"</div>
                  <p className="sans" style={{ fontSize: "16px", color: "#9a9080", lineHeight: "1.8", marginBottom: "36px", fontWeight: "300" }}>{t.quote}</p>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ width: "46px", height: "46px", minWidth: "46px", borderRadius: "50%", background: "rgba(139,69,19,.12)", border: "1px solid rgba(139,69,19,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{t.avatar}</div>
                    <div>
                      <div className="sans" style={{ color: "#F5F0E8", fontWeight: "600", fontSize: "14px" }}>{t.name}</div>
                      <div className="sans" style={{ color: "#555", fontSize: "12px", marginTop: "2px" }}>{t.biz}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="section-pad" style={{ padding: "130px 60px", maxWidth: "1100px", margin: "0 auto" }}>
          <div ref={pricRef} style={{ textAlign: "center", marginBottom: "80px" }}>
            <p className={`sans reveal ${pricInView ? "in" : ""}`} style={{ fontSize: "11px", letterSpacing: ".25em", color: "#aaa", marginBottom: "18px" }}>PRICING IN GHANA CEDIS</p>
            <h2 className={`display reveal stagger-1 ${pricInView ? "in" : ""}`} style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: "700", lineHeight: "1.08" }}>Invest in automation.<br /><em style={{ color: "#8B4513", fontStyle: "italic" }}>Not in extra staff.</em></h2>
            <p className={`sans reveal stagger-2 ${pricInView ? "in" : ""}`} style={{ color: "#999", fontSize: "16px", marginTop: "16px", fontWeight: "300" }}>Start for free. Upgrade when your business demands it. Every plan pays for itself within weeks.</p>
          </div>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
            {PLANS.map((plan, i) => (
              <div key={i} className={`plan-card reveal stagger-${i} ${pricInView ? "in" : ""}`} style={{ background: plan.highlight ? "#1A1410" : "#fff", border: plan.highlight ? "1px solid rgba(139,69,19,.25)" : "1px solid rgba(26,20,16,.09)", borderRadius: "6px", padding: "40px 28px", position: "relative", boxShadow: plan.highlight ? "0 0 0 1px rgba(139,69,19,.15), 0 40px 80px rgba(26,20,16,.15)" : "none" }}>
                {plan.tag && (
                  <div className="sans" style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#8B4513", color: "#fff", fontSize: "10px", letterSpacing: ".15em", padding: "4px 16px", borderRadius: "20px", whiteSpace: "nowrap" }}>{plan.tag}</div>
                )}
                <div className="sans" style={{ fontSize: "11px", letterSpacing: ".18em", color: plan.highlight ? "#666" : "#bbb", marginBottom: "8px" }}>{plan.name.toUpperCase()}</div>
                <div className="sans" style={{ fontSize: "12px", color: plan.highlight ? "#7a6a5a" : "#aaa", marginBottom: "20px", fontWeight: "300", lineHeight: 1.4 }}>{plan.who}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "28px" }}>
                  <span className="display" style={{ fontSize: "42px", fontWeight: "700", color: plan.highlight ? "#F5F0E8" : "#1A1410", letterSpacing: "-.02em" }}>{plan.price}</span>
                  <span className="sans" style={{ color: "#888", fontSize: "13px" }}>{plan.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "11px", marginBottom: "32px" }}>
                  {plan.features.map((f, j) => (
                    <div key={j} className="sans" style={{ fontSize: "13.5px", color: plan.highlight ? "#9a9080" : "#666", display: "flex", gap: "10px", lineHeight: 1.4 }}>
                      <span style={{ color: "#8B4513", flexShrink: 0, marginTop: "1px" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  style={{ width: "100%", padding: "13px", background: plan.highlight ? "#F5F0E8" : "#1A1410", color: plan.highlight ? "#1A1410" : "#F5F0E8", border: "none", borderRadius: "3px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "500", letterSpacing: ".04em", transition: "all .25s cubic-bezier(.16,1,.3,1)" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = ".88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaRef} className="cta-section" style={{ background: "#0E0A06", padding: "140px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.12) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className={`sans reveal ${ctaInView ? "in" : ""}`} style={{ fontSize: "11px", letterSpacing: ".25em", color: "#555", marginBottom: "24px" }}>YOUR NEXT MOVE</p>
            <h2 className={`display reveal stagger-1 ${ctaInView ? "in" : ""}`} style={{ fontSize: "clamp(36px,6vw,76px)", fontWeight: "900", color: "#F5F0E8", lineHeight: "1.04", marginBottom: "24px" }}>
              Every day you wait,<br /><em style={{ color: "#8B4513" }}>a competitor moves faster.</em>
            </h2>
            <p className={`sans reveal stagger-2 ${ctaInView ? "in" : ""}`} style={{ color: "rgba(245,240,232,.45)", fontSize: "18px", fontWeight: "300", maxWidth: "540px", margin: "0 auto 16px" }}>
              AgentFlow gives your business the operational edge that was previously only available to large companies with big teams.
            </p>
            <p className={`sans reveal stagger-2 ${ctaInView ? "in" : ""}`} style={{ color: "rgba(245,240,232,.3)", fontSize: "15px", marginBottom: "52px", fontWeight: "300" }}>
              Start free. No credit card. No commitment. Your first agent is live in 5 minutes.
            </p>
            <div className={`reveal stagger-3 ${ctaInView ? "in" : ""}`}>
              {!submitted ? (
                <form onSubmit={submit} style={{ display: "flex", gap: "0", maxWidth: "480px", margin: "0 auto", flexWrap: "wrap", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                  <input
                    type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    style={{ flex: "1 1 220px", padding: "17px 22px", fontSize: "15px", border: "none", background: "rgba(255,255,255,.06)", color: "#F5F0E8", fontFamily: "'DM Sans',sans-serif", outline: "none", minWidth: "180px" }}
                  />
                  <button type="submit" style={{ flex: "0 0 auto", padding: "17px 30px", background: "#8B4513", color: "#F5F0E8", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "15px", fontWeight: "500", whiteSpace: "nowrap", transition: "background .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#A0511A"}
                    onMouseLeave={e => e.currentTarget.style.background = "#8B4513"}
                  >Get early access →</button>
                </form>
              ) : (
                <div className="sans" style={{ color: "#F5F0E8", fontSize: "17px", background: "rgba(139,69,19,.15)", border: "1px solid rgba(139,69,19,.25)", padding: "20px 40px", borderRadius: "4px", display: "inline-block" }}>
                  ✓ You're on the list! We'll be in touch shortly.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="sans" style={{ background: "#080604", padding: "40px 60px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#333" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "22px", height: "22px", background: "rgba(245,240,232,.08)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "900", fontFamily: "'Fraunces', serif", color: "#F5F0E8" }}>A</div>
              <span style={{ color: "#444" }}>AgentFlow © 2026 · Built in Ghana 🇬🇭</span>
            </div>
            <div className="footer-links" style={{ display: "flex", gap: "32px" }}>
              {["Privacy", "Terms", "Status", "Contact"].map(l => (
                <a key={l} href="#" style={{ color: "#333", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = "#888"}
                  onMouseLeave={e => e.target.style.color = "#333"}>{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}