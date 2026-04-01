import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TICKER = [
  "Sales Follow-Ups",
  "Appointment Booking",
  "Client Messages",
  "Invoice Reminders",
  "Lead Qualification",
  "Payment Collection",
  "Customer Support",
  "Order Confirmations",
];

const FEATURES = [
  { icon: "⚡", title: "Live in under 5 minutes", body: "No developers. No lengthy setup. Describe what your business needs, and your agent is working immediately." },
  { icon: "💬", title: "Native on WhatsApp", body: "Your agents live inside WhatsApp Business — where your customers already are. No new app for anyone to download." },
  { icon: "🧠", title: "Intelligent, not scripted", body: "Powered by Google Gemini AI, your agents understand context and handle nuance — the way a trained team member would." },
  { icon: "📊", title: "Full visibility, always", body: "Every message sent, every action taken is logged clearly. You stay in control while your agent handles the workload." },
  { icon: "🔒", title: "Built for business trust", body: "Your data is isolated, encrypted, and never used to train any model. Enterprise-grade security from day one." },
  { icon: "📈", title: "Grows as you grow", body: "Start with one agent. Scale to a full team running your entire operation — no infrastructure to manage." },
];

const TESTIMONIALS = [
  { name: "Kwame Asante", biz: "Asante Auto Services, Accra", quote: "I was spending hours every week on WhatsApp answering the same booking questions. AgentFlow handles all of that now. My team focuses on actual work, and customers get faster responses than ever.", avatar: "👨🏾‍🔧" },
  { name: "Abena Mensah", biz: "Mensah Legal, Kumasi", quote: "Every inquiry used to take 20 minutes of my time just to assess. Now my agent qualifies leads before I ever see them. I only speak to serious clients. My close rate has improved significantly.", avatar: "👩🏾‍💼" },
  { name: "Kofi Darko", biz: "Darko Consulting Group", quote: "Chasing overdue invoices was taking up real time and damaging relationships. AgentFlow sends reminders automatically, professionally, and on schedule. I have recovered revenue I would have written off.", avatar: "👨🏾‍💻" },
];

const PLANS = [
  { name: "Free", price: "GH₵0", period: "/mo", tag: null, who: "Perfect for testing the system", features: ["Up to 50 automated messages/mo", "1 WhatsApp number connected", "Basic dashboard", "Email support"], cta: "Start free — no card", highlight: false },
  { name: "Starter", price: "GH₵179", period: "/mo", tag: null, who: "Shops, salons & freelancers", features: ["Up to 500 automated messages/mo", "1 WhatsApp number", "Quick replies & labels", "Appointment reminders", "Email + WhatsApp support"], cta: "Get started", highlight: false },
  { name: "Growth", price: "GH₵449", period: "/mo", tag: "MOST POPULAR", who: "Clinics, restaurants & growing shops", features: ["Up to 2,000 automated messages/mo", "2–3 WhatsApp numbers", "Appointment & order reminders", "Customer tracking dashboard", "Analytics reports", "Email + WhatsApp support"], cta: "Start Growth plan", highlight: true },
  { name: "Agency", price: "GH₵1,199", period: "/mo", tag: null, who: "Multi-location businesses & agencies", features: ["Unlimited automated messages", "Multiple WhatsApp numbers", "Full analytics dashboard", "Multi-user access", "Premium support (WhatsApp + call)", "Custom integrations"], cta: "Contact us", highlight: false },
];

function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState("0");
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
  return val;
}

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function MetricCard({ label, val, color, start }) {
  const animated = useCounter(val, 1600, start);
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "10px", padding: "18px 14px" }}>
      <div style={{ fontSize: "9px", color: "#4a4a5a", fontFamily: "var(--fm)", marginBottom: "8px", letterSpacing: ".08em" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: "26px", fontWeight: "700", color, fontFamily: "var(--fm)", letterSpacing: "-.03em" }}>{animated}</div>
    </div>
  );
}

