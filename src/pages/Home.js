import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import caiLogo from "../assets/cai-logo.png";

const Home = () => {
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
            <Link to="/abpi" className="btn btn-primary">ABPI Search</Link>
            <Link to="/comparator" className="btn btn-secondary">Global Comparator</Link>
            <Link to="/cases" className="btn btn-outline">PMCPA Case Search</Link>
          </div>

          <ul className="hero-points">
            <li>Instant clause lookup across ABPI & EFPIA</li>
            <li>Country-by-country code comparison (PDF live extraction)</li>
            <li>Case learning from PMCPA rulings</li>
          </ul>
        </div>

        {/* Live feed */}
        <aside className="hero-right">
          <h3 className="feed-title">Live Compliance Feed</h3>
          <ul className="feed-list">
            {/* Replace with live items once backend is ready */}
            <li className="feed-item">
              <span className="feed-source">EFPIA</span>
              <span className="feed-text">Updated guidance on meals & HCP engagement.</span>
              <span className="feed-time">Just now</span>
            </li>
            <li className="feed-item">
              <span className="feed-source">PMCPA</span>
              <span className="feed-text">New case highlights claims substantiation risks.</span>
              <span className="feed-time">1h</span>
            </li>
            <li className="feed-item">
              <span className="feed-source">PhRMA</span>
              <span className="feed-text">Principles refresh: interactions with patient orgs.</span>
              <span className="feed-time">Today</span>
            </li>
          </ul>
          <div className="feed-footer">
            <Link to="/dashboard">See more →</Link>
          </div>
        </aside>
      </section>

      {/* Role-based value */}
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
            Validate claims, materials, and meetings quickly. Spot country rules on gifts,
            hospitality, and digital channels—before you brief or publish.
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
            Plan compliant engagements. Check local sponsorship & meeting limits, and learn
            from recent rulings that affect field activity and support requests.
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
          <Link to="/abpi" className="inside-card">
            <h4>ABPI Search</h4>
            <p>Direct clause search with filters—get the exact wording, fast.</p>
          </Link>
          <Link to="/comparator" className="inside-card">
            <h4>Global Comparator</h4>
            <p>Compare live PDF text from country codes for topics like gifts, hospitality, samples.</p>
          </Link>
          <Link to="/cases" className="inside-card">
            <h4>PMCPA Case Search</h4>
            <p>Learn from precedent: similar claims, outcomes, and reasoning.</p>
          </Link>
          <Link to="/dashboard" className="inside-card">
            <h4>Compliance Dashboard</h4>
            <p>Monitor updates, policies, and risk signals in one place.</p>
          </Link>
          <Link to="/askcai" className="inside-card">
            <h4>AskCAI</h4>
            <p>Ask questions in plain English—get a clause-aware answer with cites.</p>
          </Link>
        </div>
      </section>

      {/* Footer note */}
      <section className="footnote">
        <p>
          Always verify local SOPs and medical/legal guidance. This tool accelerates
          compliance decisions—it doesn’t replace governance.
        </p>
      </section>
    </div>
  );
};

export default Home;
