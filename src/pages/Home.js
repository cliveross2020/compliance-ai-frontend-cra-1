import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import caiLogo from "../assets/cai-logo.png";

const API_ROOT =
  process.env.REACT_APP_API_ROOT ||
  "https://compliance-ai-app.onrender.com/api";

export default function Home() {
  // Live feed
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
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
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="homeV2">
      {/* Hero */}
      <section className="heroV2">
        <div className="heroContent">
          <div className="brandRow">
            <img src={caiLogo} alt="Compliance AI" className="brandLogo" />
            <h1 className="brandTitle">Compliance AI</h1>
          </div>

          <p className="taglineV2">
            Practical, up-to-date pharma compliance guidance—so MSLs, Commercial teams,
            and KAMs can move fast <em>and</em> stay on-label.
          </p>

          <div className="ctaRow">
            <Link to="/abpi" className="btnV2 primary">ABPI Search</Link>
            <Link to="/comparator" className="btnV2 ghost">Global Comparator</Link>
            <Link to="/cases" className="btnV2 outline">PMCPA Case Search</Link>
          </div>

          <ul className="valueBullets">
            <li>Instant clause lookup across ABPI & EFPIA</li>
            <li>Country comparisons with live PDF/Doc extraction</li>
            <li>Avoid repeat findings with PMCPA precedent</li>
          </ul>
        </div>

        <aside className="feedCard">
          <div className="feedHeader">
            <h3>Live Compliance Feed</h3>
            <Link to="/dashboard" className="feedMore">See more →</Link>
          </div>

          {feedLoading && <div className="feedState">Loading…</div>}
          {feedError && <div className="feedState error">Couldn’t load news.</div>}

          {!feedLoading && !feedError && (
            <ul className="feedList">
              {feedItems.map((item, i) => (
                <li className="feedItem" key={`${item.url || i}-${i}`}>
                  <div className="feedMeta">
                    <span className="feedSource">{item.source || "Source"}</span>
                    <span className="feedTime">
                      {(item.published || "").replace("T", " ").slice(0, 16)}
                    </span>
                  </div>
                  <a
                    className="feedTitle"
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
                <li className="feedItem">
                  <span className="feedTitle">No items right now.</span>
                </li>
              )}
            </ul>
          )}
        </aside>
      </section>

      {/* Roles */}
      <section className="rolesV2">
        <div className="roleCard">
          <h3>For MSLs</h3>
          <p>
            Answer “can I say/do this?” in seconds. Search ABPI wording, compare EU codes,
            and pull case examples to support scientific exchange.
          </p>
          <div className="chips">
            <Link to="/abpi" className="chip">ABPI Search</Link>
            <Link to="/comparator" className="chip">Global Comparator</Link>
            <Link to="/askcai" className="chip">AskCAI</Link>
          </div>
        </div>

        <div className="roleCard">
          <h3>For Commercial / Marketing</h3>
          <p>
            Validate claims, materials, and meetings. Check gifts, hospitality and digital
            channel rules before you brief or publish.
          </p>
          <div className="chips">
            <Link to="/abpi" className="chip">ABPI Search</Link>
            <Link to="/comparator" className="chip">Hospitality rules</Link>
            <Link to="/cases" className="chip">PMCPA Case Search</Link>
          </div>
        </div>

        <div className="roleCard">
          <h3>For KAMs</h3>
          <p>
            Plan compliant engagements. See sponsorship & meeting limits, and learn from
            recent rulings that affect field activity.
          </p>
          <div className="chips">
            <Link to="/comparator" className="chip">Country limits</Link>
            <Link to="/cases" className="chip">Relevant cases</Link>
            <Link to="/askcai" className="chip">AskCAI</Link>
          </div>
        </div>
      </section>

      {/* Inside grid */}
      <section className="insideV2">
        <h2>What’s inside</h2>
        <div className="insideGrid">
          <Link to="/abpi" className="insideCard">
            <h4>ABPI Search</h4>
            <p>Direct clause search with filters—get the exact wording, fast.</p>
          </Link>
          <Link to="/comparator" className="insideCard">
            <h4>Global Comparator</h4>
            <p>Compare live text on gifts, hospitality, samples across countries.</p>
          </Link>
          <Link to="/cases" className="insideCard">
            <h4>PMCPA Case Search</h4>
            <p>Precedent and reasoning to sharpen risk judgement.</p>
          </Link>
          <Link to="/dashboard" className="insideCard">
            <h4>Compliance Dashboard</h4>
            <p>Monitor updates, policies, and risk signals in one place.</p>
          </Link>
          <Link to="/askcai" className="insideCard">
            <h4>AskCAI</h4>
            <p>Ask in plain English—get clause-aware answers with citations.</p>
          </Link>
        </div>
      </section>

      <section className="footnoteV2">
        <p>
          Always verify local SOPs and medical/legal guidance. This tool accelerates decisions—it
          doesn’t replace governance.
        </p>
      </section>
    </div>
  );
}
