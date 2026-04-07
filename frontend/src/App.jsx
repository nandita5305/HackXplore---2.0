import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HackathonsSection from "./components/HackathonsSection";
import InternshipsSection from "./components/InternshipsSection";
import ScholarshipsSection from "./components/ScholarshipsSection";
import Footer from "./components/Footer";

/* ─── Global CSS injected directly into this file ──────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300..700&family=Geist:wght@300..700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0b;
    --surface: #111113;
    --surface-2: #161618;
    --border: #27272a;
    --border-glow: rgba(176, 38, 255, 0.2);
    --text: #f4f4f5;
    --muted: #a1a1aa;
    --dim: #71717a;
    --faint: #3f3f46;
    --accent: #b026ff;
    --accent-2: #ff26b9;
    --green: #4ade80;
    --sky: #38bdf8;
    --amber: #fbbf24;
    --red: #f87171;
    --violet: #a78bfa;
    --pink: #f472b6;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg);
    color: var(--text);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .mono { font-family: 'Geist Mono', monospace; }

  ::selection { background: var(--accent); color: var(--bg); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--accent); }

  /* ── Clip paths ── */
  .clip-both { clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 1.25rem 100%, 0 calc(100% - 1.25rem)); }
  .clip-tr   { clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 0 100%); }
  .clip-br   { clip-path: polygon(0 0, 100% 0, 100% calc(100% - 1.25rem), calc(100% - 1.25rem) 100%, 0 100%); }
  .clip-sm   { clip-path: polygon(0 0, calc(100% - .625rem) 0, 100% .625rem, 100% 100%, .625rem 100%, 0 calc(100% - .625rem)); }
  .clip-xs   { clip-path: polygon(0 0, calc(100% - .375rem) 0, 100% .375rem, 100% 100%, .375rem 100%, 0 calc(100% - .375rem)); }

  /* ── Animations ── */
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(176,38,255,.5); }
    50%       { box-shadow: 0 0 0 6px rgba(176,38,255,0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: .25; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(1.25rem); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(1rem); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes grad-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .fade-up   { animation: fade-up .65s cubic-bezier(.16,1,.3,1) both; }
  .d-1 { animation-delay: .10s; }
  .d-2 { animation-delay: .20s; }
  .d-3 { animation-delay: .30s; }
  .d-4 { animation-delay: .45s; }

  /* ── Reveal on scroll ── */
  .reveal {
    opacity: 0;
    transform: translateY(1.5rem);
    transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  /* ── Gradient text ── */
  .grad-text {
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── CTA buttons ── */
  .btn-solid {
    display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    color: var(--bg);
    font-family: 'Geist', sans-serif;
    font-weight: 600; font-size: .875rem;
    letter-spacing: .06em; text-transform: uppercase;
    padding: .875rem 2rem;
    border: none; cursor: pointer;
    clip-path: polygon(0 0, calc(100% - .625rem) 0, 100% .625rem, 100% 100%, .625rem 100%, 0 calc(100% - .625rem));
    transition: opacity .2s, transform .15s;
    text-decoration: none;
  }
  .btn-solid:hover  { opacity: .88; }
  .btn-solid:active { transform: scale(.98); }

  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent;
    color: var(--muted);
    font-family: 'Geist Mono', monospace;
    font-size: .75rem; font-weight: 600;
    letter-spacing: .1em; text-transform: uppercase;
    padding: .875rem 2rem;
    border: 1px solid var(--border); cursor: pointer;
    transition: all .2s;
    text-decoration: none;
  }
  .btn-ghost:hover { border-color: rgba(176,38,255,.5); color: var(--accent); }

  /* ── Badge / pill ── */
  .badge {
    display: inline-flex; align-items: center; gap: .35rem;
    font-family: 'Geist Mono', monospace;
    font-size: .5625rem; text-transform: uppercase; letter-spacing: .12em;
    padding: .3rem .7rem;
    border: 1px solid;
  }

  /* ── Section label ── */
  .sec-label {
    display: flex; align-items: center; gap: .75rem;
    font-family: 'Geist Mono', monospace;
    font-size: .6875rem; color: var(--dim);
    text-transform: uppercase; letter-spacing: .15em;
    margin-bottom: 1.5rem;
  }
  .sec-label::before {
    content: '';
    display: block; width: 1.5rem; height: 1px;
    background: var(--accent);
  }

  /* ── Filter pills ── */
  .fpill {
    font-family: 'Geist Mono', monospace;
    font-size: .5625rem; text-transform: uppercase; letter-spacing: .1em;
    padding: .375rem .875rem;
    border: 1px solid var(--border); color: var(--dim);
    background: transparent; cursor: pointer;
    transition: all .2s;
  }
  .fpill:hover, .fpill.active {
    border-color: rgba(176,38,255,.5); color: var(--accent);
    background: rgba(176,38,255,.05);
  }

  /* ── Progress bar ── */
  .prog-track { height: 3px; background: var(--border); overflow: hidden; }
  .prog-fill  { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }

  /* ── Stat grid box ── */
  .stat-box {
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 1rem; text-align: center;
    clip-path: polygon(0 0, calc(100% - .5rem) 0, 100% .5rem, 100% 100%, 0 100%);
  }
  .stat-val  { font-size: 1.25rem; font-weight: 700; color: var(--text); letter-spacing: -.03em; }
  .stat-lbl  { font-family: 'Geist Mono', monospace; font-size: .45rem; color: var(--faint); text-transform: uppercase; letter-spacing: .15em; margin-top: .25rem; }

  /* ── Tag chip ── */
  .tag-chip {
    font-family: 'Geist Mono', monospace;
    font-size: .5rem; text-transform: uppercase; letter-spacing: .1em;
    color: var(--dim); border: 1px solid var(--border);
    padding: .2rem .5rem; background: rgba(39,39,42,.35);
    transition: all .2s; cursor: default;
  }
  .tag-chip:hover { color: var(--accent); border-color: rgba(176,38,255,.4); }

  /* ── Noise overlay ── */
  .noise-layer {
    position: fixed; inset: 0; z-index: 100; pointer-events: none;
    opacity: .022;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ── Dashboard grid bg ── */
  .dash-grid {
    background-image:
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
    background-size: 1.5rem 1.5rem;
  }

  /* ── Hackathon card ── */
  .hack-card {
    background: linear-gradient(180deg, #161618, #0f0f11);
    border: 1px solid var(--border);
    display: flex; flex-direction: column;
    clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 1.25rem 100%, 0 calc(100% - 1.25rem));
    transition: border-color .35s, transform .35s, box-shadow .35s;
    cursor: pointer;
  }
  .hack-card:hover {
    border-color: rgba(176,38,255,.35);
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(0,0,0,.5);
  }
  .hack-card.featured { border-color: rgba(176,38,255,.4); box-shadow: 0 4px 30px rgba(176,38,255,.08); }
  .hack-card.featured::before {
    content: '';
    display: block; height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
  }

  /* ── Internship card ── */
  .intern-card {
    background: #111113;
    border: 1px solid var(--border);
    display: flex; flex-direction: column;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 1.25rem), calc(100% - 1.25rem) 100%, 0 100%);
    transition: border-color .35s, box-shadow .35s;
    cursor: pointer; position: relative;
  }
  .intern-card:hover { border-color: rgba(176,38,255,.3); box-shadow: 0 8px 32px rgba(0,0,0,.4); }
  .intern-card.hot::before {
    content: '';
    display: block; height: 2px;
    background: linear-gradient(90deg, rgba(248,113,113,.7), transparent);
  }

  /* ── Scholarship card ── */
  .sch-card {
    background: #0e0e10;
    border: 1px solid var(--border);
    display: flex; flex-direction: column; position: relative;
    transition: border-color .35s, box-shadow .35s;
    cursor: pointer;
  }
  .sch-card:hover { border-color: rgba(176,38,255,.25); box-shadow: 0 8px 32px rgba(0,0,0,.4); }
  .sch-card.featured {
    border-color: rgba(176,38,255,.4);
    box-shadow: 0 4px 40px rgba(176,38,255,.07);
  }
  .sch-card.featured::before {
    content: '';
    display: block; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent-2), transparent);
  }

  /* ── Card inner padding ── */
  .card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }

  /* ── Info mini cell ── */
  .info-cell { display: flex; gap: .5rem; }
  .info-label { font-family: 'Geist Mono', monospace; font-size: .45rem; color: var(--faint); text-transform: uppercase; letter-spacing: .12em; }
  .info-val   { color: #d4d4d8; font-size: .8125rem; font-weight: 500; line-height: 1.2; }

  /* ── Apply / CTA buttons inside cards ── */
  .card-btn-primary {
    width: 100%; padding: .875rem;
    font-family: 'Geist Mono', monospace; font-size: .75rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .1em;
    color: var(--bg);
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    border: none; cursor: pointer;
    clip-path: polygon(0 0, calc(100% - .625rem) 0, 100% .625rem, 100% 100%, .625rem 100%, 0 calc(100% - .625rem));
    transition: opacity .2s, transform .15s;
  }
  .card-btn-primary:hover  { opacity: .88; }
  .card-btn-primary:active { transform: scale(.98); }

  .card-btn-secondary {
    flex: 1; padding: .75rem;
    font-family: 'Geist Mono', monospace; font-size: .625rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .1em;
    background: var(--bg); border: 1px solid var(--border); color: var(--muted);
    cursor: pointer; transition: all .2s;
  }
  .card-btn-secondary:hover { border-color: rgba(176,38,255,.5); color: var(--accent); }

  .card-btn-apply {
    flex: 1; padding: .75rem;
    font-family: 'Geist Mono', monospace; font-size: .625rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .1em;
    color: var(--bg);
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    border: none; cursor: pointer;
    transition: opacity .2s, transform .15s;
  }
  .card-btn-apply:hover  { opacity: .88; }
  .card-btn-apply:active { transform: scale(.98); }

  /* ── Scholarship amount box ── */
  .sch-amount-box {
    border: 1px solid var(--border);
    background: linear-gradient(135deg, var(--bg), #111115);
    padding: 1.25rem;
    clip-path: polygon(0 0, calc(100% - .75rem) 0, 100% .75rem, 100% 100%, 0 100%);
    position: relative; overflow: hidden;
  }
  .sch-amount-box::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(176,38,255,.05), transparent);
  }

  /* ── Prize box in hackathon card ── */
  .prize-box {
    border: 1px solid var(--border); background: var(--bg);
    padding: .875rem 1rem;
    display: flex; justify-content: space-between;
    clip-path: polygon(0 0, calc(100% - .5rem) 0, 100% .5rem, 100% 100%, 0 100%);
  }

  /* ── Stats trio in intern card ── */
  .stipend-cell {
    border: 1px solid rgba(176,38,255,.3);
    background: rgba(176,38,255,.05);
    padding: .75rem;
  }
  .meta-cell {
    border: 1px solid var(--border);
    background: var(--bg);
    padding: .75rem;
  }
  .meta-lbl { font-family: 'Geist Mono', monospace; font-size: .45rem; text-transform: uppercase; letter-spacing: .12em; margin-bottom: .25rem; }
  .meta-val  { font-weight: 600; font-size: .875rem; line-height: 1.2; }

  /* ── Perk / category pills ── */
  .perk-pill {
    font-family: 'Geist Mono', monospace; font-size: .45rem;
    text-transform: uppercase; letter-spacing: .12em;
    padding: .25rem .625rem; border: 1px solid;
  }

  /* ── Scholarship meta grid cell ── */
  .sch-meta {
    border: 1px solid var(--border); background: var(--bg);
    padding: .625rem; text-align: center;
  }
  .sch-meta-lbl { font-family: 'Geist Mono', monospace; font-size: .4rem; color: var(--faint); text-transform: uppercase; letter-spacing: .12em; margin-bottom: .25rem; }
  .sch-meta-val { font-family: 'Geist Mono', monospace; font-size: .75rem; font-weight: 600; }

  /* ── Eligibility dot ── */
  .elig-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0; margin-top: .45rem;
  }

  /* ── Urgent ribbon ── */
  .urgent-ribbon {
    position: absolute; top: .875rem; right: 0;
    background: #ef4444; color: #fff;
    font-family: 'Geist Mono', monospace;
    font-size: .45rem; text-transform: uppercase; letter-spacing: .12em;
    padding: .35rem .875rem;
    clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%);
    z-index: 10;
  }

  /* ── Hot badge ── */
  .hot-badge {
    position: absolute; top: 1rem; right: 1rem;
    display: flex; align-items: center; gap: .375rem;
    font-family: 'Geist Mono', monospace; font-size: .45rem;
    text-transform: uppercase; letter-spacing: .12em;
    color: var(--red); border: 1px solid rgba(248,113,113,.3);
    background: rgba(248,113,113,.05); padding: .3rem .625rem;
    z-index: 10;
  }
  .hot-blink { width: 5px; height: 5px; border-radius: 50%; background: var(--red); animation: blink 1.5s infinite; }

  /* ── Verified tick ── */
  .verified-icon { flex-shrink: 0; }

  /* ── Nav links ── */
  .nav-link {
    position: relative; color: var(--muted); text-decoration: none;
    font-size: .875rem; font-weight: 500;
    transition: color .2s;
  }
  .nav-link::after {
    content: '';
    position: absolute; bottom: -.25rem; left: 0; width: 100%; height: 1px;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transform: scaleX(0); transform-origin: right;
    transition: transform .3s cubic-bezier(.16,1,.3,1);
  }
  .nav-link:hover { color: var(--text); }
  .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }

  /* ── Mode dot colors ── */
  .dot-green  { background: var(--green); }
  .dot-sky    { background: var(--sky); }
  .dot-amber  { background: var(--amber); }
