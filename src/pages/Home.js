import React, { useEffect, useState } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const RAW =
  process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

export default function Home() {
  // --- Live feed ---
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/news?limit=10`, { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!isMounted) return;
        const items =
          data.items || data.news || []; // defensive for older shapes
        setFeed(Array.isArray(items) ? items : []);
      } catch {
        setFeed([]);
      } finally {
        if (isMounted) setLoadingFeed(false);
      }
    })();
    return () => (isMounted = false);
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero card">
        <div className="hero-copy">
          <h1>Ask CAI</h1>
          <p className="sub">
            A friendly AI teammate for quick, clause-aware answers across ABPI,
            EFPIA, IFPMA and local country codes.
          </p>

          <ul className="bullets">
            <li>Answers in plain English with clause references</li>
            <li>Point CAI at any official code PDF—no copy/paste</li>
            <li>See related PMCPA cases to avoid repeat issues</li>
            <li>Perfect for fast field checks: samples, hospitality, meetings, digital</li>
          </ul>

          <div className="cta">
            <Link className="btn btn-primary" to="/askcai">Open Ask CAI</Link>
            <Link className="btn" to="/global-comparator">Global Comparator</Link>
            <Link className="btn" to="/pmcpa">PMCPA Case Search</Link>
            <Link className="btn" to="/dashboard">Compliance Dashboard</Link>
          </div>

          <div className="note">
            Tip: Ask in everyday language—“Can I provide drinks at a lunch & learn?” CAI will answer with the clause it used.
          </div>
        </div>

        <div className="hero-side">
          <div className="tile">
            <div className="tile-h">How it helps in the field</div>
            <div className="tile-b">
              Quick pre-call checks, instant clause cites, and a link to read the
              exact wording. No more scrolling PDFs on the pavement outside.
            </div>
          </div>
          <div className="tile">
            <div className="tile-h">Works with your codes</div>
            <div className="tile-b">
              ABPI by default, but you can switch to EFPIA, IFPMA, or upload a
              country code PDF on the Ask CAI page.
            </div>
          </div>
        </div>
      </section>

      {/* Live feed */}
      <section className="feed card">
        <div className="feed-head">
          <div className="feed-title">Live Compliance Feed</div>
          <Link to="/news" className="feed-more">See more →</Link>
        </div>

        {loadingFeed ? (
          <div className="feed-empty muted">Loading the latest…</div>
        ) : feed.length === 0 ? (
          <div className="feed-empty muted">No recent updates.</div>
        ) : (
          <ul className="feed-list">
            {feed.slice(0, 6).map((n, i) => (
              <li key={i} className="feed-item">
                <a
                  className="feed-link"
                  href={n.url || n.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="feed-source">{n.source || "Update"}</div>
                  <div className="feed-titleline">{n.title || "Update"}</div>
                  {n.published_at && (
                    <div className="feed-time">
                      {new Date(n.published_at).toLocaleString()}
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Role cards */}
      <section className="grid">
        <div className="card">
          <div className="card-h">For MSLs</div>
          <p>
            Fast “can I say/do this?” checks. Compare EU wording, and cite the
            exact clause in your notes.
          </p>
          <div className="chips">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/global-comparator" className="chip">Global Comparator</Link>
            <Link to="/pmcpa" className="chip">Relevant cases</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-h">For Commercial / Marketing</div>
          <p>
            Validate claims, materials, and meetings quickly. Sanity-check gifts,
            hospitality, and digital use before you brief.
          </p>
          <div className="chips">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/pmcpa" className="chip">PMCPA Case Search</Link>
            <Link to="/dashboard" className="chip">Dashboard</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-h">For KAMs</div>
          <p>
            Plan compliant engagements. See local sponsorship & meeting limits,
            plus recent rulings that affect field activity.
          </p>
          <div className="chips">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/global-comparator" className="chip">Country limits</Link>
            <Link to="/pmcpa" className="chip">Relevant cases</Link>
          </div>
        </div>
      </section>

      {/* What’s inside */}
      <section className="grid">
        <div className="card">
          <div className="card-h">Ask CAI</div>
          <p>Ask in plain English—CAI finds and cites the clause for you.</p>
          <Link className="link" to="/askcai">Open Ask CAI →</Link>
        </div>

        <div className="card">
          <div className="card-h">Global Comparator</div>
          <p>Compare code text for gifts, hospitality, samples, and more.</p>
          <Link className="link" to="/global-comparator">Compare codes →</Link>
        </div>

        <div className="card">
          <div className="card-h">PMCPA Case Search</div>
          <p>Find similar claims and outcomes to avoid repeat findings.</p>
          <Link className="link" to="/pmcpa">Search cases →</Link>
        </div>

        <div className="card">
          <div className="card-h">Compliance Dashboard</div>
          <p>Monitor updates and risk signals with clear, simple charts.</p>
          <Link className="link" to="/dashboard">View dashboard →</Link>
        </div>
      </section>
    </div>
  );
}
