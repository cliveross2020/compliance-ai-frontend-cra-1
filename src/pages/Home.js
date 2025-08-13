import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const API_ROOT =
  process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com/api";

export default function Home() {
  const navigate = useNavigate();

  // Live feed
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);

  // Tip of the day (simple local rotation; swap to backend later if you like)
  const tips = useMemo(
    () => [
      "Promotional aids are not permitted (ABPI 10). Consider educational items instead.",
      "Certification must be completed before dissemination (ABPI 8).",
      "Hospitality must be secondary to the main purpose and not excessive (ABPI 10).",
      "Samples must be limited, clearly marked, and tracked (ABPI 17).",
      "Digital content must avoid off-label implications (ABPI 11/12).",
    ],
    []
  );
  const [tip, setTip] = useState(tips[0]);

  useEffect(() => {
    const ix = new Date().getDate() % tips.length;
    setTip(tips[ix]);
  }, [tips]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setFeedLoading(true);
        setFeedError(null);
        const res = await fetch(`${API_ROOT}/news?limit=10`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setFeedItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setFeedError(e.message || "Failed to load news");
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    }
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Popular checks → prefill Ask CAI page
  const quickAsk = (q) => navigate(`/askcai?q=${encodeURIComponent(q)}`);

  return (
    <div className="home compact">
      {/* Top row: Left (intro + tip + actions) | Right (news) */}
      <section className="hero-row">
        <div className="hero-stack">
          <div className="intro">
            <h1>Compliance AI</h1>
            <p className="intro-copy">
              Practical, up-to-date pharma compliance guidance for field teams—so MSLs,
              Commercial and KAMs can move fast <em>and</em> stay on-label.
            </p>
          </div>

          <div className="tip-card" role="note" aria-label="Tip of the day">
            <div className="tip-dot" />
            <div className="tip-body">
              <div className="tip-title">Tip of the day</div>
              <div className="tip-text">{tip}</div>
            </div>
          </div>

          <div className="cta-row">
            <button className="btn btn-primary" onClick={() => navigate("/askcai")}>
              Ask CAI
            </button>
            <Link className="btn btn-secondary" to="/comparator">
              Global Comparator
            </Link>
            <Link className="btn btn-outline" to="/cases">
              PMCPA Case Search
            </Link>
          </div>

          <div className="chips">
            <button className="chip" onClick={() => quickAsk("Are gifts to HCPs allowed?")}>
              Gifts & hospitality
            </button>
            <button className="chip" onClick={() => quickAsk("Can I sponsor a meeting with HCPs?")}>
              Meetings & sponsorship
            </button>
            <button className="chip" onClick={() => quickAsk("What are the rules for samples?")}>
              Samples
            </button>
            <button className="chip" onClick={() => quickAsk("What is required for certification?")}>
              Certification
            </button>
            <button className="chip" onClick={() => quickAsk("What are digital channel do’s & don’ts?")}>
              Digital channels
            </button>
          </div>
        </div>

        <aside className="feed-card">
          <div className="feed-head">
            <h3>Live compliance feed</h3>
            <Link to="/news" className="feed-more">
              See more →
            </Link>
          </div>
          {feedLoading && <div className="feed-loading">Loading…</div>}
          {feedError && <div className="feed-error">Couldn’t load news.</div>}
          {!feedLoading && !feedError && (
            <ul className="feed-list">
              {feedItems.map((item, i) => (
                <li className="feed-item" key={`${item.url || i}-${i}`}>
                  <div className="feed-top">
                    <span className="feed-source">{item.source || "Source"}</span>
                    <span className="feed-time">
                      {(item.published || "").replace("T", " ").slice(0, 16)}
                    </span>
                  </div>
                  <a
                    className="feed-text"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    title={item.title}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
              {feedItems.length === 0 && (
                <li className="feed-item">
                  <span className="feed-text">No items right now.</span>
                </li>
              )}
            </ul>
          )}
        </aside>
      </section>

      {/* Bottom row: three compact cards */}
      <section className="cards-row">
        <Link to="/askcai" className="mini-card">
          <h4>Ask CAI</h4>
          <p>Clause-aware answers with citations, tailored to your question.</p>
        </Link>
        <Link to="/comparator" className="mini-card">
          <h4>Global Comparator</h4>
          <p>Compare country rules on gifts, hospitality, and samples.</p>
        </Link>
        <Link to="/cases" className="mini-card">
          <h4>PMCPA Case Search</h4>
          <p>Learn from recent rulings and avoid repeat findings.</p>
        </Link>
      </section>
    </div>
  );
}
