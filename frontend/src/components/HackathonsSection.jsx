import { useEffect, useMemo, useState } from "react";
import HackathonCard from "./HackathonCard";

const SECTION_CSS = `
  .hack-section {
    padding: 6rem 0;
    background: var(--bg);
    border-top: 1px solid var(--border);
  }
  .hack-section-inner { max-width: 84rem; margin: 0 auto; padding: 0 1.5rem; }
  .hack-header {
    display: flex; justify-content: space-between;
    align-items: flex-end; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap;
  }
  .hack-h2 {
    font-size: clamp(2rem, 4vw, 3rem); font-weight: 600;
    letter-spacing: -.04em; color: var(--text); line-height: 1.1;
  }
  .hack-sub { color: var(--muted); margin-top: .75rem; max-width: 32rem; line-height: 1.6; }
  .hack-filters { display: flex; gap: .5rem; flex-wrap: wrap; }
  .hack-stats-bar {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
    margin-bottom: 3rem;
    border: 1px solid var(--border); background: var(--surface);
    padding: 1.25rem;
    clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);
  }
  .hack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  .hack-load-more { text-align: center; margin-top: 2.5rem; }
  @media (max-width: 900px) {
    .hack-stats-bar { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .hack-header { flex-direction: column; align-items: flex-start; }
    .hack-grid   { grid-template-columns: 1fr; }
  }
`;

const FILTERS = ["All", "Online", "Offline", "Beginner", "Advanced"];

const parseParticipants = (value = "") => {
  const match = String(value).replace(/,/g, "").match(/(\d+)\s*participants?/i);
  return match ? Number(match[1]) : 0;
};

const parseMode = (location = "", raw = "") => {
  const text = `${location} ${raw}`.toLowerCase();
  if (text.includes("hybrid")) return "hybrid";
  if (text.includes("online") || text.includes("virtual")) return "online";
  return "offline";
};

const mapDifficulty = (themes = "", raw = "") => {
  const text = `${themes} ${raw}`.toLowerCase();
  if (text.includes("beginner")) return "Beginner";
  if (text.includes("advanced")) return "Advanced";
  return "Intermediate";
};

const inferOrganizer = (url = "") => {
  try {
    const host = new URL(url).hostname;
    if (host.includes("devpost")) return "Devpost";
    if (host.includes("devfolio")) return "Devfolio";
  } catch {
    return "Unknown";
  }
  return "Unknown";
};

export default function HackathonsSection({
  maxItems = 10,
  showViewMore = true,
  onViewMore,
  isFullPage = false,
  onBack,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [localFullPage, setLocalFullPage] = useState(false);

  useEffect(() => {
    let alive = true;

    const jsonUrl = `${import.meta.env.BASE_URL}hackathons.json`;

    fetch(jsonUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Failed to load ${jsonUrl} (${r.status})`))))
      .then((rows) => {
        if (!alive || !Array.isArray(rows)) return;

        const mapped = rows.map((row, idx) => {
          const registered = parseParticipants(row.participants);
          return {
            id: row.url || `${row.name}-${idx}`,
            title: row.name || "Untitled Hackathon",
            organizer: inferOrganizer(row.url),
            prize: row.prize || "TBA",
            date: row.dates || "TBA",
            location: row.location || "Online",
            mode: parseMode(row.location, row.raw),
            teamSize: "1-4 Members",
            difficulty: mapDifficulty(row.themes, row.raw),
            tags: String(row.themes || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 5),
            deadline: row.status || "TBA",
            registered,
            capacity: registered > 0 ? Math.ceil(registered * 1.35) : 0,
            logo: row.image || (row.source === "devfolio" ? "DF" : "DP"),
            featured: idx < 6,
            applyUrl: row.url,
          };
        });

        setHackathons(mapped);
        setLoadError("");
      })
      .catch((err) => {
        if (alive) {
          setHackathons([]);
          setLoadError(err?.message || "Unable to load hackathons data");
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => hackathons.filter((h) => {
    if (activeFilter === "All")      return true;
    if (activeFilter === "Online")   return h.mode === "online";
    if (activeFilter === "Offline")  return h.mode === "offline";
    if (activeFilter === "Beginner") return h.difficulty === "Beginner";
    if (activeFilter === "Advanced") return h.difficulty === "Advanced";
    return true;
  }), [activeFilter, hackathons]);

  const totalPrize = useMemo(() => {
    const sum = filtered.reduce((acc, h) => {
      const m = String(h.prize).replace(/,/g, "").match(/(?:\u20B9|rs\.?|inr|\$)\s*(\d+)/i);
      return acc + (m ? Number(m[1]) : 0);
    }, 0);
    return sum > 0 ? sum.toLocaleString() : "N/A";
  }, [filtered]);

  const totalParticipants = useMemo(
    () => filtered.reduce((acc, h) => acc + (Number(h.registered) || 0), 0),
    [filtered]
  );
  const fullMode = isFullPage || localFullPage;
  const visibleHackathons = useMemo(
    () => (fullMode ? filtered : (typeof maxItems === "number" ? filtered.slice(0, maxItems) : filtered)),
    [filtered, maxItems, fullMode]
  );
  const hasMore = !fullMode && typeof maxItems === "number" && filtered.length > maxItems;

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore();
      return;
    }
    setLocalFullPage(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    setLocalFullPage(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{SECTION_CSS}</style>

      <section id={fullMode ? "all-hackathons" : "hackathons"} className="hack-section">
        <div className="hack-section-inner">
          <div className="sec-label">Phase_01 // Hackathons</div>

          <div className="hack-header">
            <div>
              {fullMode && (
                <button className="btn-ghost" style={{ marginBottom: ".85rem" }} onClick={handleBack}>
                  Back to Home
                </button>
              )}
              <h2 className="hack-h2">{fullMode ? "All Hackathons" : "Compete. Build. Win."}</h2>
              <p className="hack-sub">
                {fullMode
                  ? "Browse the complete hackathon dataset."
                  : "Live hackathons from your scraped dataset. Filter by mode and level."}
              </p>
            </div>
            <div className="hack-filters">
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

          <div className="hack-stats-bar">
            {[
              { val: String(filtered.length), lbl: "Live Hackathons" },
              { val: totalPrize === "N/A" ? "N/A" : `~${totalPrize}`, lbl: "Total Prize Money" },
              { val: String(new Set(filtered.map((h) => h.location)).size), lbl: "Locations Covered" },
              { val: totalParticipants.toLocaleString(), lbl: "Participants" },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div className="stat-val">{val}</div>
                <div className="stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          <div className="hack-grid">
            {loading && (
              <div className="mono" style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                Loading hackathons...
              </div>
            )}

            {!loading && loadError && (
              <div className="mono" style={{ color: "var(--red)", fontSize: ".8rem" }}>
                {loadError}
              </div>
            )}

            {!loading && !loadError && filtered.length === 0 && (
              <div className="mono" style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                No hackathons found for the selected filter.
              </div>
            )}

            {!loading && !loadError && visibleHackathons.map((h) => (
              <HackathonCard
                key={h.id}
                {...h}
                onApply={() => window.open(h.applyUrl, "_blank", "noopener,noreferrer")}
              />
            ))}
          </div>

          <div className="hack-load-more">
            {showViewMore && hasMore ? (
              <button className="btn-ghost" onClick={handleViewMore}>
                View More Hackathons {'->'}
              </button>
            ) : (
              <button className="btn-ghost">Loaded from JSON dataset</button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
