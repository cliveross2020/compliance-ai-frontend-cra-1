import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const API_ROOT =
  process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com/api";

export default function Home() {
  const chips = [
    "Samples for HCPs",
    "Drinks at meetings",
    "Giveaways & gifts",
    "Sponsorship & grants",
    "Digital & social",
    "Patient materials",
  ];

  const prefill = (text) =>
    `/askcai?prefill=${encodeURIComponent(text)}`;

  return (
    <div className="home">
      <div className="home-grid">
        {/* LEFT: Hero + tip + quick actions */}
        <section className="hero">
          <p className="intro-eyebrow">Compliance AI</p>
          <h1 className="intro-title">Clause-aware answers, fast.</h1>
          <p className="intro-copy">
            A friendly AI teammate for quick, clause-aware guidance across ABPI,
            EFPIA, IFPMA and local country codes. Ask in everyday language and
            get a clear answer with the clause it relies on.
          </p>

          {/* Compact CTA row */}
          <div className="cta-row">
            <Link to="/askcai" className="btn-solid">Ask CAI</Link>
            <Link to="/comparator" className="btn-outline">Global Comparator</Link>
            <Link to="/pmcpa" className="btn-outline">PMCPA Case Search</Link>
            <Link to="/dashboard" className="btn-outline">Dashboard</Link>
          </div>

          {/* Tip of the day */}
          <div className="tip">
            <div className="tip-dot" />
            <div className="tip-body">
              <div className="tip-label">Tip of the day</div>
              <p className="tip-text">
                **Samples** must be **limited**, **clearly marked “sample – not for sale”**,
                and **tracked**. They’re only for **HCPs qualified to prescribe** and must
                not be supplied for patient stock or long-term treatment. Requests should
                be **unsolicited**, **documented**, and limited in **frequency and quantity**.
              </p>
              <div className="tip-foot">
                Source: <span>ABPI Code of Practice 2024 — Clause 17 (Samples)</span>
              </div>
            </div>
          </div>

          {/* Popular checks */}
          <div className="chips">
            {chips.map((c) => (
              <Link key={c} to={prefill(c)} className="chip">
                {c}
              </Link>
            ))}
          </div>

          {/* Three mini cards */}
          <div className="mini-cards">
            <div className="mini-card">
              <div className="mini-title">Ask</div>
              <p>Type it like you’d say it. CAI answers with the clause.</p>
            </div>
            <div className="mini-card">
              <div className="mini-title">Compare</div>
              <p>Switch to EFPIA, IFPMA, or a country PDF on the Ask CAI page.</p>
            </div>
            <div className="mini-card">
              <div className="mini-title">Learn</div>
              <p>See similar PMCPA cases to avoid repeat issues.</p>
            </div>
          </div>
        </section>

        {/* RIGHT: Live feed */}
        <aside className="feed">
          <div className="feed-head">
            <h3>Live Compliance Feed</h3>
            <Link to="/news" className="feed-more">More →</Link>
          </div>
          {/* Your existing News widget/render goes here.
              Keep the container; it’s just styling and layout. */}
          <div className="feed-list">
            {/* Example slots; your code already maps live items */}
            {/* <NewsList items={items} /> */}
          </div>
        </aside>
      </div>

      {/* Bottom quick lanes (stay above the fold on 1440 width) */}
      <div className="lanes">
        <div className="lane">
          <div className="lane-title">For MSLs</div>
          <p>Fast “can I say/do this?” with exact clauses for notes.</p>
          <div className="lane-actions">
            <Link to="/askcai" className="pill">Ask CAI</Link>
            <Link to="/relevant" className="pill">Relevant cases</Link>
          </div>
        </div>
        <div className="lane">
          <div className="lane-title">For Commercial</div>
          <p>Validate claims & meetings. Check gifts, hospitality & digital.</p>
          <div className="lane-actions">
            <Link to="/askcai" className="pill">Ask CAI</Link>
            <Link to="/pmcpa" className="pill">Case search</Link>
            <Link to="/dashboard" className="pill">Dashboard</Link>
          </div>
        </div>
        <div className="lane">
          <div className="lane-title">For KAMs</div>
          <p>Plan compliant events. See country limits & latest rulings.</p>
          <div className="lane-actions">
            <Link to="/askcai" className="pill">Ask CAI</Link>
            <Link to="/comparator" className="pill">Country limits</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 