`;

/* ─── Scroll reveal hook ─────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Live dashboard feed ────────────────────────────────────── */
function DashFeed() {
  const LOGS = [
    "New hackathon listed: HackMIT 2025 — $50,000 prize",
    "3 internships added at Google DeepMind",
    "Chevening 2025 deadline updated → Nov 5",
    "Alert: Smart India Hackathon is 70% full",
    "New scholarship: PM YASASVI Fellowship",
    "Razorpay hiring 12 SDE interns this cycle",
    "Infosys Springboard scholarship applications open",
  ];
  const [feed, setFeed] = useState(LOGS.slice(0, 5).map((l, i) => ({ id: i, text: l })));

  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      const msg = LOGS[Math.floor(Math.random() * LOGS.length)];
      const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
      setFeed((prev) => [{ id: ++id, text: `[${ts}] ${msg}` }, ...prev.slice(0, 4)]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: ".75rem", overflow: "hidden" }}>
      {feed.map((item, i) => (
        <div
          key={item.id}
          className="mono"
          style={{
            fontSize: ".6875rem",
            color: i === 0 ? "var(--accent)" : "var(--dim)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            transition: "color .4s",
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

/* ─── Metrics dashboard section ─────────────────────────────── */
function MetricsSection() {
  const bars = [30, 45, 25, 60, 55, 80, 40, 70, 65, 35, 95, 50];

  return (
    <section style={{ borderTop: "1px solid var(--border)", background: "var(--bg)", overflow: "hidden" }}>
      <div
        style={{
          maxWidth: "84rem", margin: "0 auto", padding: "0 1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          height: "4.5rem",
        }}
      >
        <div className="sec-label" style={{ margin: 0 }}>Phase_00 // Live Intelligence Dashboard</div>
        <span className="mono" style={{ fontSize: ".625rem", color: "var(--faint)" }}>SYS_UI // 60FPS</span>
      </div>

      <div
        className="reveal"
        style={{
          maxWidth: "95vw", margin: "0 auto",
          border: "1px solid var(--border)", borderBottom: "none",
          background: "var(--surface)", borderRadius: "12px 12px 0 0",
          overflow: "hidden",
          boxShadow: "0 -20px 50px rgba(176,38,255,.03)",
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: ".75rem 1rem", borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div style={{ display: "flex", gap: ".5rem" }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--border)" }} />)}
          </div>
          <div
            className="mono"
            style={{
              fontSize: ".6875rem", color: "var(--muted)",
              display: "flex", alignItems: "center", gap: ".5rem",
              background: "var(--surface)", padding: ".25rem .875rem",
              borderRadius: 4, border: "1px solid var(--border)",
            }}
          >
            🔒 HackXplore.core / command-center
          </div>
          <div style={{ width: 48 }} />
        </div>

        {/* Dashboard body */}
        <div style={{ display: "grid", gridTemplateColumns: "14rem 1fr 20rem", height: "35rem" }}>
          {/* Sidebar */}
          <div style={{ borderRight: "1px solid var(--border)", background: "var(--bg)", padding: "1rem" }}>
            <div className="mono" style={{ fontSize: ".75rem", color: "var(--text)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: ".5rem" }}>📊 Overview</div>
            {[
              { icon: "🏆", label: "Hackathons", active: false },
              { icon: "💼", label: "Internships", active: true },
              { icon: "🎓", label: "Scholarships", active: false },
              { icon: "📈", label: "Analytics", active: false },
            ].map(({ icon, label, active }) => (
              <div
                key={label}
                className="mono"
                style={{
                  fontSize: ".75rem", display: "flex", alignItems: "center", gap: ".625rem",
                  padding: ".5rem .75rem", marginBottom: ".375rem", borderRadius: 4, cursor: "pointer",
                  color: active ? "var(--accent)" : "var(--dim)",
                  background: active ? "rgba(176,38,255,.1)" : "transparent",
                  transition: "all .2s",
                }}
              >
                {icon} {label}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="dash-grid" style={{ padding: "1.5rem", background: "var(--bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-.02em" }}>Platform Activity</h3>
                <p className="mono" style={{ fontSize: ".6875rem", color: "var(--dim)", marginTop: ".25rem" }}>Applications submitted — real time</p>
              </div>
              <div style={{ display: "flex", gap: ".375rem" }}>
                {["1H", "24H", "7D"].map((t, i) => (
                  <span key={t} className="mono" style={{
                    fontSize: ".625rem", padding: ".25rem .625rem", borderRadius: 4,
                    background: i === 0 ? "var(--border)" : "transparent",
                    border: i === 0 ? "none" : "1px solid var(--border)",
                    color: i === 0 ? "var(--text)" : "var(--dim)", cursor: "pointer",
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div
              style={{
                height: "12rem", borderBottom: "1px solid var(--border)", borderLeft: "1px solid var(--border)",
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                padding: "0 .5rem .25rem", marginBottom: "1.5rem", gap: ".25rem",
              }}
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, borderRadius: "2px 2px 0 0", height: `${h}%`,
                    background: i === 10 ? "var(--accent)" : i === 5 ? "rgba(176,38,255,.6)" : "var(--border)",
                    boxShadow: i === 10 ? "0 0 15px rgba(176,38,255,.3)" : "none",
                    transition: "background .2s", cursor: "pointer",
                  }}
                  onMouseOver={(e) => { if (i !== 10 && i !== 5) e.currentTarget.style.background = "rgba(176,38,255,.4)"; }}
                  onMouseOut={(e) => { if (i !== 10 && i !== 5) e.currentTarget.style.background = "var(--border)"; }}
                />
              ))}
            </div>

            {/* Mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
              {[
                { label: "Applications Today", value: "8,412" },
                { label: "New Listings", value: "142" },
                { label: "Avg. Response Time", value: "0.3s", accent: true },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: ".75rem", borderRadius: 6 }}>
                  <div className="mono" style={{ fontSize: ".5625rem", color: "var(--dim)", marginBottom: ".375rem" }}>{label}</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 600, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live feed */}
          <div style={{ borderLeft: "1px solid var(--border)", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            <div className="mono" style={{ padding: "1rem", borderBottom: "1px solid var(--border)", fontSize: ".75rem", color: "var(--text)" }}>
              🟢 Live Platform Feed
            </div>
            <DashFeed />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ────────────────────────────────────────────── */
function CTASection() {
  const [email, setEmail] = useState("");

  return (
    <section
      id="apply"
      style={{ padding: "6rem 0", borderTop: "1px solid var(--border)", background: "#0c0c0e", position: "relative", overflow: "hidden" }}
    >
      <div style={{
        position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)",
        width: "40rem", height: "20rem", background: "var(--accent)",
        opacity: .03, filter: "blur(100px)", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div className="badge" style={{ color: "var(--accent)", borderColor: "rgba(176,38,255,.25)", background: "rgba(176,38,255,.05)", marginBottom: "2rem", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
          🚀 Early Access Open
        </div>

        <h2 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 700, letterSpacing: "-.04em", color: "var(--text)", marginBottom: "1rem", lineHeight: 1.1 }}>
          Never miss an opportunity.
        </h2>

        <p style={{ color: "var(--muted)", fontSize: "1.125rem", marginBottom: "2.5rem", maxWidth: "32rem", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          Get personalized alerts for hackathons, internships, and scholarships matching your profile. Weekly digest. Zero spam.
        </p>

        <div style={{ display: "flex", gap: ".75rem", maxWidth: "32rem", margin: "0 auto 1rem" }}>
          <input
            type="email"
            placeholder="yourname@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
              color: "var(--text)", fontSize: ".9375rem", padding: "1rem 1.25rem",
              fontFamily: "'Geist', sans-serif", outline: "none",
              transition: "border-color .2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <button
            className="btn-solid"
            onClick={() => email && alert(`🎉 Subscribed: ${email}`)}
          >
            Get Alerts →
          </button>
        </div>

        <p className="mono" style={{ fontSize: ".5625rem", color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".15em" }}>
          Join 42,000+ students already getting alerts
        </p>
      </div>
    </section>
  );
}

/* ─── Root App ────────────────────────────────────────────────── */
export default function App() {
  useReveal();

  return (
    <>
      {/* Inject all global styles */}
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
        {/* Film-grain noise overlay */}
        <div className="noise-layer" />

        <Navbar />

        <main style={{ paddingTop: "6rem" }}>
          <Hero />
          <MetricsSection />
          <HackathonsSection />
          <InternshipsSection />
          <ScholarshipsSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
