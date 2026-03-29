import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TICKER = ["Customer Support", "Scheduling", "Invoicing", "Lead Capture", "Follow-ups", "Inventory", "Reporting", "Onboarding"];

const FEATURES = [
  { icon: "⚡", title: "Deploy in minutes", body: "Pick a role, name your agent, and it's live. No code, no engineers, no waiting weeks." },
  { icon: "🔗", title: "Connects to everything", body: "WhatsApp, Gmail, Stripe, QuickBooks, Calendar. Your agents work inside the tools you already use." },
  { icon: "🧠", title: "Powered by Gemini AI", body: "Each agent thinks, decides, and acts with Google's state-of-the-art reasoning — not brittle scripts." },
  { icon: "📊", title: "See every action", body: "Full audit logs. Know exactly what each agent did, when, and why. Total transparency." },
  { icon: "🔒", title: "Enterprise-grade security", body: "Row-level data isolation. SOC 2 ready. Your business data never trains any model." },
  { icon: "📈", title: "Scales with you", body: "From 1 agent handling 100 tasks to 50 agents running 100,000 — no infra to manage." },
];

const TESTIMONIALS = [
  { name: "Kwame Asante", biz: "Asante Auto Services, Accra", quote: "Rex books all my service appointments through WhatsApp now. My front desk girl can focus on actual customers instead of answering the same questions.", avatar: "👨🏾‍🔧" },
  { name: "Abena Mensah", biz: "Mensah Legal, Kumasi", quote: "The lead agent qualifies every inquiry before I even see it. I only talk to serious clients now. My conversion rate has gone up significantly.", avatar: "👩🏾‍💼" },
  { name: "Kofi Darko", biz: "Darko Consulting Group", quote: "Finn sends all my invoices and follows up on overdue payments automatically. I have recovered money I would have just written off before.", avatar: "👨🏾‍💻" },
];

const PLANS = [
  { name: "Free", price: "$0", period: "/mo", features: ["2 agents", "500 tasks/mo", "3 integrations", "Community support"], cta: "Start free", highlight: false },
  { name: "Starter", price: "$49", period: "/mo", features: ["5 agents", "2,000 tasks/mo", "All integrations", "Email support", "Activity logs"], cta: "Get started", highlight: false },
  { name: "Pro", price: "$129", period: "/mo", features: ["15 agents", "10,000 tasks/mo", "All integrations", "Priority support", "Analytics dashboard", "Custom agent roles"], cta: "Start Pro trial", highlight: true },
  { name: "Agency", price: "$399", period: "/mo", features: ["Unlimited agents", "Unlimited tasks", "White-label option", "Dedicated support", "Custom integrations", "SLA guarantee"], cta: "Contact us", highlight: false },
];

