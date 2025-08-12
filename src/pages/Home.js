import React, { useEffect, useState } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

export default function Home() {
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await fetch(`${API}/news?limit=10`);
        const j = await r.json().catch(() => ({}));
        if (live) setFeed(Array.isArray(j.items) ? j.items : (j.news || []));
      } catch { /* noop */ }
      finally { if (live) setLoadingFeed(false); }
    })();
    return () => (live = false);
  }, []);

  return (
    <div className="home shell">
      <div className="cols">
        {/* Left column: hero + quick actions */}
        <section className="hero card">
          <div className="hero-top">
            <h1>Ask CAI</h1>
            <p className="kicker">Clause-aware answers for ABPI, EFPIA, IFPMA and local codes — fast.</p>
          </div>

          <ul className="mini-points">
            <li>Plain-English answers with <strong>clause cites</strong> (≤350 words)</li>
            <li>Point at any official code PDF (no copy/paste)</li>
            <li>Pulls <strong>relevant PMCPA cases</strong></li>
          </ul>

          <div className="actions">
            <Link className="chip chip--primary" to="/askcai">Open Ask CAI</Link>
            <Link className="chip" to="/global-comparator">Global Comparator</Link>
            <Link className="chip" to="/pmcpa">PMCPA Case Search</Link>
            <Link className="chip" to="/dashboard">Dashboard</Link>
          </div>

          <div className="hints">
            <div className="hint">
              <div className="hint-h">Field use</div>
              <div className="hint-b">Quick checks for samples, hospitality, meetings, digital.</div>
            </div>
            <div className="hint">
              <div className="hint-h">How to ask</div>
              <div className="hint-b">“Can I provide drinks at a lunch & learn?” — CAI answers with the clause.</div>
            </div>
          </div>
        </section>

        {/* Right column: live feed (sticky) */}
        <aside className="feed card">
          <div className="feed-head">
            <div className="feed-title">Live Compliance Feed</div>
            <Link to="/news" className="feed-more">More →</Link>
          </div>

          {loadingFeed ? (
            <div className="feed-empty muted">Loading updates…</div>
          ) : (feed.length === 0 ? (
            <div className="feed-empty muted">No recent items.</div>
          ) : (
            <ul className="feed-list">
              {feed.slice(0, 8).map((n, i) => (
                <li key={i} className="feed-item">
                  <a className="feed-link" href={n.url || n.link} target="_blank" rel="noreferrer">
                    <div className="feed-meta">
                      <span className="dot" /> {n.source || "Update"}
                    </div>
                    <div className="feed-titleline">{n.title || "Update"}</div>
                    {n.published_at && (
                      <div className="feed-time">
                        {new Date(n.published_at).toLocaleDateString()} · {new Date(n.published_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </aside>
      </div>

      {/* Role tiles: compact, still above fold on most laptops */}
      <section className="tiles">
        <div className="tile card">
          <div className="tile-h">For MSLs</div>
          <p>Fast “can I say/do this?” with exact clauses for notes.</p>
          <div className="tile-actions">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/global-comparator" className="chip">Compare codes</Link>
            <Link to="/pmcpa" className="chip">Relevant cases</Link>
          </div>
        </div>
        <div className="tile card">
          <div className="tile-h">For Commercial</div>
          <p>Validate claims & meetings. Check gifts, hospitality & digital.</p>
          <div className="tile-actions">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/pmcpa" className="chip">Case search</Link>
            <Link to="/dashboard" className="chip">Dashboard</Link>
          </div>
        </div>
        <div className="tile card">
          <div className="tile-h">For KAMs</div>
          <p>Plan compliant events. See country limits & latest rulings.</p>
          <div className="tile-actions">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/global-comparator" className="chip">Country limits</Link>
            <Link to="/pmcpa" className="chip">Relevant cases</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
