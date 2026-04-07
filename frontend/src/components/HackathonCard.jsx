import { useState } from "react";

/* ── HackathonCard-specific CSS ──────────────────────────────── */
const HACKATHON_CARD_CSS = `
  .hc-logo {
    width: 2.75rem; height: 2.75rem; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg); border: 1px solid var(--border);
    font-size: 1.25rem;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    overflow: hidden;
  }
  .hc-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hc-title { color: var(--text); font-weight: 600; font-size: .9375rem; line-height: 1.2; letter-spacing: -.02em; }
  .hc-org   { font-family: 'Geist Mono', monospace; font-size: .5625rem; color: var(--dim); margin-top: .2rem; }
  .hc-prize-val { font-size: 1.5rem; font-weight: 700; color: var(--accent); letter-spacing: -.03em; line-height: 1; }
  .hc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: .625rem; }
  .hc-tags  { display: flex; flex-wrap: wrap; gap: .375rem; }
  .hc-footer{ font-family: 'Geist Mono', monospace; font-size: .5rem; color: var(--faint); text-transform: uppercase; letter-spacing: .1em; margin-top: auto; }
  .hc-mode-badge { font-family: 'Geist Mono', monospace; font-size: .5rem; text-transform: uppercase; letter-spacing: .12em; padding: .3rem .625rem; border: 1px solid; flex-shrink: 0; }
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const MODE = {
  online:  { label: "Online",    style: { color: "#4ade80", borderColor: "rgba(74,222,128,.3)",   background: "rgba(74,222,128,.05)" } },
  hybrid:  { label: "Hybrid",    style: { color: "#38bdf8", borderColor: "rgba(56,189,248,.3)",   background: "rgba(56,189,248,.05)" } },
  offline: { label: "In-Person", style: { color: "#fbbf24", borderColor: "rgba(251,191,36,.3)",   background: "rgba(251,191,36,.05)" } },
};

const DIFF_COLOR = { Beginner: "#4ade80", Intermediate: "#fbbf24", Advanced: "#f87171" };

/* ── HackathonCard ───────────────────────────────────────────── */
/**
 * Reusable HackathonCard
 * Props: title, organizer, prize, date, location, mode, teamSize,
 *        difficulty, tags[], deadline, registered, capacity, logo,
 *        featured, onApply
 */
export default function HackathonCard({
  title      = "Global Hack 2025",
  organizer  = "TechCorp",
  prize      = "$50,000",
  date       = "Aug 12–14, 2025",
  location   = "San Francisco, CA",
  mode       = "hybrid",
  teamSize   = "1–4 Members",
  difficulty = "Intermediate",
  tags       = ["AI/ML", "Web3", "Open Source"],
  deadline   = "Aug 1, 2025",
  registered = 1240,
  capacity   = 2000,
  logo       = "⚡",
  featured   = false,
  onApply,
}) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const fillPct = capacity > 0 ? Math.min((registered / capacity) * 100, 100) : null;
  const modeConf = MODE[mode] || MODE.online;
  const logoIsImage = typeof logo === "string" && /^https?:\/\//i.test(logo);

  return (
    <>
      <style>{HACKATHON_CARD_CSS}</style>

      <article
        className={`hack-card ${featured ? "featured" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Mouse-tracked radial glow */}
        {hovered && (
          <div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(176,38,255,.07), transparent 55%)`,
            }}
          />
        )}

        <div className="card-body" style={{ position: "relative", zIndex: 1 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
              <div className="hc-logo">
                {logoIsImage ? <img src={logo} alt={title} /> : logo}
              </div>
              <div>
                <div className="hc-title">{title}</div>
                <div className="hc-org">by {organizer}</div>
              </div>
            </div>
            <span className="hc-mode-badge" style={modeConf.style}>{modeConf.label}</span>
          </div>

          {/* Prize + difficulty box */}
          <div className="prize-box">
            <div>
              <div className="mono" style={{ fontSize: ".5rem", color: "var(--dim)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: ".25rem" }}>Prize Pool</div>
              <div className="hc-prize-val">{prize}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: ".5rem", color: "var(--dim)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: ".25rem" }}>Difficulty</div>
              <div className="mono" style={{ fontSize: ".8125rem", fontWeight: 600, color: DIFF_COLOR[difficulty] || "#a1a1aa" }}>{difficulty}</div>
            </div>
          </div>

          {/* Info grid */}
          <div className="hc-grid2">
            {[
              { emoji: "📅", label: "Date",     value: date },
              { emoji: "📍", label: "Location", value: location },
              { emoji: "👥", label: "Team",     value: teamSize },
              { emoji: "⏰", label: "Deadline", value: deadline },
            ].map(({ emoji, label, value }) => (
              <div key={label} className="info-cell">
                <span style={{ fontSize: ".875rem", flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                <div>
                  <div className="info-label">{label}</div>
                  <div className="info-val">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="hc-tags">
            {tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
          </div>

          {/* Progress bar */}
          {fillPct !== null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".375rem" }}>
                <span className="mono" style={{ fontSize: ".45rem", color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".12em" }}>Participants</span>
                <span className="mono" style={{ fontSize: ".45rem", color: "var(--muted)" }}>{registered.toLocaleString()} / {capacity.toLocaleString()}</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: `${fillPct}%` }} />
              </div>
            </div>
          )}

          {/* CTA */}
          <button className="card-btn-primary" style={{ marginTop: "auto" }} onClick={onApply}>
            Register Now →
          </button>
        </div>
      </article>
    </>
  );
}