function DemoModal({ onClose, onLaunch }) {
  const [active, setActive] = useState(0);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  useEffect(() => { const t = setInterval(() => setActive(s => (s + 1) % 3), 3200); return () => clearInterval(t); }, []);

  const steps = [
    { label: "Step 1", title: "Describe what you need", detail: "Tell AgentFlow what your business does — in plain language. No forms, no setup required.", before: "You spend 2+ hours daily answering the same WhatsApp messages.", after: "Your agent handles every inquiry instantly, around the clock." },
    { label: "Step 2", title: "Connect in one click", detail: "Link your WhatsApp Business number. AgentFlow plugs directly into what you already use.", before: "Missed appointments cost you revenue every single week.", after: "Automated reminders sent. Zero no-shows. Zero effort." },
    { label: "Step 3", title: "Watch your business run", detail: "Your agent goes live immediately. See every action in your dashboard — always in control.", before: "Chasing late payments damages client relationships.", after: "Professional follow-ups sent on schedule. Revenue recovered." },
  ];
  const results = [{ metric: "3.2hrs", label: "saved per day" }, { metric: "94%", label: "auto-handled" }, { metric: "GH₵0", label: "to start" }];
  const s = steps[active];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(4,3,8,.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", animation: "modalIn .3s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0B0A12", border: "1px solid rgba(255,255,255,.08)", borderRadius: "20px", maxWidth: "680px", width: "100%", overflow: "hidden", animation: "modalSlide .4s cubic-bezier(.16,1,.3,1)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg,transparent,#8B4513,#C1602A,transparent)" }} />
        <div style={{ padding: "26px 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px" }}>
          <div>
            <p style={{ fontFamily: "var(--f)", fontSize: "10px", letterSpacing: ".2em", color: "#8B4513", marginBottom: "8px", fontWeight: "500" }}>SEE IT IN ACTION</p>
            <h3 style={{ fontFamily: "var(--f)", fontSize: "clamp(18px,4vw,24px)", fontWeight: "800", color: "#F5F0E8", lineHeight: 1.2, letterSpacing: "-.04em" }}>
              This is what your business<br />looks like with AgentFlow.
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: "#666", fontSize: "14px", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#ccc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#666"; }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: "6px", padding: "0 24px 20px" }}>
          {steps.map((st, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ flex: 1, padding: "10px 8px", borderRadius: "8px", border: `1px solid ${active === i ? "rgba(139,69,19,.5)" : "rgba(255,255,255,.06)"}`, background: active === i ? "rgba(139,69,19,.1)" : "rgba(255,255,255,.02)", cursor: "pointer", transition: "all .25s" }}>
              <div style={{ fontFamily: "var(--f)", fontSize: "9px", letterSpacing: ".12em", color: active === i ? "#C1602A" : "#444", marginBottom: "3px", fontWeight: "600" }}>{st.label.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--f)", fontSize: "11px", color: active === i ? "#F5F0E8" : "#555", fontWeight: "600", lineHeight: 1.3 }}>{st.title}</div>
            </button>
          ))}
        </div>
        <div key={active} style={{ padding: "0 24px 22px", animation: "modalStepIn .4s cubic-bezier(.16,1,.3,1)" }}>
          <p style={{ fontFamily: "var(--f)", fontSize: "14px", color: "#7a7060", lineHeight: 1.7, marginBottom: "18px" }}>{s.detail}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
            <div style={{ background: "rgba(255,70,70,.04)", border: "1px solid rgba(255,70,70,.1)", borderRadius: "10px", padding: "15px 16px" }}>
              <div style={{ fontFamily: "var(--f)", fontSize: "9px", letterSpacing: ".16em", color: "#ff6060", marginBottom: "8px", fontWeight: "600" }}>WITHOUT AGENTFLOW</div>
              <p style={{ fontFamily: "var(--f)", fontSize: "13px", color: "#6a5a5a", lineHeight: 1.6 }}>{s.before}</p>
            </div>
            <div style={{ background: "rgba(139,69,19,.07)", border: "1px solid rgba(139,69,19,.22)", borderRadius: "10px", padding: "15px 16px" }}>
              <div style={{ fontFamily: "var(--f)", fontSize: "9px", letterSpacing: ".16em", color: "#C1602A", marginBottom: "8px", fontWeight: "600" }}>WITH AGENTFLOW ✦</div>
              <p style={{ fontFamily: "var(--f)", fontSize: "13px", color: "#C8BFB0", lineHeight: 1.6 }}>{s.after}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setActive(i)} style={{ width: i === active ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === active ? "#8B4513" : "rgba(255,255,255,.1)", transition: "all .3s cubic-bezier(.16,1,.3,1)", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {results.map((r, i) => (
            <div key={i} style={{ padding: "18px 12px", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
              <div style={{ fontFamily: "var(--f)", fontSize: "22px", fontWeight: "800", color: "#F5F0E8", marginBottom: "4px", letterSpacing: "-.04em" }}>{r.metric}</div>
              <div style={{ fontFamily: "var(--f)", fontSize: "11px", color: "#555" }}>{r.label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "18px 24px 26px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--f)", fontSize: "12px", color: "#555", marginBottom: "12px" }}>Join business owners across Ghana already saving hours every day.</p>
          <button onClick={() => { onClose(); onLaunch(); }}
            style={{ background: "linear-gradient(135deg,#8B4513,#C1602A)", color: "#F5F0E8", border: "none", borderRadius: "10px", padding: "14px 32px", fontFamily: "var(--f)", fontSize: "15px", fontWeight: "700", cursor: "pointer", letterSpacing: "-.01em", transition: "all .25s", boxShadow: "0 8px 28px rgba(139,69,19,.32)", width: "100%" }}
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
  const [dashRef, dashInView] = useInView(0.15);
  const [featRef, featInView] = useInView(0.08);
  const [testRef, testInView] = useInView(0.08);
  const [pricRef, pricInView] = useInView(0.08);
  const [ctaRef, ctaInView] = useInView(0.12);
  const [cursorPos, setCursorPos] = useState({ x: -400, y: -400 });

  useEffect(() => { const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 2400); return () => clearInterval(t); }, []);
  useEffect(() => { const fn = () => setScrollY(window.scrollY); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { const fn = e => setCursorPos({ x: e.clientX, y: e.clientY }); window.addEventListener("mousemove", fn); return () => window.removeEventListener("mousemove", fn); }, []);
  useEffect(() => { if (scrollY > 10) setMobileMenuOpen(false); }, [scrollY]);

  const submit = e => { e.preventDefault(); if (email) setSubmitted(true); };
  const launch = () => { setLaunching(true); setTimeout(() => navigate("/app"), 1800); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        :root{
          --f:'Inter',system-ui,-apple-system,sans-serif;
          --fm:'SF Mono','Fira Code','Cascadia Code',monospace;
          --brown:#8B4513;
          --brown2:#C1602A;
          --cream:#F5F0E8;
          --dark:#1A1410;
        }
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;text-size-adjust:100%}
        body{font-family:var(--f);background:#F5F0E8;color:#1A1410;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-feature-settings:'cv02','cv03','cv04','cv11';}

        /* ── Grain ── */
        .grain::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9990;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px}

        /* ── Cursor glow — only on hover-capable devices ── */
        @media(hover:hover){
          .cursor-glow{pointer-events:none;position:fixed;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(139,69,19,.065) 0%,transparent 70%);transform:translate(-50%,-50%);z-index:0;will-change:transform;display:block}
        }
        .cursor-glow{display:none}

        /* ── Keyframes ── */
        @keyframes launchFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes logoScale{0%{transform:scale(.7);opacity:0}40%{transform:scale(1.08);opacity:1}70%{transform:scale(.97)}100%{transform:scale(1)}}
        @keyframes logoGlow{0%,100%{box-shadow:0 0 28px rgba(139,69,19,.4)}50%{box-shadow:0 0 60px rgba(139,69,19,.7)}}
        @keyframes tagUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes launchBar{from{width:0}to{width:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{
          0%{opacity:0;transform:translateY(10px)}
          12%{opacity:1;transform:translateY(0)}
          88%{opacity:1;transform:translateY(0)}
          100%{opacity:0;transform:translateY(-10px)}
        }
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-12px)}}
        @keyframes dashIn{from{opacity:0;transform:translateY(32px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes livePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes modalIn{from{opacity:0}to{opacity:1}}
        @keyframes modalSlide{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes modalStepIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}

        /* ── Reveal ── */
        .reveal{opacity:0;transform:translateY(22px);transition:opacity .65s cubic-bezier(.16,1,.3,1),transform .65s cubic-bezier(.16,1,.3,1)}
        .reveal.in{opacity:1;transform:translateY(0)}
        .stagger-0{transition-delay:0s}
        .stagger-1{transition-delay:.07s}
        .stagger-2{transition-delay:.14s}
        .stagger-3{transition-delay:.21s}
        .stagger-4{transition-delay:.28s}
        .stagger-5{transition-delay:.35s}

        /* ── Badge shimmer ── */
        .shimmer-badge{background:linear-gradient(90deg,rgba(139,69,19,.07) 0%,rgba(139,69,19,.18) 50%,rgba(139,69,19,.07) 100%);background-size:200% auto;animation:shimmer 2.8s linear infinite}

        /* ── Ticker ── */
        .ticker-word{animation:ticker 2.4s ease;display:inline-block;font-weight:700;color:#8B4513}

        /* ── Marquee ── */
        .marquee-track{display:flex;gap:52px;animation:marquee 22s linear infinite;width:max-content}

        /* ── Live dot ── */
        .live-dot{width:7px;height:7px;border-radius:50%;background:#28CA41;animation:livePulse 1.8s ease infinite;flex-shrink:0}

        /* ── Buttons ── */
        .btn-primary{background:#1A1410;color:#F5F0E8;padding:16px 36px;border-radius:10px;border:none;cursor:pointer;font-family:var(--f);font-size:15px;font-weight:600;letter-spacing:-.01em;transition:all .22s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(26,20,16,.28)}
        .btn-primary:active{transform:scale(.97)}

        .btn-ghost{background:transparent;color:#1A1410;padding:15px 32px;border-radius:10px;border:1.5px solid rgba(26,20,16,.2);cursor:pointer;font-family:var(--f);font-size:15px;font-weight:500;letter-spacing:-.01em;transition:all .22s cubic-bezier(.16,1,.3,1);-webkit-tap-highlight-color:transparent}
        .btn-ghost:hover{background:#1A1410;color:#F5F0E8;border-color:#1A1410;transform:translateY(-2px)}
        .btn-ghost:active{transform:scale(.97)}

        .btn-watch{background:transparent;color:#1A1410;padding:15px 24px;border-radius:10px;border:1.5px solid rgba(26,20,16,.2);cursor:pointer;font-family:var(--f);font-size:15px;font-weight:500;letter-spacing:-.01em;transition:all .22s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;justify-content:center;gap:9px;-webkit-tap-highlight-color:transparent}
        .btn-watch:hover{background:#1A1410;color:#F5F0E8;border-color:#1A1410;transform:translateY(-2px)}
        .btn-watch:active{transform:scale(.97)}
        .play-icon{width:26px;height:26px;border-radius:50%;background:#8B4513;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s}
        .btn-watch:hover .play-icon{transform:scale(1.08)}

        /* ── Nav links ── */
        .nav-link{text-decoration:none;color:#666;font-family:var(--f);font-size:14px;font-weight:500;position:relative;transition:color .2s}
        .nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1.5px;background:#8B4513;transition:width .25s}
        .nav-link:hover{color:#1A1410}
        .nav-link:hover::after{width:100%}

        /* ── Feature cards ── */
        .feature-card{background:#F5F0E8;padding:44px 32px;transition:all .32s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}
        .feature-card:hover{transform:translateY(-5px);background:#fff;box-shadow:0 18px 60px rgba(26,20,16,.09)}
        .feature-icon{font-size:28px;margin-bottom:16px;display:inline-block;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
        .feature-card:hover .feature-icon{transform:scale(1.14) rotate(-4deg)}

        /* ── Plan cards ── */
        .plan-card{transition:all .28s cubic-bezier(.16,1,.3,1)}
        .plan-card:hover{transform:translateY(-5px)}

        /* ── Testimonial cards ── */
        .t-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:30px 26px;transition:all .32s cubic-bezier(.16,1,.3,1)}
        .t-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.12);transform:translateY(-3px)}

        /* ── Mobile menu ── */
        .mob-menu{display:none;position:fixed;top:60px;left:0;right:0;z-index:99;background:rgba(245,240,232,.98);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(26,20,16,.09);padding:14px 20px 22px;flex-direction:column;animation:slideDown .2s ease}
        .mob-menu.open{display:flex}

        /* ═══════════════════════════════════
              MOBILE STYLES
           ═══════════════════════════════════ */
        @media(max-width:768px){
          .d-nav,.d-cta{display:none!important}
          .hamburger{display:flex!important}
          .nav-wrap{padding:0 18px!important;height:60px!important}

          /* Hero */
          .hero-wrap{padding:80px 20px 52px!important;min-height:100svh}
          .hero-badge{font-size:9.5px!important;letter-spacing:.14em!important;padding:5px 12px!important;margin-bottom:22px!important}
          .hero-h1{
            font-size:clamp(30px,9vw,48px)!important;
            line-height:1.08!important;
            letter-spacing:-.04em!important;
            margin-bottom:16px!important;
          }
          .ticker-row{
            font-size:clamp(13px,4vw,17px)!important;
            flex-direction:column!important;
            align-items:center!important;
            gap:3px!important;
            margin-bottom:20px!important;
          }
          .ticker-label{font-size:clamp(12px,3.5vw,15px)!important}
          .ticker-word{font-size:clamp(15px,5vw,20px)!important}
          .hero-body{font-size:15px!important;max-width:100%!important;margin-bottom:32px!important;line-height:1.7!important}
          .hero-btns{flex-direction:column!important;width:100%!important;gap:10px!important}
          .hero-btns .btn-primary,
          .hero-btns .btn-watch{width:100%!important;padding:17px 20px!important;font-size:16px!important;border-radius:12px!important}
          .hero-trust{flex-direction:column!important;gap:9px!important;align-items:flex-start!important;margin-top:26px!important}
          .dash-preview{display:none!important}

          /* Sections */
          .sec-pad{padding:68px 20px!important}
          .feat-grid{grid-template-columns:1fr!important}
          .feature-card{padding:26px 20px!important}
          .test-grid{grid-template-columns:1fr!important}
          .t-card{padding:24px 20px!important}
          .price-grid{grid-template-columns:1fr!important;gap:12px!important}
          .cta-wrap{padding:72px 20px!important}
          .foot-inner{flex-direction:column!important;gap:16px!important;text-align:center!important}
          .foot-links{justify-content:center!important;flex-wrap:wrap!important;gap:20px!important}
          .sec-h2{font-size:clamp(24px,7vw,38px)!important;letter-spacing:-.04em!important}
          .plan-price{font-size:32px!important}

          /* Reduce heavy section padding */
          #features,#testimonials,#pricing{padding-left:20px!important;padding-right:20px!important;padding-top:72px!important;padding-bottom:72px!important}
          #testimonials{padding-left:20px!important;padding-right:20px!important}
        }

        @media(max-width:380px){
          .hero-h1{font-size:28px!important}
          .hero-badge{display:none!important}
        }

        @media(min-width:769px){
          .hamburger{display:none!important}
          .mob-menu{display:none!important}
        }
      `}</style>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="grain" />

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} onLaunch={launch} />}

      {/* Launch overlay */}
      {launching && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#04050A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "launchFadeIn .3s ease forwards" }}>
          <div style={{ width: "66px", height: "66px", borderRadius: "16px", background: "linear-gradient(135deg,#8B4513,#C1602A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f)", fontWeight: "800", color: "#F5F0E8", fontSize: "30px", animation: "logoScale .6s cubic-bezier(.16,1,.3,1) forwards,logoGlow 1.2s ease .6s infinite", marginBottom: "20px" }}>A</div>
          <div style={{ color: "#fff", fontFamily: "var(--f)", fontSize: "20px", fontWeight: "700", letterSpacing: "-.04em", animation: "tagUp .5s ease .4s both", marginBottom: "6px" }}>AgentFlow</div>
          <div style={{ color: "#8B4513", fontFamily: "var(--fm)", fontSize: "10px", letterSpacing: ".25em", animation: "tagUp .5s ease .55s both", marginBottom: "40px" }}>GHANA 🇬🇭</div>
          <div style={{ width: "130px", height: "2px", background: "rgba(255,255,255,.08)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#8B4513", borderRadius: "2px", animation: "launchBar 1.4s cubic-bezier(.4,0,.2,1) .3s forwards", width: 0 }} />
          </div>
        </div>
      )}

      <div style={{ background: "#F5F0E8", color: "#1A1410", fontFamily: "var(--f)", overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav className="nav-wrap" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 52px", height: "64px", background: scrollY > 40 ? "rgba(245,240,232,.97)" : "transparent", backdropFilter: scrollY > 40 ? "blur(20px)" : "none", WebkitBackdropFilter: scrollY > 40 ? "blur(20px)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(26,20,16,.07)" : "none", transition: "all .3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", zIndex: 2 }}>
            <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg,#1A1410,#3D2E22)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", fontWeight: "800", fontSize: "15px", fontFamily: "var(--f)" }}>A</div>
            <span style={{ fontWeight: "700", fontSize: "15px", letterSpacing: "-.03em", fontFamily: "var(--f)" }}>AgentFlow</span>
          </div>
          <div className="d-nav" style={{ display: "flex", gap: "32px" }}>
            {["Features", "Pricing", "Testimonials"].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>)}
          </div>
          <div className="d-cta" style={{ display: "flex", gap: "8px" }}>
            <button className="btn-ghost" onClick={launch} style={{ padding: "8px 18px", fontSize: "13px" }}>Log in</button>
            <button className="btn-primary" onClick={launch} style={{ padding: "9px 20px", fontSize: "13px" }}>Start free →</button>
          </div>
          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", flexDirection: "column", gap: "5px", zIndex: 2, display: "none" }}>
            <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", transform: mobileMenuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", opacity: mobileMenuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", transform: mobileMenuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`mob-menu${mobileMenuOpen ? " open" : ""}`}>
          {["Features", "Pricing", "Testimonials"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", color: "#1A1410", fontFamily: "var(--f)", fontSize: "17px", fontWeight: "600", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.07)", display: "block", letterSpacing: "-.01em" }}>{l}</a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "16px" }}>
            <button className="btn-ghost" onClick={launch} style={{ width: "100%", textAlign: "center" }}>Log in</button>
            <button className="btn-primary" onClick={launch} style={{ width: "100%", textAlign: "center" }}>Start free →</button>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="hero-wrap" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 52px 80px", textAlign: "center", position: "relative", background: "linear-gradient(160deg,#F8F3EB 0%,#EDE5D8 55%,#E5DAC8 100%)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "8%", left: "3%", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.05) 0%,transparent 70%)", animation: "orb 14s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "4%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.04) 0%,transparent 70%)", animation: "orb 18s ease-in-out 3s infinite", pointerEvents: "none" }} />

          {/* Badge */}
          <div className="hero-badge shimmer-badge" style={{ animation: "fadeUp .6s ease .1s both, shimmer 2.8s linear infinite", fontSize: "10.5px", letterSpacing: ".18em", color: "#8B4513", marginBottom: "26px", textTransform: "uppercase", padding: "6px 15px", borderRadius: "100px", border: "1px solid rgba(139,69,19,.22)", display: "inline-block", fontFamily: "var(--f)", fontWeight: "600" }}>
            The WhatsApp Business Automation Platform · Built for Ghana 🇬🇭
          </div>

          {/* H1 */}
          <h1 className="hero-h1" style={{ fontSize: "clamp(34px,5.8vw,82px)", fontWeight: "800", lineHeight: "1.06", maxWidth: "800px", marginBottom: "20px", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .18s both", letterSpacing: "-.04em", fontFamily: "var(--f)", color: "#1A1410" }}>
            Stop doing manually what<br />agents can do better,{" "}
            <span style={{ color: "#8B4513" }}>24/7.</span>
          </h1>

          {/* Ticker row */}
          <div className="ticker-row" style={{ fontSize: "clamp(15px,2.2vw,20px)", fontFamily: "var(--f)", color: "#aaa", marginBottom: "22px", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .3s both", lineHeight: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", flexWrap: "wrap", minHeight: "1.5em" }}>
            <span className="ticker-label" style={{ fontWeight: "400" }}>Your agents are ready to handle</span>
            <span style={{ minWidth: "200px", display: "inline-block", textAlign: "left" }}>
              <span key={tickerIdx} className="ticker-word">{TICKER[tickerIdx]}</span>
            </span>
          </div>

          {/* Body */}
          <p className="hero-body" style={{ fontSize: "16.5px", color: "#7a7060", maxWidth: "540px", lineHeight: "1.78", marginBottom: "40px", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .42s both", fontFamily: "var(--f)" }}>
            Right now, you're manually handling sales follow-ups, appointments, and client messages.
            AgentFlow gives you intelligent agents that work 24/7 — responding to clients,
            collecting payments, booking appointments, and sending reminders — so you can
            focus on growing your business.
          </p>

          {/* Buttons */}
          <div className="hero-btns" style={{ display: "flex", gap: "11px", alignItems: "center", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .52s both" }}>
            <button className="btn-primary" onClick={launch} style={{ fontSize: "15px", padding: "17px 38px" }}>
              Start free — no card needed
            </button>
            <button className="btn-watch" onClick={() => setShowDemo(true)} style={{ fontSize: "15px" }}>
              <span className="play-icon">
                <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><path d="M1 1L8 5.5L1 10V1Z" fill="#F5F0E8" /></svg>
              </span>
              See how it works
            </button>
          </div>

          {/* Trust */}
          <div className="hero-trust" style={{ marginTop: "32px", fontSize: "13px", color: "#bbb", display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp .8s cubic-bezier(.16,1,.3,1) .62s both", fontFamily: "var(--f)" }}>
            {["Free forever plan", "No technical skills needed", "First agent live in 5 min"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ color: "#8B4513", fontWeight: "600" }}>✓</span> {t}
              </span>
            ))}
          </div>

          {/* Dashboard — hidden on mobile */}
          <div ref={dashRef} className="dash-preview" style={{ marginTop: "76px", width: "100%", maxWidth: "900px", background: "#080810", borderRadius: "14px", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden", boxShadow: "0 64px 130px rgba(26,20,16,.2)", animation: dashInView ? "dashIn .9s cubic-bezier(.16,1,.3,1) forwards" : "none", opacity: dashInView ? 1 : 0 }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", gap: "8px", alignItems: "center", background: "rgba(255,255,255,.02)" }}>
              {["#FF5F57","#FFBD2E","#28CA41"].map(c => <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c }} />)}
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "rgba(255,255,255,.05)", borderRadius: "6px", padding: "4px 14px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <div className="live-dot" />
                  <span style={{ color: "#444", fontSize: "11px", fontFamily: "var(--fm)" }}>agentflow.io/dashboard</span>
                </div>
              </div>
            </div>
            <div style={{ padding: "22px 22px 8px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "11px" }}>
              {[{ label: "Tasks Automated", val: "486", color: "#00FFB2" },{ label: "Hours Saved", val: "312h", color: "#FFD600" },{ label: "Active Agents", val: "3", color: "#A78BFA" },{ label: "Success Rate", val: "97.5%", color: "#FF6B6B" }].map(m => <MetricCard key={m.label} {...m} start={dashInView} />)}
            </div>
            <div style={{ padding: "14px 22px 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[{ name: "Rex", role: "Customer Support", status: "Active", tasks: "142 tasks", color: "#00FFB2" },{ name: "Finn", role: "Finance & Invoicing", status: "Active", tasks: "98 tasks", color: "#A78BFA" },{ name: "Lea", role: "Lead Capture", status: "Idle", tasks: "57 tasks", color: "#FFD600" }].map((a, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.05)", borderRadius: "8px", padding: "11px 15px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "29px", height: "29px", borderRadius: "7px", background: `${a.color}18`, border: `1px solid ${a.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: a.color, fontFamily: "var(--fm)" }}>{a.name[0]}</div>
                  <div style={{ flex: 1, fontSize: "12px", fontFamily: "var(--f)", color: "#D0C8BC", fontWeight: "500" }}>{a.name} <span style={{ color: "#444", fontWeight: "400" }}>· {a.role}</span></div>
                  <div style={{ fontSize: "11px", fontFamily: "var(--fm)", color: "#444" }}>{a.tasks}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: a.status === "Active" ? "#28CA41" : "#444", animation: a.status === "Active" ? "livePulse 1.8s ease infinite" : "none" }} />
                    <span style={{ fontSize: "10px", color: a.status === "Active" ? "#28CA41" : "#555", fontFamily: "var(--fm)" }}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div style={{ background: "#1A1410", padding: "15px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <div className="marquee-track">
            {["Trusted by Ghanaian businesses 🇬🇭","Powered by Google Gemini AI","No technical skills needed","First agent live in 5 minutes","WhatsApp Business native","SOC 2 ready infrastructure","Trusted by Ghanaian businesses 🇬🇭","Powered by Google Gemini AI","No technical skills needed","First agent live in 5 minutes","WhatsApp Business native","SOC 2 ready infrastructure"].map((t, i) => (
              <span key={i} style={{ color: "#555", whiteSpace: "nowrap", fontSize: "12px", letterSpacing: ".06em", fontFamily: "var(--f)" }}>
                {t}<span style={{ color: "#2a1a10", marginLeft: "52px" }}>✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="sec-pad" style={{ padding: "112px 52px", maxWidth: "1100px", margin: "0 auto" }}>
          <div ref={featRef} style={{ textAlign: "center", marginBottom: "72px" }}>
            <p className={`reveal stagger-0 ${featInView ? "in" : ""}`} style={{ fontSize: "10px", letterSpacing: ".22em", color: "#bbb", marginBottom: "12px", fontFamily: "var(--f)", fontWeight: "600", textTransform: "uppercase" }}>What AgentFlow Does</p>
            <h2 className={`sec-h2 reveal stagger-1 ${featInView ? "in" : ""}`} style={{ fontSize: "clamp(26px,5vw,50px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-.04em", fontFamily: "var(--f)" }}>
              Your business, running itself.<br /><span style={{ color: "#8B4513" }}>Finally.</span>
            </h2>
            <p className={`reveal stagger-2 ${featInView ? "in" : ""}`} style={{ fontSize: "16px", color: "#999", maxWidth: "460px", margin: "16px auto 0", lineHeight: 1.7, fontFamily: "var(--f)" }}>
              Every feature is built around one goal: give Ghanaian business owners their time back, while delivering a better experience to customers.
            </p>
          </div>
          <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", background: "rgba(26,20,16,.07)" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card reveal stagger-${i} ${featInView ? "in" : ""}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "11px", letterSpacing: "-.03em", fontFamily: "var(--f)", color: "#1A1410" }}>{f.title}</h3>
                <p style={{ fontSize: "14.5px", color: "#888", lineHeight: "1.72", fontFamily: "var(--f)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" style={{ background: "#110E0A", padding: "112px 52px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.055) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div ref={testRef} style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p className={`reveal ${testInView ? "in" : ""}`} style={{ fontSize: "10px", letterSpacing: ".22em", color: "#555", marginBottom: "12px", fontFamily: "var(--f)", fontWeight: "600", textTransform: "uppercase" }}>Businesses Already Saving Time</p>
              <h2 className={`sec-h2 reveal stagger-1 ${testInView ? "in" : ""}`} style={{ fontSize: "clamp(26px,5vw,50px)", fontWeight: "800", color: "#F5F0E8", lineHeight: "1.1", letterSpacing: "-.04em", fontFamily: "var(--f)" }}>
                Hours saved. Revenue recovered.<br /><span style={{ color: "#8B4513" }}>Businesses transformed.</span>
              </h2>
              <p className={`reveal stagger-2 ${testInView ? "in" : ""}`} style={{ fontSize: "15px", color: "#555", maxWidth: "440px", margin: "16px auto 0", lineHeight: 1.7, fontFamily: "var(--f)" }}>
                Real owners. Real businesses. Real results — right here in Ghana.
              </p>
            </div>
            <div className="test-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`t-card reveal stagger-${i} ${testInView ? "in" : ""}`}>
                  <div style={{ fontSize: "38px", color: "#8B4513", lineHeight: 1, marginBottom: "18px", opacity: .55, fontFamily: "Georgia" }}>"</div>
                  <p style={{ fontSize: "14.5px", color: "#9a9080", lineHeight: "1.78", marginBottom: "24px", fontFamily: "var(--f)" }}>{t.quote}</p>
                  <div style={{ display: "flex", gap: "11px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", minWidth: "40px", borderRadius: "50%", background: "rgba(139,69,19,.12)", border: "1px solid rgba(139,69,19,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{t.avatar}</div>
                    <div>
                      <div style={{ color: "#F5F0E8", fontWeight: "600", fontSize: "13px", fontFamily: "var(--f)", letterSpacing: "-.01em" }}>{t.name}</div>
                      <div style={{ color: "#555", fontSize: "11px", marginTop: "2px", fontFamily: "var(--f)" }}>{t.biz}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="sec-pad" style={{ padding: "112px 52px", maxWidth: "1100px", margin: "0 auto" }}>
          <div ref={pricRef} style={{ textAlign: "center", marginBottom: "64px" }}>
            <p className={`reveal ${pricInView ? "in" : ""}`} style={{ fontSize: "10px", letterSpacing: ".22em", color: "#bbb", marginBottom: "12px", fontFamily: "var(--f)", fontWeight: "600", textTransform: "uppercase" }}>Pricing in Ghana Cedis</p>
            <h2 className={`sec-h2 reveal stagger-1 ${pricInView ? "in" : ""}`} style={{ fontSize: "clamp(26px,5vw,50px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-.04em", fontFamily: "var(--f)" }}>
              Invest in automation.<br /><span style={{ color: "#8B4513" }}>Not in extra staff.</span>
            </h2>
            <p className={`reveal stagger-2 ${pricInView ? "in" : ""}`} style={{ color: "#999", fontSize: "15px", marginTop: "14px", fontFamily: "var(--f)" }}>Start free. Upgrade when your business demands it. Every plan pays for itself within weeks.</p>
          </div>
          <div className="price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
            {PLANS.map((plan, i) => (
              <div key={i} className={`plan-card reveal stagger-${i} ${pricInView ? "in" : ""}`} style={{ background: plan.highlight ? "#1A1410" : "#fff", border: plan.highlight ? "1px solid rgba(139,69,19,.25)" : "1px solid rgba(26,20,16,.08)", borderRadius: "14px", padding: "34px 22px", position: "relative", boxShadow: plan.highlight ? "0 0 0 1px rgba(139,69,19,.1),0 32px 64px rgba(26,20,16,.13)" : "none" }}>
                {plan.tag && (
                  <div style={{ position: "absolute", top: "-11px", left: "50%", transform: "translateX(-50%)", background: "#8B4513", color: "#fff", fontSize: "9px", letterSpacing: ".15em", padding: "3px 13px", borderRadius: "20px", whiteSpace: "nowrap", fontFamily: "var(--f)", fontWeight: "700" }}>{plan.tag}</div>
                )}
                <div style={{ fontSize: "10px", letterSpacing: ".16em", color: plan.highlight ? "#666" : "#bbb", marginBottom: "5px", fontFamily: "var(--f)", fontWeight: "600" }}>{plan.name.toUpperCase()}</div>
                <div style={{ fontSize: "11px", color: plan.highlight ? "#7a6a5a" : "#aaa", marginBottom: "16px", fontFamily: "var(--f)" }}>{plan.who}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "22px" }}>
                  <span className="plan-price" style={{ fontSize: "36px", fontWeight: "800", color: plan.highlight ? "#F5F0E8" : "#1A1410", letterSpacing: "-.04em", fontFamily: "var(--f)" }}>{plan.price}</span>
                  <span style={{ color: "#888", fontSize: "12px", fontFamily: "var(--f)" }}>{plan.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ fontSize: "13px", color: plan.highlight ? "#9a9080" : "#666", display: "flex", gap: "8px", lineHeight: 1.45, fontFamily: "var(--f)" }}>
                      <span style={{ color: "#8B4513", flexShrink: 0, marginTop: "1px", fontWeight: "700" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button style={{ width: "100%", padding: "12px", background: plan.highlight ? "#F5F0E8" : "#1A1410", color: plan.highlight ? "#1A1410" : "#F5F0E8", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--f)", fontSize: "13px", fontWeight: "600", letterSpacing: "-.01em", transition: "all .2s cubic-bezier(.16,1,.3,1)", WebkitTapHighlightColor: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = ".85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaRef} className="cta-wrap" style={{ background: "#0E0A06", padding: "120px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,69,19,.1) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className={`reveal ${ctaInView ? "in" : ""}`} style={{ fontSize: "10px", letterSpacing: ".22em", color: "#555", marginBottom: "18px", fontFamily: "var(--f)", fontWeight: "600", textTransform: "uppercase" }}>Your Next Move</p>
            <h2 className={`sec-h2 reveal stagger-1 ${ctaInView ? "in" : ""}`} style={{ fontSize: "clamp(26px,5.5vw,64px)", fontWeight: "800", color: "#F5F0E8", lineHeight: "1.08", marginBottom: "18px", letterSpacing: "-.04em", fontFamily: "var(--f)" }}>
              Every day you wait,<br /><span style={{ color: "#8B4513" }}>a competitor moves faster.</span>
            </h2>
            <p className={`reveal stagger-2 ${ctaInView ? "in" : ""}`} style={{ color: "rgba(245,240,232,.38)", fontSize: "16px", fontFamily: "var(--f)", maxWidth: "480px", margin: "0 auto 12px" }}>
              AgentFlow gives your business the edge that was only available to large companies with big teams — starting at GH₵0.
            </p>
            <p className={`reveal stagger-2 ${ctaInView ? "in" : ""}`} style={{ color: "rgba(245,240,232,.22)", fontSize: "13px", marginBottom: "44px", fontFamily: "var(--f)" }}>
              No credit card. No commitment. Your first agent is live in 5 minutes.
            </p>
            <div className={`reveal stagger-3 ${ctaInView ? "in" : ""}`}>
              {!submitted ? (
                <form onSubmit={submit} style={{ display: "flex", maxWidth: "440px", margin: "0 auto", flexWrap: "wrap", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ flex: "1 1 180px", padding: "16px 18px", fontSize: "15px", border: "none", background: "rgba(255,255,255,.06)", color: "#F5F0E8", fontFamily: "var(--f)", outline: "none", minWidth: "150px" }} />
                  <button type="submit"
                    style={{ flex: "0 0 auto", padding: "16px 22px", background: "#8B4513", color: "#F5F0E8", border: "none", cursor: "pointer", fontFamily: "var(--f)", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", transition: "background .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#A0511A"}
                    onMouseLeave={e => e.currentTarget.style.background = "#8B4513"}>
                    Get early access →
                  </button>
                </form>
              ) : (
                <div style={{ color: "#F5F0E8", fontSize: "16px", background: "rgba(139,69,19,.14)", border: "1px solid rgba(139,69,19,.25)", padding: "18px 32px", borderRadius: "10px", display: "inline-block", fontFamily: "var(--f)" }}>
                  ✓ You're on the list! We'll be in touch shortly.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#080604", padding: "32px 52px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <div className="foot-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "22px", height: "22px", background: "rgba(245,240,232,.08)", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", fontFamily: "var(--f)", color: "#F5F0E8" }}>A</div>
              <span style={{ color: "#444", fontFamily: "var(--f)", fontSize: "13px" }}>AgentFlow © 2026 · Built in Ghana 🇬🇭</span>
            </div>
            <div className="foot-links" style={{ display: "flex", gap: "26px" }}>
              {["Privacy","Terms","Status","Contact"].map(l => (
                <a key={l} href="#" style={{ color: "#333", textDecoration: "none", transition: "color .2s", fontFamily: "var(--f)", fontSize: "13px" }}
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