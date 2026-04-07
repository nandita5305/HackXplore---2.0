import { useEffect, useMemo, useState } from "react";
import ScholarshipCard from "./ScholarshipCard";

/* Section-specific CSS */
const SECTION_CSS = `
  .sch-section {
    padding: 6rem 0;
    background: var(--bg);
    border-top: 1px solid var(--border);
  }
  .sch-section-inner { max-width: 84rem; margin: 0 auto; padding: 0 1.5rem; }
  .sch-header {
    display: flex; justify-content: space-between;
    align-items: flex-end; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap;
  }
  .sch-h2 {
    font-size: clamp(2rem, 4vw, 3rem); font-weight: 600;
    letter-spacing: -.04em; color: var(--text); line-height: 1.1;
  }
  .sch-sub { color: var(--muted); margin-top: .75rem; max-width: 32rem; line-height: 1.6; }
  .sch-stats4 {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1rem; margin-bottom: 3rem;
  }
  .sch-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 1.25rem;
  }
  .sch-load-more { text-align: center; margin-top: 2.5rem; }
  @media (max-width: 900px) {
    .sch-stats4 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .sch-header { flex-direction: column; align-items: flex-start; }
    .sch-grid   { grid-template-columns: 1fr; }
    .sch-stats4 { grid-template-columns: 1fr 1fr; }
  }
`;

const FILTERS = ["All", "Merit", "Need-Based", "Research", "Diversity"];

const inferCategory = (name = "") => {
  const text = String(name).toLowerCase();
  if (text.includes("research") || text.includes("fellowship")) return "Research";
  if (text.includes("girl") || text.includes("women") || text.includes("obc") || text.includes("sc") || text.includes("st")) {
    return "Diversity";
  }
  if (text.includes("income") || text.includes("financial")) return "Need-Based";
  return "Merit";
};

const inferLevel = (name = "") => {
  const text = String(name).toLowerCase();
  if (text.includes("phd")) return "PhD";
  if (text.includes("pg") || text.includes("postgraduate")) return "PG";
  if (text.includes("ug") || text.includes("undergraduate") || text.includes("post matric")) return "UG";
  return "All";
};

const toWords = (name = "") =>
  String(name)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3);

export default function ScholarshipsSection({ maxItems = 10, showViewMore = true }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    const jsonUrl = `${import.meta.env.BASE_URL}scholarships.json`;

    fetch(jsonUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Failed to load ${jsonUrl} (${r.status})`))))
      .then((rows) => {
        if (!alive || !Array.isArray(rows)) return;

        const mapped = rows.map((row, idx) => {
          const name = row.name || "Untitled Scholarship";
          const provider = row.provider || String(row.source || "Unknown Source").toUpperCase();
          const level = inferLevel(name);
          const category = inferCategory(name);
          const fields = toWords(name);
          const eligibility = String(row.eligibility || "")
            .split(/[;,|]/)
            .map((v) => v.trim())
            .filter(Boolean);

          return {
            id: row.url || `${name}-${idx}`,
            name,
            provider,
            providerLogo: provider.charAt(0).toUpperCase() || "S",
            amount: row.stipend || "Check Details",
            amountNote: row.duration || "As per scholarship terms",
            category,
            eligibility: eligibility.length ? eligibility : ["See official link for complete eligibility criteria"],
            deadline: row.deadline || row.status || "Check official page",
            renewability: row.duration || "Varies",
            level,
            country: row.location || "India",
            fields: fields.length ? fields : ["General"],
            totalAwarded: String(row.source || "source").toUpperCase(),
            applicants: "N/A",
            acceptance: "N/A",
            featured: idx < 6,
            urgent: /closing|last date|deadline/i.test(String(row.status || row.description || "")),
            applyUrl: row.url,
          };
        });

        setScholarships(mapped);
        setLoadError("");
      })
      .catch((err) => {
        if (alive) {
          setScholarships([]);
          setLoadError(err?.message || "Unable to load scholarships data");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => scholarships.filter((s) => (activeFilter === "All" ? true : s.category === activeFilter)),
    [activeFilter, scholarships]
  );

  const visibleItems = useMemo(() => (showAll ? filtered : filtered.slice(0, maxItems)), [filtered, maxItems, showAll]);

  const canViewMore = showViewMore && !showAll && filtered.length > maxItems;

  return (
    <>
      <style>{SECTION_CSS}</style>

      <section id="scholarships" className="sch-section">
        <div className="sch-section-inner">
          <div className="sec-label">Phase_03 // Scholarships</div>

          <div className="sch-header">
            <div>
              {showAll && (
                <button className="btn-ghost" style={{ marginBottom: ".85rem" }} onClick={() => setShowAll(false)}>
                  Back to Home
                </button>
              )}
              <h2 className="sch-h2">{showAll ? "All Scholarships" : "Fund your education."}</h2>
              <p className="sch-sub">
                {showAll
                  ? "Browse the complete scholarship dataset from your scraper."
                  : "Live scholarship cards generated from your scholarships JSON dataset."}
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

          <div className="sch-stats4">
            {[
              { val: filtered.length.toLocaleString(), lbl: "Active Scholarships" },
              { val: `${new Set(filtered.map((s) => s.provider)).size}`, lbl: "Providers" },
              { val: `${new Set(filtered.map((s) => s.category)).size}`, lbl: "Categories" },
              { val: `${filtered.filter((s) => s.urgent).length}`, lbl: "Closing Soon" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="stat-box">
                <div className="stat-val">{val}</div>
                <div className="stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          <div className="sch-grid">
            {loading && <div className="mono" style={{ color: "var(--muted)" }}>Loading scholarships...</div>}

            {!loading && loadError && <div className="mono" style={{ color: "var(--red)" }}>{loadError}</div>}

            {!loading && !loadError && visibleItems.length > 0 &&
              visibleItems.map((s) => (
                <ScholarshipCard
                  key={s.id}
                  {...s}
                  onApply={() => window.open(s.applyUrl, "_blank", "noopener,noreferrer")}
                />
              ))}

            {!loading && !loadError && visibleItems.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem", color: "var(--dim)" }}>
                <div className="mono" style={{ fontSize: ".75rem", marginBottom: ".5rem" }}>No scholarships found</div>
                <button className="fpill" onClick={() => setActiveFilter("All")}>Clear filter</button>
              </div>
            )}
          </div>

          <div className="sch-load-more">
            {canViewMore ? (
              <button className="btn-ghost" onClick={() => setShowAll(true)}>View More Scholarships {'->'}</button>
            ) : (
              <button className="btn-ghost">Loaded from JSON dataset</button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
