import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero card">
        <div className="hero-copy">
          <h1>Ask CAI</h1>
          <p className="sub">
            Your Global Code AI assistant for fast, clause‑aware guidance across
            ABPI, EFPIA, IFPMA and local country codes.
          </p>

          <ul className="bullets">
            <li>Answers in plain English with clause references capped at 350 words</li>
            <li>Point CAI at any official PDF (ABPI, EFPIA, IFPMA, etc.)—no copy/paste needed</li>
            <li>Pulls precedent from PMCPA cases to help avoid repeat findings</li>
            <li>Built for speed: quick checks for MSLs, KAMs, Medical/Legal, and Marketing</li>
          </ul>

          <div className="cta">
            <Link className="btn btn-primary" to="/askcai">Open Ask CAI</Link>
            <Link className="btn" to="/global-comparator">Global Comparator</Link>
            <Link className="btn" to="/pmcpa">PMCPA Case Search</Link>
            <Link className="btn" to="/dashboard">Compliance Dashboard</Link>
          </div>

          <div className="note">
            Always verify with local SOPs and medical/legal. This tool accelerates decisions—it doesn’t replace governance.
          </div>
        </div>

        <div className="hero-side">
          <div className="tile">
            <div className="tile-h">What Ask CAI does</div>
            <div className="tile-b">
              <strong>Understands your question</strong> → finds relevant clauses in your selected code →
              <strong> summarizes with citations</strong> (e.g., “Clause 10.5”, “Clause 19.2”).
            </div>
          </div>
          <div className="tile">
            <div className="tile-h">When to use it</div>
            <div className="tile-b">
              Quick yes/no checks for materials, meetings, samples, gifts, digital use, sponsorship,
              country limits, and more—without trawling PDFs.
            </div>
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="grid">
        <div className="card">
          <div className="card-h">For MSLs</div>
          <p>Answer “can I say/do this?” in seconds. Compare EU codes and pull case examples to support scientific exchange without promotional drift.</p>
          <div className="chips">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/global-comparator" className="chip">Global Comparator</Link>
            <Link to="/pmcpa" className="chip">Relevant cases</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-h">For Commercial / Marketing</div>
          <p>Validate claims, materials, and meetings quickly. Check gifts, hospitality & digital channel rules before you brief or publish.</p>
          <div className="chips">
            <Link to="/askcai" className="chip">Ask CAI</Link>
            <Link to="/pmcpa" className="chip">PMCPA Case Search</Link>
            <Link to="/dashboard" className="chip">Dashboard</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-h">For KAMs</div>
          <p>Plan compliant engagements. See sponsorship & meeting limits, learn from recent rulings that affect field activity.</p>
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
          <p>Ask in plain English—get clause‑aware answers with citations, grounded in the code you pick.</p>
          <Link className="link" to="/askcai">Open Ask CAI →</Link>
        </div>

        <div className="card">
          <div className="card-h">Global Comparator</div>
          <p>Compare live text from country codes for gifts, hospitality, samples, and more.</p>
          <Link className="link" to="/global-comparator">Compare codes →</Link>
        </div>

        <div className="card">
          <div className="card-h">PMCPA Case Search</div>
          <p>Learn from precedent: similar claims, outcomes, and reasoning so you can avoid repeat findings.</p>
          <Link className="link" to="/pmcpa">Search cases →</Link>
        </div>

        <div className="card">
          <div className="card-h">Compliance Dashboard</div>
          <p>Monitor updates, policies, and risk signals in one place with tight, executive‑ready charts.</p>
          <Link className="link" to="/dashboard">View dashboard →</Link>
        </div>
      </section>

      {/* Optional: Live Compliance Feed (keep your existing component if you have one) */}
      {/* <LiveFeed /> */}
    </div>
  );
}
