// src/pages/Home.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

/* ---------------- Live feed (inline) ---------------- */

function LiveComplianceFeed({ limit = 8 }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API}/news?limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load news");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [limit]);

  return (
    <aside className="feed">
      <div className="feed-head">
        <h3>Live Compliance Feed</h3>
        <Link className="feed-more" to="/news">More →</Link>
      </div>

      <div className="feed-list">
        {loading && <div className="feed-muted">Loading…</div>}
        {err && <div className="feed-error">Error: {err}</div>}
        {!loading && !err && items.length === 0 && (
          <div className="feed-muted">No items right now.</div>
        )}

        {items.map((it, i) => (
          <a
            key={i}
            className="feed-item"
            href={it.link || "#"}
            target="_blank"
            rel="noreferrer"
          >
            <span className="feed-source">{it.source || "Update"}</span>
            <span className="feed-title">{it.title || "Untitled"}</span>
            {it.date && <span className="feed-date">{it.date}</span>}
          </a>
        ))}
      </div>
    </aside>
  );
}

/* ---------------- Home page ---------------- */

export default function Home() {
  const chips = useMemo(
    () => [
      "Samples for HCPs",
      "Drinks at meetings",
      "Giveaways & gifts",
      "Sponsorship & grants",
      "Digital & social",
    ],
    []
  );

  return (
    <div className="home-wrap">
      {/* Intro */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">Compliance AI</h1>
          <p className="hero-sub">
            A friendly AI teammate for quick, clause-aware answers across ABPI, EFPIA, IFPMA
            and local country codes. Ask in everyday language and get a clear answer with the
            exact clause it relies on.
          </p>

          {/* Small, punchy CTAs */}
          <div className="cta-row">
            <Link className="btn btn-primary" to="/askcai">Ask CAI</Link>
            <Link className="btn" to="/global">Global Comparator</Link>
            <Link className="btn" to="/pmcpa">PMCPA Case Search</Link>
            <Link className="btn" to="/dashboard">Dashboard</Link>
          </div>

          {/* Tip of the day */}
          <div className="tip">
            <div className="tip-dot" />
            <div className="tip-body">
              <div className="tip-label">Tip of the day</div>
              <p className="tip-text">
                <strong>Samples</strong> must be limited, clearly marked “sample – not for sale”, and
                tracked. They’re only for HCPs qualified to prescribe and must not be supplied for
                patient stock or long-term treatment. Requests should be unsolicited, documented,
                and limited in frequency and quantity.
              </p>
              <div className="tip-foot">
                Source: ABPI Code of Practice 2024 — Clause 17 (Samples)
              </div>
            </div>
          </div>

          {/* Popular searches */}
          <div className="popular-searches">
            <h4>Popular searches (click to try)</h4>
            <div className="chips">
              {chips.map((label) => (
                <Link
                  key={label}
                  className="chip"
                  to={`/askcai?prefill=${encodeURIComponent(label)}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* How it helps (3-up cards) */}
          <div className="how-grid">
            <div className="how-card">
              <div className="how-title">Ask</div>
              <div className="how-text">
                Type it like you’d say it. CAI answers with the clause.
              </div>
            </div>
            <div className="how-card">
              <div className="how-title">Compare</div>
              <div className="how-text">
                Switch to EFPIA, IFPMA, or a country PDF on the Ask CAI page.
              </div>
            </div>
            <div className="how-card">
              <div className="how-title">Learn</div>
              <div className="how-text">
                See similar PMCPA cases to avoid repeat issues.
              </div>
            </div>
          </div>

          {/* Role cards */}
          <div className="role-grid">
            <div className="role-card">
              <div className="role-title">For MSLs</div>
              <div className="role-text">
                Fast “can I say/do this?” with exact clauses for notes.
              </div>
              <div className="role-actions">
                <Link className="btn btn-soft" to="/askcai">Ask CAI</Link>
                <Link className="btn btn-soft" to="/global">Relevant cases</Link>
              </div>
            </div>

            <div className="role-card">
              <div className="role-title">For Commercial</div>
              <div className="role-text">
                Validate claims & meetings. Check gifts, hospitality & digital.
              </div>
              <div className="role-actions">
                <Link className="btn btn-soft" to="/askcai">Ask CAI</Link>
                <Link className="btn btn-soft" to="/pmcpa">Case search</Link>
                <Link className="btn btn-soft" to="/dashboard">Dashboard</Link>
              </div>
            </div>

            <div className="role-card">
              <div className="role-title">For KAMs</div>
              <div className="role-text">
                Plan compliant events. See country limits & latest rulings.
              </div>
              <div className="role-actions">
                <Link className="btn btn-soft" to="/askcai">Ask CAI</Link>
                <Link className="btn btn-soft" to="/global">Country limits</Link>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <footer className="disclaimer">
            Compliance AI helps interpret and navigate codes. It doesn’t replace local SOPs,
            medical/legal review, or legal/regulatory advice.
          </footer>
        </div>

        {/* Right column: Live feed */}
        <div className="hero-right">
          <LiveComplianceFeed limit={8} />
        </div>
      </section>
    </div>
  );
}
