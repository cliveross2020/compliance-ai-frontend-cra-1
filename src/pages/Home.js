import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import caiLogo from "../assets/cai-logo.png";

/** Backend root for the live feed */
const API_ROOT =
  process.env.REACT_APP_API_ROOT ||
  "https://compliance-ai-app.onrender.com/api";

export default function Home() {
  // Live feed state
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setFeedLoading(true);
        setFeedError(null);
        const res = await fetch(`${API_ROOT}/news?limit=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setFeedItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (e) {
        if (!cancelled) setFeedError(e.message || "Failed to load news");
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    }

    load();
    const id = setInterval(load, 15 * 60 * 1000); // refresh every 15 min
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <img src={caiLogo} alt="Compliance AI" className="hero-logo" />
          <h1>Compliance AI</h1>
          <p className="tagline">
            Practical, up-to-date pharma compliance guidance—so MSLs, Commercial teams,
            and KAMs can move fast <em>and</em> stay on-label.
          </p>

          <div className="hero-ctas">
            <Link to="/askcai" className="btn btn-primary">AskCAI</Link>
            <Link to="/abpi" className="btn btn-secondary">ABPI Search</Link>
            <Link to="/cases" className="btn btn-outline">PMCPA Case Search</Link>
          </div>

          <ul className="hero-points">
            <li>Ask me anything about the latest ABPI code</li>
            <li>Instant clause lookup across ABPI & EFPIA</li>
            <li>Learn from PMCPA precedent to avoid repeat findings</li>
          </ul>
        </div>

        {/* Live Compliance Feed */}
        <aside className="hero-right">
          <h3 className="feed-title">Live Compliance Feed</h3>

          {feedLoading && <div className="feed-loading">Loading…</div>}
          {feedError && <div className="feed-error">Couldn’t load news.</div>}

          {!feedLoading && !feedError && (
            <>
              <ul className="feed-list">
                {feedItems.map((item, i) => (
                  <li className="feed-item" key={`${item.url || i}-${i}`}>
                    <span className="feed-source">{item.source || "Source"}</span>
                    <a
                      className="feed-text"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      title={item.title}
                    >
                      {item.title}
                    </a>
                    <span className="feed-time">
                      {(item.published || "").replace("T", " ").slice(0, 16)}
                    </span>
                  </li>
                ))}
                {feedItems.length === 0 && (
                  <li className="feed-item">
                    <span className="feed-text">No items right now.</span>
                  </li>
                )}
              </ul>
              <div className="feed-footer">
                <Link to="/news">See more →</Link>
              </div>
            </>
          )}
        </aside>
      </section>

      {/* Role-based value props */}
      <section className="roles">
        <div className="role-card">
          <h3>For MSLs</h3>
          <p>
            Answer “can I say/do this?” in seconds. Search ABPI wording, compare EU codes,
            and pull case examples to support scientific exchange without promotional drift.
          </p>
          <div className="role-links">
            <Link to="/abpi" className="chip">ABPI Search</Link>
            <Link to="/comparator" className="chip">Global Comparator</Link>
            <Link to="/askcai" className="chip">AskCAI</Link>
          </div>
        </div>

        <div className="role-card">
          <h3>For Commercial / Marketing</h3>
          <p>
            Validate claims, materials, and meetings quickly. Check gifts,
            hospitality and digital channel rules before you brief or publish.
          </p>
          <div className="role-links">
            <Link to="/abpi" className="chip">ABPI Search</Link>
            <Link to="/comparator" className="chip">Hospitality rules</Link>
            <Link to="/cases" className="chip">PMCPA Case Search</Link>
          </div>
        </div>

        <div className="role-card">
          <h3>For KAMs</h3>
          <p>
            Plan compliant engagements. See local sponsorship & meeting limits,
            and learn from recent rulings that affect field activity.
          </p>
          <div className="role-links">
            <Link to="/comparator" className="chip">Country limits</Link>
            <Link to="/cases" className="chip">Relevant cases</Link>
            <Link to="/askcai" className="chip">AskCAI</Link>
          </div>
        </div>
      </section>

      {/* What’s inside */}
      <section className="inside">
        <h2>What’s inside</h2>
        <div className="inside-grid">
          <Link to="/askcai" className="inside-card">
            <h4>AskCAI</h4>
            <p>Ask in plain English—get clause-aware answers with citations.</p>
          </Link>
          <Link to="/abpi" className="inside-card">
            <h4>ABPI Search</h4>
            <p>Direct clause search with filters—get the exact wording, fast.</p>
          </Link>
          <Link to="/comparator" className="inside-card">
            <h4>Global Comparator</h4>
            <p>Compare live text from country codes for gifts, hospitality, samples.</p>
          </Link>
          <Link to="/cases" className="inside-card">
            <h4>PMCPA Case Search</h4>
            <p>Learn from precedent: similar claims, outcomes, and reasoning.</p>
          </Link>
          <Link to="/dashboard" className="inside-card">
            <h4>Compliance Dashboard</h4>
            <p>Monitor updates, policies, and risk signals in one place.</p>
          </Link>
        </div>
      </section>

      {/* Footer note */}
      <section className="footnote">
        <p>
          Always verify local SOPs and medical/legal guidance. This tool accelerates
          decisions—it doesn’t replace governance.
        </p>
      </section>
    </div>
  );
}
