import { useState } from "react";

const INTERN_CARD_CSS = `
  .ic-company-logo {
    width: 2.75rem; height: 2.75rem; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg); border: 1px solid var(--border);
    font-size: 1.25rem; border-radius: 2px;
  }
  .ic-role    { color: var(--text); font-weight: 600; font-size: .9375rem; letter-spacing: -.02em; }
  .ic-company { color: var(--dim); font-size: .875rem; margin-top: .2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ic-meta-row { display: flex; align-items: center; gap: .625rem; margin-top: 0.75rem; }
  .ic-mode-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .ic-mode-lbl { font-family: 'Geist Mono', monospace; font-size: .5625rem; color: var(--muted); text-transform: uppercase; letter-spacing: .12em; }
  .ic-sep      { color: var(--faint); }
  .ic-domain   { font-family: 'Geist Mono', monospace; font-size: .5625rem; color: var(--dim); text-transform: uppercase; letter-spacing: .12em; }
  
  .ic-stats3   { 
    display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; 
    margin: 1.25rem 0; padding: 0.75rem 0;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .ic-dates    { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
  .ic-date-lbl { font-family: 'Geist Mono', monospace; font-size: .45rem; color: var(--faint); text-transform: uppercase; letter-spacing: .12em; display: block; margin-bottom: .2rem; }
  .ic-date-val { color: var(--muted); font-size: .875rem; }
  .ic-skills   { display: flex; flex-wrap: wrap; gap: .375rem; margin-bottom: 1.5rem; }
  .ic-actions  { display: flex; gap: .5rem; margin-top: auto; }
`;

const MODE_DOTS = {
  remote: { label: "Remote", dot: "#4ade80" },
  hybrid: { label: "Hybrid", dot: "#38bdf8" },
  onsite: { label: "On-site", dot: "#fbbf24" },
};

export default function InternshipCard({
  role, company, companyLogo, stipend, duration, mode, 
  skills, domain, openings, deadline, startDate, hot, onApply
}) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const modeConf = MODE_DOTS[mode] || MODE_DOTS.remote;

  return (
    <>
      <style>{INTERN_CARD_CSS}</style>
      <article
        className={`intern-card ${hot ? "hot" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(176,38,255,.06), transparent 55%)`,
          }} />
        )}

        <div className="card-body" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div className="ic-company-logo">{companyLogo}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <span className="ic-role">{role}</span>
              </div>
              <div className="ic-company">{company}</div>
            </div>
          </div>

          <div className="ic-meta-row">
            <span className="ic-mode-dot" style={{ background: modeConf.dot }} />
            <span className="ic-mode-lbl">{modeConf.label}</span>
            <span className="ic-sep">·</span>
            <span className="ic-domain">{domain}</span>
          </div>

          <div className="ic-stats3">
            <div>
              <div className="meta-lbl" style={{ color: "var(--accent)" }}>Stipend</div>
              <div className="meta-val" style={{ color: "var(--accent)" }}>{stipend}</div>
            </div>
            <div>
              <div className="meta-lbl">Duration</div>
              <div className="meta-val">{duration}</div>
            </div>
            <div>
              <div className="meta-lbl">Openings</div>
              <div className="meta-val">{openings} Left</div>
            </div>
          </div>

          <div className="ic-dates">
            <div>
              <span className="ic-date-lbl">Apply By</span>
              <span className="ic-date-val">{deadline}</span>
            </div>
            <div>
              <span className="ic-date-lbl">Starts</span>
              <span className="ic-date-val">{startDate}</span>
            </div>
          </div>

          <div className="ic-skills">
            {skills.slice(0, 3).map((s) => (
              <span key={s} className="tag-chip">{s}</span>
            ))}
          </div>

          <div className="ic-actions">
            <button className="card-btn-secondary" onClick={onApply}>Details</button>
            <button className="card-btn-apply" onClick={onApply}>Apply Now →</button>
          </div>
        </div>
      </article>
    </>
  );
}