export default function Landing() {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 1900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on scroll
  useEffect(() => { if (scrollY > 10) setMobileMenuOpen(false); }, [scrollY]);

  const submit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const launch = () => {
    setLaunching(true);
    setTimeout(() => navigate("/app"), 1800);
  };

  return (
    <>
      {/* Launch transition overlay */}
      {launching && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#04050A",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          animation: "launchFadeIn .35s ease forwards",
        }}>
          <style>{`
            @keyframes launchFadeIn{from{opacity:0}to{opacity:1}}
            @keyframes logoScale{0%{transform:scale(.7);opacity:0}40%{transform:scale(1.08);opacity:1}70%{transform:scale(.97)}100%{transform:scale(1);opacity:1}}
            @keyframes logoGlow{0%,100%{box-shadow:0 0 30px rgba(0,255,178,.3)}50%{box-shadow:0 0 60px rgba(0,255,178,.6)}}
            @keyframes taglineUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
            @keyframes launchBar{from{width:0}to{width:100%}}
          `}</style>
          <div style={{
            width: "72px", height: "72px", borderRadius: "18px",
            background: "linear-gradient(135deg,#00FFB2,#00C88A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif", fontWeight: "900", color: "#04050A", fontSize: "36px",
            animation: "logoScale .6s cubic-bezier(.16,1,.3,1) forwards, logoGlow 1.2s ease .6s infinite",
            marginBottom: "24px",
          }}>A</div>
          <div style={{
            color: "#fff", fontFamily: "'Playfair Display',serif",
            fontSize: "22px", fontWeight: "700", letterSpacing: ".04em",
            animation: "taglineUp .5s ease .4s both",
            marginBottom: "8px",
          }}>AgentFlow</div>
          <div style={{
            color: "#00FFB2", fontFamily: "monospace", fontSize: "11px",
            letterSpacing: ".25em", animation: "taglineUp .5s ease .55s both",
            marginBottom: "48px",
          }}>GHANA 🇬🇭</div>
          <div style={{ width: "160px", height: "2px", background: "rgba(255,255,255,.08)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#00FFB2", borderRadius: "2px", animation: "launchBar 1.4s cubic-bezier(.4,0,.2,1) .3s forwards", width: 0 }} />
          </div>
        </div>
      )}
    <div style={{ background: "#F5F0E8", color: "#1A1410", fontFamily: "'Georgia','Times New Roman',serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F5F0E8}
        .sans{font-family:'DM Sans',sans-serif}
        .display{font-family:'Playfair Display',serif}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{
          0%{opacity:0;transform:translateY(10px)}
          12%{opacity:1;transform:translateY(0)}
          88%{opacity:1;transform:translateY(0)}
          100%{opacity:0;transform:translateY(-10px)}
        }
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

        .fade-up{animation:fadeUp 0.7s ease forwards}
        .delay-1{animation-delay:0.1s;opacity:0}
        .delay-2{animation-delay:0.25s;opacity:0}
        .delay-3{animation-delay:0.4s;opacity:0}
        .delay-4{animation-delay:0.55s;opacity:0}
        .ticker-word{animation:ticker 1.9s ease;display:inline-block}

        .btn-dark{background:#1A1410;color:#F5F0E8;padding:14px 32px;border-radius:2px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.05em;transition:all .2s}
        .btn-dark:hover{background:#3D2E22;transform:translateY(-1px)}
        .btn-outline{background:transparent;color:#1A1410;padding:13px 32px;border-radius:2px;border:1.5px solid #1A1410;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.05em;transition:all .2s}
        .btn-outline:hover{background:#1A1410;color:#F5F0E8}
        .feature-card{transition:all .3s;background:#F5F0E8;padding:48px 36px}
        .feature-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(26,20,16,.1);background:#fff}
        .plan-card{transition:all .3s}
        .plan-card:hover{transform:translateY(-5px)}
        .nav-link{text-decoration:none;color:#666;transition:color .2s;font-family:'DM Sans',sans-serif;font-size:14px}
        .nav-link:hover{color:#1A1410}

        /* Mobile nav menu */
        .mobile-menu{display:none;position:fixed;top:68px;left:0;right:0;z-index:99;background:rgba(245,240,232,.98);backdropFilter:blur(12px);border-bottom:1px solid rgba(26,20,16,.1);padding:20px 24px 28px;flex-direction:column;gap:0;animation:slideDown .2s ease}
        .mobile-menu.open{display:flex}

        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .desktop-cta{display:none!important}
          .hamburger{display:flex!important}
          .hero-trust{flex-direction:column;gap:12px!important;align-items:flex-start!important}
          .hero-btns{flex-direction:column;width:100%;gap:12px!important}
          .hero-btns .btn-dark,.hero-btns .btn-outline{width:100%;text-align:center;padding:16px 24px!important;font-size:15px!important}
          .social-bar{flex-wrap:wrap;gap:12px!important;justify-content:center!important;padding:16px 20px!important}
          .social-bar span{font-size:12px!important}
          .features-grid{grid-template-columns:1fr!important}
          .features-grid .feature-card{padding:32px 24px!important}
          .testimonials-grid{grid-template-columns:1fr!important}
          .pricing-grid{grid-template-columns:1fr!important;gap:12px!important}
          .footer-inner{flex-direction:column;gap:20px;text-align:center}
          .footer-links{justify-content:center!important}
          .dashboard-preview{display:none!important}
          .hero-section{padding:100px 24px 60px!important}
          .section-pad{padding:80px 24px!important}
          .hero-h1{font-size:clamp(40px,11vw,64px)!important}
          .ticker-min{min-width:160px!important}
          .cta-section{padding:80px 24px!important}
          .nav-pad{padding:0 20px!important}
        }

        @media(min-width:769px){
          .hamburger{display:none!important}
          .mobile-menu{display:none!important}
        }
      `}</style>

      {/* NAV */}
      <nav className="sans nav-pad" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 60px", height: "68px",
        background: scrollY > 40 ? "rgba(245,240,232,0.96)" : "transparent",
        backdropFilter: scrollY > 40 ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrollY > 40 ? "blur(12px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid rgba(26,20,16,.08)" : "none",
        transition: "all .3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 2 }}>
          <div style={{ width: "28px", height: "28px", background: "#1A1410", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", fontWeight: "900", fontSize: "14px", fontFamily: "Playfair Display, serif" }}>A</div>
          <span style={{ fontWeight: "500", fontSize: "16px", letterSpacing: ".02em" }}>AgentFlow</span>
        </div>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display: "flex", gap: "36px" }}>
          {["Features", "Pricing", "Testimonials"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="desktop-cta" style={{ display: "flex", gap: "12px" }}>
          <button className="btn-outline" onClick={launch} style={{ padding: "8px 20px", fontSize: "13px" }}>Log in</button>
          <button className="btn-dark" onClick={launch} style={{ padding: "8px 20px", fontSize: "13px" }}>Start free →</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "5px", zIndex: 2 }}
        >
          <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", transform: mobileMenuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", opacity: mobileMenuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "#1A1410", borderRadius: "2px", transition: "all .2s", transform: mobileMenuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        {["Features", "Pricing", "Testimonials"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}
            style={{ textDecoration: "none", color: "#1A1410", fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: "500", padding: "14px 0", borderBottom: "1px solid rgba(26,20,16,.07)", display: "block" }}>
            {l}
          </a>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <button className="btn-outline" onClick={launch} style={{ width: "100%", textAlign: "center" }}>Log in</button>
          <button className="btn-dark" onClick={launch} style={{ width: "100%", textAlign: "center" }}>Start free →</button>
        </div>
      </div>

      {/* HERO */}
      <section className="hero-section" style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 60px 80px",
        textAlign: "center", position: "relative",
        background: "linear-gradient(180deg,#F5F0E8 0%,#EDE5D8 100%)",
      }}>
        {/* Decorative lines */}
        <div style={{ position: "absolute", top: "15%", left: "5%", width: "1px", height: "200px", background: "rgba(26,20,16,.1)" }} />
        <div style={{ position: "absolute", top: "20%", right: "8%", width: "1px", height: "140px", background: "rgba(26,20,16,.1)" }} />

        <div className="sans fade-up" style={{ fontSize: "11px", letterSpacing: ".25em", color: "#888", marginBottom: "28px", textTransform: "uppercase" }}>
          AI Agent Orchestration for Small Business · Built in Ghana 🇬🇭
        </div>

        <h1 className="display fade-up delay-1 hero-h1" style={{ fontSize: "clamp(44px,8vw,96px)", fontWeight: "900", lineHeight: "1.02", maxWidth: "900px", marginBottom: "24px" }}>
          Hire AI agents to run your{" "}
          <span className="ticker-min" style={{ display: "inline-block", minWidth: "280px", color: "#8B4513", position: "relative" }}>
            <span key={tickerIdx} className="ticker-word">{TICKER[tickerIdx]}</span>
          </span>
        </h1>

        <p className="sans fade-up delay-2" style={{ fontSize: "18px", color: "#666", maxWidth: "520px", lineHeight: "1.7", marginBottom: "48px", fontWeight: "300" }}>
          Deploy intelligent agents that handle your business operations 24/7 — so you can focus on what actually matters.
        </p>

        <div className="hero-btns fade-up delay-3" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button className="btn-dark" onClick={launch} style={{ fontSize: "16px", padding: "16px 40px" }}>
            Start free — no card needed
          </button>
          <button className="btn-outline" onClick={launch} style={{ fontSize: "16px", padding: "15px 36px" }}>
            Watch demo ▶
          </button>
        </div>

        <div className="sans fade-up delay-4 hero-trust" style={{ marginTop: "48px", fontSize: "13px", color: "#999", display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <span>✓ 2 agents free forever</span>
          <span>✓ No engineers needed</span>
          <span>✓ Live in 5 minutes</span>
        </div>

        {/* Mock dashboard preview */}
        <div className="dashboard-preview fade-up delay-4" style={{
          marginTop: "80px", width: "100%", maxWidth: "900px",
          background: "#0A0A0F", borderRadius: "12px",
          border: "1px solid rgba(26,20,16,.15)", overflow: "hidden",
          boxShadow: "0 60px 120px rgba(26,20,16,.2)",
        }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", gap: "8px", alignItems: "center" }}>
            {["#FF5F57","#FFBD2E","#28CA41"].map(c => (
              <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c }} />
            ))}
            <span style={{ color: "#444", fontSize: "12px", marginLeft: "8px", fontFamily: "monospace" }}>agentflow.io/dashboard</span>
          </div>
          <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
            {[
              { label: "Tasks Automated", val: "486", color: "#00FFB2" },
              { label: "Hours Saved", val: "312h", color: "#FFD600" },
              { label: "Active Agents", val: "3/4", color: "#A78BFA" },
              { label: "Success Rate", val: "97.5%", color: "#FF6B6B" },
            ].map(m => (
              <div key={m.label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "10px", color: "#555", fontFamily: "monospace", marginBottom: "8px" }}>{m.label.toUpperCase()}</div>
                <div style={{ fontSize: "28px", fontWeight: "700", color: m.color, fontFamily: "monospace" }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <div className="sans social-bar" style={{ background: "#1A1410", color: "#888", padding: "18px 60px", display: "flex", justifyContent: "center", gap: "48px", fontSize: "13px", letterSpacing: ".05em", flexWrap: "wrap" }}>
        {["Built for African small businesses 🇬🇭", "Powered by Gemini AI", "No code required", "Deploy in under 5 minutes"].map(t => (
          <span key={t} style={{ color: "#666", whiteSpace: "nowrap" }}>{t}</span>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" className="section-pad" style={{ padding: "120px 60px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <p className="sans" style={{ fontSize: "11px", letterSpacing: ".25em", color: "#999", marginBottom: "16px" }}>HOW IT WORKS</p>
          <h2 className="display" style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: "700", lineHeight: "1.1" }}>
            Everything you need.<br />Nothing you don't.
          </h2>
        </div>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", background: "rgba(26,20,16,.08)" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: "32px", marginBottom: "20px" }}>{f.icon}</div>
              <h3 className="display" style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>{f.title}</h3>
              <p className="sans" style={{ fontSize: "15px", color: "#666", lineHeight: "1.7", fontWeight: "300" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ background: "#1A1410", padding: "120px 60px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <p className="sans" style={{ fontSize: "11px", letterSpacing: ".25em", color: "#666", marginBottom: "16px" }}>REAL BUSINESSES, REAL RESULTS</p>
            <h2 className="display" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: "700", color: "#F5F0E8", lineHeight: "1.1" }}>
              They got their time back.
            </h2>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "4px", padding: "40px 32px" }}>
                <div style={{ fontSize: "40px", color: "#8B4513", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: "24px" }}>"</div>
                <p className="sans" style={{ fontSize: "16px", color: "#C8BFB0", lineHeight: "1.75", marginBottom: "32px", fontWeight: "300" }}>{t.quote}</p>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", minWidth: "44px", borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{t.avatar}</div>
                  <div>
                    <div className="sans" style={{ color: "#F5F0E8", fontWeight: "500", fontSize: "14px" }}>{t.name}</div>
                    <div className="sans" style={{ color: "#666", fontSize: "12px" }}>{t.biz}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section-pad" style={{ padding: "120px 60px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p className="sans" style={{ fontSize: "11px", letterSpacing: ".25em", color: "#999", marginBottom: "16px" }}>PRICING</p>
          <h2 className="display" style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: "700", lineHeight: "1.1" }}>Simple, honest pricing.</h2>
          <p className="sans" style={{ color: "#888", fontSize: "16px", marginTop: "16px", fontWeight: "300" }}>Start free. Scale when you're ready.</p>
        </div>
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {PLANS.map((plan, i) => (
            <div key={i} className="plan-card" style={{ background: plan.highlight ? "#1A1410" : "#fff", border: plan.highlight ? "none" : "1px solid rgba(26,20,16,.1)", borderRadius: "4px", padding: "40px 28px", position: "relative" }}>
              {plan.highlight && (
                <div className="sans" style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#8B4513", color: "#fff", fontSize: "10px", letterSpacing: ".15em", padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap" }}>MOST POPULAR</div>
              )}
              <div className="sans" style={{ fontSize: "11px", letterSpacing: ".15em", color: plan.highlight ? "#888" : "#999", marginBottom: "16px" }}>{plan.name.toUpperCase()}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "32px" }}>
                <span className="display" style={{ fontSize: "48px", fontWeight: "700", color: plan.highlight ? "#F5F0E8" : "#1A1410" }}>{plan.price}</span>
                <span className="sans" style={{ color: "#888", fontSize: "14px" }}>{plan.period}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                {plan.features.map((f, j) => (
                  <div key={j} className="sans" style={{ fontSize: "14px", color: plan.highlight ? "#C8BFB0" : "#555", display: "flex", gap: "10px" }}>
                    <span style={{ color: "#8B4513", flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                style={{ width: "100%", padding: "13px", background: plan.highlight ? "#F5F0E8" : "#1A1410", color: plan.highlight ? "#1A1410" : "#F5F0E8", border: "none", borderRadius: "2px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "14px", fontWeight: "500", letterSpacing: ".05em", transition: "opacity .2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ background: "#8B4513", padding: "120px 60px", textAlign: "center" }}>
        <h2 className="display" style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: "900", color: "#F5F0E8", lineHeight: "1.05", marginBottom: "24px" }}>
          Your agents are waiting.<br />Deploy them today.
        </h2>
        <p className="sans" style={{ color: "rgba(245,240,232,.65)", fontSize: "18px", marginBottom: "48px", fontWeight: "300" }}>
          Join smart business owners across Ghana who let agents handle the grind.
        </p>

        {!submitted ? (
          <form onSubmit={submit} style={{ display: "flex", gap: "0", maxWidth: "480px", margin: "0 auto", flexWrap: "wrap" }}>
            <input
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              style={{ flex: "1 1 220px", padding: "16px 20px", fontSize: "15px", border: "none", borderRadius: "2px 0 0 2px", fontFamily: "DM Sans, sans-serif", outline: "none", minWidth: "180px" }}
            />
            <button type="submit" style={{ flex: "0 0 auto", padding: "16px 28px", background: "#1A1410", color: "#F5F0E8", border: "none", borderRadius: "0 2px 2px 0", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "15px", fontWeight: "500", whiteSpace: "nowrap" }}>
              Get early access →
            </button>
          </form>
        ) : (
          <div className="sans" style={{ color: "#F5F0E8", fontSize: "18px", background: "rgba(245,240,232,.15)", padding: "20px 40px", borderRadius: "4px", display: "inline-block" }}>
            ✓ You're on the list! We'll be in touch shortly.
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="sans" style={{ background: "#0F0C09", padding: "40px 60px" }}>
        <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "22px", height: "22px", background: "#F5F0E8", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "900", fontFamily: "Playfair Display, serif", color: "#0F0C09" }}>A</div>
            <span style={{ color: "#555" }}>AgentFlow © 2026 · Built in Ghana 🇬🇭</span>
          </div>
          <div className="footer-links" style={{ display: "flex", gap: "32px" }}>
            {["Privacy", "Terms", "Status", "Contact"].map(l => (
              <a key={l} href="#" style={{ color: "#444", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = "#888"}
                onMouseLeave={e => e.target.style.color = "#444"}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}