import { useEffect, useMemo, useState } from "react";
import InternshipCard from "./InternshipCard";

const SECTION_CSS = `
  .intern-section {
    padding: 6rem 0;
    background: #0c0c0e;
    border-top: 1px solid var(--border);
  }
  .intern-section-inner { max-width: 84rem; margin: 0 auto; padding: 0 1.5rem; }
  .intern-header {
    display: flex; justify-content: space-between;
    align-items: flex-end; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap;
  }
  .intern-h2 {
    font-size: clamp(2rem, 4vw, 3rem); font-weight: 600;
    letter-spacing: -.04em; color: var(--text); line-height: 1.1;
  }
  .intern-sub { color: var(--muted); margin-top: .75rem; max-width: 32rem; line-height: 1.6; }
  .intern-banner {
    margin-bottom: 2rem;
    border: 1px solid rgba(176,38,255,.2);
    background: linear-gradient(90deg, rgba(176,38,255,.05), transparent);
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);
    flex-wrap: wrap;
  }
  .intern-banner-text { font-weight: 600; font-size: .9375rem; color: var(--text); }
  .intern-banner-sub  { font-family: 'Geist Mono', monospace; font-size: .5625rem; color: var(--dim); margin-top: .25rem; }
  .intern-banner-btn  {
    font-family: 'Geist Mono', monospace; font-size: .5625rem;
    text-transform: uppercase; letter-spacing: .1em;
    color: var(--accent); border: 1px solid rgba(176,38,255,.4);
    padding: .5rem 1rem; background: transparent; cursor: pointer;
    white-space: nowrap; transition: background .2s;
  }
  .intern-banner-btn:hover { background: rgba(176,38,255,.1); }
  .intern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }
  .intern-load-more { text-align: center; margin-top: 2.5rem; }
  @media (max-width: 640px) {
    .intern-header { flex-direction: column; align-items: flex-start; }
    .intern-grid   { grid-template-columns: 1fr; }
  }
`;

const FILTERS = ["All Roles", "Remote", "Paid Only", "Internshala"];

const inferMode = (location = "") => {
  const loc = String(location).toLowerCase();
  if (loc.includes("work from home") || loc.includes("remote")) return "remote";
  if (loc.includes("hybrid")) return "hybrid";
  return "onsite";
};

const parseMonthlyDuration = (stipend = "") => {
  const s = String(stipend).toLowerCase();
  if (s.includes("/week")) return "1-2 Months";
  if (s.includes("lump sum")) return "Flexible";
  return "3-6 Months";
};

const makeSkills = (title = "") => {
  const parts = String(title)
    .replace(/[()\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  return parts.length ? parts : ["Communication"];
};

export default function InternshipsSection({ maxItems = 10, showViewMore = true }) {
  const [activeFilter, setActiveFilter] = useState("All Roles");
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    const jsonUrl = `${import.meta.env.BASE_URL}internship.json`;

    fetch(jsonUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Failed to load ${jsonUrl} (${r.status})`))))
      .then((rows) => {
        if (!alive || !Array.isArray(rows)) return;

        const mapped = rows.map((row, idx) => {
          const mode = inferMode(row.location);
          return {
            id: row.link || `${row.title}-${idx}`,
            role: row.title || "Internship",
            company: row.company || "Unknown Company",
            companyLogo: (row.company || "?").trim().charAt(0).toUpperCase() || "?",
            stipend: row.stipend || "Unpaid",
            duration: parseMonthlyDuration(row.stipend),
            mode,
            skills: makeSkills(row.title),
            domain: row.source ? String(row.source).toUpperCase() : "INTERNSHIP",
            openings: 1,
            deadline: "Rolling",
            startDate: "Immediate",
            perks: ["Stipend", "Certificate"],
            verified: true,
            hot: idx < 8,
            applyUrl: row.link,
          };
        });

        setInternships(mapped);
        setLoadError("");
      })
      .catch((err) => {
        if (alive) {
          setInternships([]);
          setLoadError(err?.message || "Unable to load internship data");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => internships.filter((i) => {
    if (activeFilter === "All Roles") return true;
    if (activeFilter === "Remote") return i.mode === "remote";
    if (activeFilter === "Paid Only") return !String(i.stipend).toLowerCase().includes("unpaid");
    if (activeFilter === "Internshala") return i.domain === "INTERNSHALA";
    return true;
  }), [activeFilter, internships]);

  const visibleItems = useMemo(() => (
    showAll ? filtered : filtered.slice(0, maxItems)
  ), [filtered, showAll, maxItems]);

  const canViewMore = showViewMore && !showAll && filtered.length > maxItems;

  return (
    <>
      <style>{SECTION_CSS}</style>

      <section id="internships" className="intern-section">
        <div className="intern-section-inner">
          <div className="sec-label">Phase_02 // Internships</div>

          <div className="intern-header">
            <div>
              {showAll && (
                <button className="btn-ghost" style={{ marginBottom: ".85rem" }} onClick={() => setShowAll(false)}>
                  Back to Home
                </button>
              )}
              <h2 className="intern-h2">{showAll ? "All Internships" : "Real work. Real impact."}</h2>
              <p className="intern-sub">
                {showAll
                  ? "Browse the full internships dataset from your scraper."
                  : "Curated internship opportunities from your latest JSON data."}
              </p>
            </div>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`fpill ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="intern-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>Hiring</span>
              <div>
                <p className="intern-banner-text">Internship feed is live</p>
                <p className="intern-banner-sub">{filtered.length} opportunities available</p>
              </div>
            </div>
            {canViewMore && (
              <button className="intern-banner-btn" onClick={() => setShowAll(true)}>Browse All {'->'}</button>
            )}
          </div>

          <div className="intern-grid">
            {loading && <div className="mono" style={{ color: "var(--muted)" }}>Loading internships...</div>}

            {!loading && loadError && <div className="mono" style={{ color: "var(--red)" }}>{loadError}</div>}

            {!loading && !loadError && visibleItems.length === 0 && (
              <div className="mono" style={{ color: "var(--muted)" }}>No internships found for this filter.</div>
            )}

            {!loading && !loadError && visibleItems.map((item) => (
              <InternshipCard
                key={item.id}
                {...item}
                onApply={() => window.open(item.applyUrl, "_blank", "noopener,noreferrer")}
              />
            ))}
          </div>

          <div className="intern-load-more">
            {canViewMore ? (
              <button className="btn-ghost" onClick={() => setShowAll(true)}>View More Internships {'->'}</button>
            ) : (
              <button className="btn-ghost">Loaded from JSON dataset</button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
