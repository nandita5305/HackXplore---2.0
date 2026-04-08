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

  /* ── Phase_00 Features Section ── */
  .features-section {
    padding: 6rem 0;
    border-top: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .feat-bg-orbs {
    position: absolute;
    top: -20%; left: 20%;
    width: 60vw; height: 60vw;
    background: radial-gradient(circle, rgba(176,38,255,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  .feat-header {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
    z-index: 1;
  }
  .feat-header h2 {
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .feat-header p {
    color: var(--muted);
    max-width: 42rem;
    margin: 0 auto;
    line-height: 1.6;
  }
  .feat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    max-width: 84rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    position: relative;
    z-index: 1;
  }
  .feat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 2rem 1.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }
  .feat-card:hover {
    border-color: rgba(176, 38, 255, 0.4);
    background: rgba(176, 38, 255, 0.03);
    transform: translateY(-4px);
  }
  .feat-icon-wrap {
    width: 3rem; height: 3rem;
    background: rgba(176, 38, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    color: var(--accent);
  }
  .feat-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text);
  }
  .feat-card p {
    font-size: 0.9375rem;
    color: var(--dim);
    line-height: 1.6;
  }
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

/* ─── Features Section (Replaces Metrics Dashboard) ────────── */
function FeaturesSection() {
  const features = [
    {
      title: "Centralized Discovery",
      desc: "Find hackathons and internships from multiple platforms in one place, saving you time and effort.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      title: "AI Recommendations",
      desc: "Get personalized suggestions based on your skills, interests, and past activities.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="18" x2="15" y2="18"></line>
          <line x1="10" y1="22" x2="14" y2="22"></line>
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
        </svg>
      )
    },
    {
      title: "Team Formation",
      desc: "Easily create or join teams for hackathons with our built-in team formation feature.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      title: "Global Opportunities",
      desc: "Access opportunities from around the world, whether remote or in-person.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      )
    }
  ];

  return (
    <section className="features-section">
      <div className="feat-bg-orbs"></div>
      
      <div className="reveal feat-header">
        <h2>Why Choose HackXplore</h2>
        <p>We simplify your journey to find and participate in hackathons and internships that match your skills and interests.</p>
      </div>

      <div className="reveal feat-grid">
        {features.map((feat, idx) => (
          <div key={idx} className="feat-card">
            <div className="feat-icon-wrap">{feat.icon}</div>
            <h3>{feat.title}</h3>
            <p>{feat.desc}</p>
          </div>
        ))}
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
          <FeaturesSection />
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