import { useEffect, useMemo, useState } from "react";
import InternshipCard from "./InternshipCard";

const SECTION_CSS = `
  .intern-section { padding: 6rem 0; background: #0c0c0e; border-top: 1px solid var(--border); }
  .intern-section-inner { max-width: 84rem; margin: 0 auto; padding: 0 1.5rem; }
  .intern-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap; }
  .intern-h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 600; letter-spacing: -.04em; color: var(--text); line-height: 1.1; }
  .intern-sub { color: var(--muted); margin-top: .75rem; max-width: 32rem; line-height: 1.6; }
  .intern-banner {
    margin-bottom: 2rem; border: 1px solid rgba(176,38,255,.2);
    background: linear-gradient(90deg, rgba(176,38,255,.05), transparent);
    padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%); flex-wrap: wrap;
  }
  .intern-banner-text { font-weight: 600; font-size: .9375rem; color: var(--text); }
  .intern-banner-sub { font-family: 'Geist Mono', monospace; font-size: .5625rem; color: var(--dim); margin-top: .25rem; }
  .intern-banner-btn {
    font-family: 'Geist Mono', monospace; font-size: .5625rem; text-transform: uppercase; letter-spacing: .1em;
    color: var(--accent); border: 1px solid rgba(176,38,255,.4); padding: .5rem 1rem; background: transparent; cursor: pointer;
  }
  .intern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  .intern-load-more { text-align: center; margin-top: 2.5rem; }
`;

export default function InternshipsSection({ maxItems = 3 }) {
  const [activeFilter, setActiveFilter] = useState("All Roles");
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(maxItems);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}internship.json`)
      .then(r => r.json())
      .then(rows => {
        const mapped = rows.map((row, idx) => ({
          id: row.link || idx,
          role: row.title || "Internship",
          company: row.company || "Unknown",
          companyLogo: (row.company || "?").trim().charAt(0).toUpperCase(),
          stipend: row.stipend || "Unpaid",
          duration: "3-6 Months",
          mode: row.location?.toLowerCase().includes("remote") ? "remote" : "onsite",
          skills: (row.title || "").split(" ").slice(0, 3),
          domain: row.source?.toUpperCase() || "INTERN",
          openings: 1,
          deadline: "Rolling",
          startDate: "Immediate",
          hot: idx < 5,
          applyUrl: row.link,
        }));
        setInternships(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => internships.filter(i => {
    if (activeFilter === "All Roles") return true;
    if (activeFilter === "Remote") return i.mode === "remote";
    if (activeFilter === "Paid Only") return !i.stipend.toLowerCase().includes("unpaid");
    return true;
  }), [activeFilter, internships]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const handleViewMore = () => {
  setVisibleCount(prev => prev + 3);
};
  
  // const handleViewMore = () => { window.location.href = "/internship"; };

  return (
    <>
      <style>{SECTION_CSS}</style>
      <section id="internships" className="intern-section">
        <div className="intern-section-inner">
          <div className="sec-label">Phase_02 // Internships</div>
          <div className="intern-header">
            <div>
              <h2 className="intern-h2">Real work. Real impact.</h2>
              <p className="intern-sub">Curated internship opportunities for developers.</p>
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              {["All Roles", "Remote", "Paid Only"].map(f => (
                <button key={f} className={`fpill ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          <div className="intern-banner">
            <div>
              <p className="intern-banner-text">Internship feed is live</p>
              <p className="intern-banner-sub">{filtered.length} opportunities found</p>
            </div>
            <button className="intern-banner-btn" onClick={handleViewMore}>Browse All {'->'}</button>
          </div>

          <div className="intern-grid">
            {!loading && visibleItems.map(item => (
              <InternshipCard key={item.id} {...item} onApply={() => window.open(item.applyUrl, "_blank")} />
            ))}
          </div>

          <div className="intern-load-more">
            <button className="btn-ghost" onClick={handleViewMore}>View More Internships {'->'}</button>
          </div>
        </div>
      </section>
    </>
  );
}