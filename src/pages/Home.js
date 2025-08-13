// src/pages/Home.js
import React, { useEffect, useState } from "react";
import "./Home.css";

const RAW =
  process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

export default function Home() {
  return (
    <div className="home-wrap compact">
      {/* Intro */}
      <section className="intro">
        <h1>Compliance AI</h1>
        <p className="intro-text">
          A friendly AI teammate for quick, clause-aware answers across ABPI,
          EFPIA, IFPMA and local country codes. Ask in everyday language and get
          a clear answer with the exact clause it relies on.
        </p>
      </section>

      <div className="home-grid">
        {/* LEFT COLUMN */}
        <div className="left-col">
          {/* Ask CAI – hero */}
          <section className="hero">
            <div className="hero-head">
              <h2>Ask CAI</h2>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#/askcai">Open Ask CAI</a>
                <a className="btn" href="#/global">Global Comparator</a>
                <a className="btn" href="#/pmcpa">PMCPA Case Search</a>
                <a className="btn" href="#/dashboard">Dashboard</a>
              </div>
            </div>

            <ul className="hero-bullets">
              <li>Plain-English answers with clause cites.</li>
              <li>Point CAI at any official code PDF — no copy/paste.</li>
              <li>See related PMCPA cases to avoid repeat issues.</li>
            </ul>
          </section>

          {/* Workflow strip */}
          <section className="workflow tight">
            <div className="wf-step">
              <div className="wf-ico">💬</div>
              <div className="wf-title">Ask</div>
              <div className="wf-sub">Type it like you’d say it.</div>
            </div>
            <div className="wf-arrow">→</div>
            <div className="wf-step">
              <div className="wf-ico">📑</div>
              <div className="wf-title">Compare</div>
              <div className="wf-sub">Switch to EFPIA, IFPMA, or a country PDF.</div>
            </div>
            <div className="wf-arrow">→</div>
            <div className="wf-step">
              <div className="wf-ico">📚</div>
              <div className="wf-title">Learn</div>
              <div className="wf-sub">See similar PMCPA cases.</div>
            </div>
          </section>

          {/* Popular checks */}
          <section className="chips tight">
            <div className="chips-title">Popular checks</div>
            <div className="chip-row" role="list">
              {[
                "Samples for HCPs",
                "Drinks at meetings",
                "Giveaways & gifts",
                "Sponsorship & grants",
                "Digital & social",
                "Patient materials",
              ].map((label) => (
                <a
                  key={label}
                  className="chip"
                  href={`#/askcai?q=${encodeURIComponent(label)}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </section>

          {/* Audience cards (more compact) */}
          <section className="audiences tight">
            <div className="aud-card small">
              <div className="aud-title">For MSLs</div>
              <p>Fast “can I say/do this?” with exact clauses.</p>
            </div>
            <div className="aud-card small">
              <div className="aud-title">For Commercial</div>
              <p>Validate claims &amp; meetings. Check gifts &amp; digital.</p>
            </div>
            <div className="aud-card small">
              <div className="aud-title">For KAMs</div>
              <p>Plan compliant events. See country limits &amp; rulings.</p>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN – NEWS */}
        <div className="right-col">
          <NewsPanel />
        </div>
      </div>
    </div>
  );
}

/* ---------- News panel ---------- */
function NewsPanel() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch(`${API}/news?limit=12`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!stop) setItems(data.items || []);
      } catch (e) {
        if (!stop) setErr(e.message || "Failed to load news");
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  return (
    <section className="news compact">
      <div className="news-head">
        <h3>Live Compliance Feed</h3>
        <a className="news-more" href="#/news">More →</a>
      </div>
      {err && <div className="news-error">Error: {err}</div>}
      <div className="news-list scrollable">
        {items.map((n, i) => (
          <a
            key={i}
            className="news-item"
            href={n.link || "#"}
            target="_blank"
            rel="noreferrer"
            title={n.title}
          >
            <span className={`source ${slug(n.source || "News")}`}>
              {n.source || "News"}
            </span>
            <span className="title">{n.title}</span>
            {n.date && <span className="date">{n.date}</span>}
          </a>
        ))}
        {items.length === 0 && !err && (
          <div className="news-empty">No items right now.</div>
        )}
      </div>
    </section>
  );
}
function slug(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
