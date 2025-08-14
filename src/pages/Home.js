// src/pages/Home.js
import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

const POPULAR = [
  "Samples for HCPs",
  "Drinks at meetings",
  "Giveaways & gifts",
  "Sponsorship & grants",
  "Digital & social",
];

export default function Home() {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [errNews, setErrNews] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingNews(true);
        const res = await fetch(`${API}/news?limit=10`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setNews(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (mounted) setErrNews(e.message || "Failed to load news");
      } finally {
        if (mounted) setLoadingNews(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const pills = useMemo(
    () =>
      POPULAR.map((label) => ({
        label,
        href: `#/askcai?q=${encodeURIComponent(label)}`, // <-- prefill Ask CAI
      })),
    []
  );

  return (
    <div className="home-wrap">
      <div className="hero">
        {/* LEFT: Ask / Compare / Learn + chips + tip */}
        <section className="hero-left">
          <h1 className="hero-title">Compliance AI</h1>
          <p className="hero-sub">
            A friendly AI teammate for quick, clause-aware answers across ABPI, EFPIA, IFPMA and
            local country codes. Ask in everyday language and get a clear answer with the exact
            clause it relies on.
          </p>

          {/* Tip of the day */}
          <div className="tip">
            <span className="tip-dot" />
            <div className="tip-body">
              <div className="tip-label">Tip of the day</div>
              <p className="tip-text">
                <strong>Samples</strong> must be limited, clearly marked “sample – not for sale”, and
                tracked. They’re only for HCPs qualified to prescribe and must not be supplied for
                patient stock or long-term treatment. Requests should be unsolicited, documented, and
                limited in frequency and quantity.
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
              {pills.map((p, i) => (
                <a key={i} className="chip" href={p.href}>
                  {p.label}
                </a>
              ))}
            </div>
          </div>

          {/* Ask / Compare / Learn row */}
          <div className="how-grid">
            <div className="how-card">
              <div className="how-title">Ask</div>
              <div className="how-text">
                Type it like you’d say it. CAI answers with the clause.
              </div>
              <div className="role-actions">
                <a className="btn btn-primary" href="#/askcai">Open Ask CAI</a>
              </div>
            </div>

            <div className="how-card">
              <div className="how-title">Compare</div>
              <div className="how-text">
                Switch to EFPIA, IFPMA, or a country PDF on the Ask CAI page.
              </div>
              <div className="role-actions">
                <a className="btn" href="#/global-comparator">Global Comparator</a>
              </div>
            </div>

            <div className="how-card">
              <div className="how-title">Learn</div>
              <div className="how-text">
                See similar PMCPA cases to avoid repeat issues.
              </div>
              <div className="role-actions">
                <a className="btn" href="#/pmcpa-cases">PMCPA case search</a>
                <a className="btn btn-soft" href="#/dashboard">Dashboard</a>
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
                <a className="btn btn-primary" href="#/askcai">Ask CAI</a>
                <a className="btn" href="#/pmcpa-cases">Relevant cases</a>
              </div>
            </div>

            <div className="role-card">
              <div className="role-title">For Commercial</div>
              <div className="role-text">
                Validate claims &amp; meetings. Check gifts, hospitality &amp; digital.
              </div>
              <div className="role-actions">
                <a className="btn btn-primary" href="#/askcai">Ask CAI</a>
                <a className="btn" href="#/pmcpa-cases">Case search</a>
                <a className="btn btn-soft" href="#/dashboard">Dashboard</a>
              </div>
            </div>

            <div className="role-card">
              <div className="role-title">For KAMs</div>
              <div className="role-text">
                Plan compliant events. See country limits &amp; latest rulings.
              </div>
              <div className="role-actions">
                <a className="btn btn-primary" href="#/askcai">Ask CAI</a>
                <a className="btn" href="#/global-comparator">Country limits</a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            Always verify with local SOPs and medical/legal guidance. This tool accelerates decisions—
            it doesn’t replace governance.
          </div>
        </section>

        {/* RIGHT: Live feed + placeholder card */}
        <aside className="hero-right">
          <div className="feed">
            <div className="feed-head">
              <h3>Live Compliance Feed</h3>
              <a className="feed-more" href="#/news">More →</a>
            </div>

            {loadingNews && <div className="feed-list"><div className="feed-item">Loading…</div></div>}
            {errNews && <div className="feed-list"><div className="feed-item">Error: {errNews}</div></div>}

            {!loadingNews && !errNews && (
              <div className="feed-list">
                {news.map((n, i) => (
                  <a
                    key={i}
                    className="feed-item"
                    href={n.url || "#/news"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="feed-source">{n.source || "Update"}</div>
                    <div className="feed-title">{n.title || "News item"}</div>
                    {n.date && <div className="feed-date">{n.date}</div>}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Small placeholder box underneath feed (you can swap content later) */}
          <div className="side-cta">
            <div className="side-cta-title">Quick links</div>
            <div className="side-cta-body">
              <a className="chip" href="#/askcai?q=Hospitality rules">Hospitality rules</a>
              <a className="chip" href="#/askcai?q=Country sponsorship limits">Country limits</a>
              <a className="chip" href="#/pmcpa-cases">Recent PMCPA cases</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
