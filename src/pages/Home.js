import React, { useMemo } from "react";
import "./Home.css";
import News from "./News"; // uses your existing compact feed

// Helper: send a prefilled question to AskCAI.
// AskCaiWorkbench.js can read and clear this on mount:
function goAsk(question, doc = "abpi") {
  try {
    localStorage.setItem(
      "askcai_prefill",
      JSON.stringify({ question, doc }) // doc: 'abpi' | 'efpia' | 'ifpma' | 'other'
    );
  } catch {}
  window.location.hash = "#/askcai";
}

export default function Home() {
  // ---- Quick Actions --------------------------------------------------------
  const quickActions = useMemo(
    () => [
      { label: "Samples to HCPs", q: "Can samples be given to HCPs? Include the clause(s)." },
      { label: "Max hospitality", q: "What are the hospitality rules and typical spend limits? Cite clauses." },
      { label: "Digital content", q: "What are the rules for digital and social content? Reference the clause numbers." },
      { label: "Sponsorship", q: "When can we sponsor HCPs or events? Provide the relevant clauses." },
      { label: "Meetings abroad", q: "Rules for meetings held outside the UK? Cite applicable clauses." },
      { label: "Promotional aids", q: "Are promotional gifts allowed? Include exact clause references." },
    ],
    []
  );

  // ---- Tip of the Day -------------------------------------------------------
  const tips = useMemo(
    () => [
      {
        text: "Promotional aids are generally not permitted; cite the clause and exceptions, if any.",
        q: "Are promotional aids allowed under the code? Answer with clauses.",
      },
      {
        text: "Samples are for familiarisation and must follow strict limits—ask for the clause and conditions.",
        q: "What are the rules for providing samples to HCPs? Include all clause numbers.",
      },
      {
        text: "Hospitality must be modest and secondary to the scientific content.",
        q: "What does the code say about hospitality value, venue choice, and documentation? Cite clauses.",
      },
      {
        text: "Digital communications follow the same standards as print. Ask for the specific clauses.",
        q: "Digital and social media compliance: what’s allowed and what’s not? Provide clause citations.",
      },
      {
        text: "Sponsorship must not be promotional and must be transparent—ask for the clauses.",
        q: "What are the rules for sponsorships and grants? Please include the clause references.",
      },
    ],
    []
  );

  // deterministic rotation by date (so every user sees the same “today”)
  const tip = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000) % tips.length;
    return tips[dayIndex];
  }, [tips]);

  return (
    <main className="home">
      {/* Left Column */}
      <section className="home-left">
        <header className="hero">
          <h1>Ask CAI</h1>
          <p className="sub">
            Clause-aware answers for ABPI, EFPIA, IFPMA and local codes — fast.
          </p>

          <ul className="bullets">
            <li>Plain-English answers with <strong>clause cites</strong> (≤350 words)</li>
            <li>Point CAI at any official code PDF — no copy/paste</li>
            <li>Pulls relevant PMCPA cases to help avoid repeat issues</li>
          </ul>

          {/* Quick Actions (Option 1) */}
          <div className="quick-actions">
            {quickActions.map((a, i) => (
              <button
                key={i}
                className="pill"
                onClick={() => goAsk(a.q, "abpi")}
                title={`Ask: ${a.q}`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Tip of the Day (Option 2) */}
          <div className="tip-card">
            <div className="tip-title">Tip of the day</div>
            <div className="tip-text">{tip.text}</div>
            <button className="tip-ask" onClick={() => goAsk(tip.q, "abpi")}>
              Ask this in CAI →
            </button>
          </div>
        </header>

        {/* Audience cards (unchanged layout; compact spacing) */}
        <div className="audience-grid">
          <div className="aud-card">
            <h3>For MSLs</h3>
            <p>Fast “can I say/do this?” checks with exact clauses for notes.</p>
            <div className="row">
              <button className="mini" onClick={() => goAsk("Can I share off-label evidence at a reactive MSL meeting? Include clauses.")}>Ask CAI</button>
              <a className="mini ghost" href="#/comparator">Compare codes</a>
              <a className="mini ghost" href="#/pmcpa">Relevant cases</a>
            </div>
          </div>

          <div className="aud-card">
            <h3>For Commercial</h3>
            <p>Validate claims & meetings. Check gifts, hospitality & digital.</p>
            <div className="row">
              <button className="mini" onClick={() => goAsk("What are the hospitality rules for a UK HCP dinner meeting? Cite clauses.")}>Ask CAI</button>
              <a className="mini ghost" href="#/pmcpa">Case search</a>
              <a className="mini ghost" href="#/dashboard">Dashboard</a>
            </div>
          </div>

          <div className="aud-card">
            <h3>For KAMs</h3>
            <p>Plan compliant events. See country limits & latest rulings.</p>
            <div className="row">
              <button className="mini" onClick={() => goAsk("Can we sponsor attendance at a congress? What limits apply? Include clauses.")}>Ask CAI</button>
              <a className="mini ghost" href="#/comparator">Country limits</a>
              <a className="mini ghost" href="#/pmcpa">Recent cases</a>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Compact, scrollable news */}
      <aside className="home-right">
        <div className="feed-card">
          <div className="feed-head">
            <h3>Live Compliance Feed</h3>
            <a href="#/news" className="more">More →</a>
          </div>
          {/* The News component should accept compact props; if not, it still renders fine */}
          <News compact maxItems={8} />
        </div>
      </aside>
    </main>
  );
}
