import React, { useMemo, useState } from "react";
import comparatorData from "../data/global_comparator.json";
import "./GlobalComparator.css";
import caiLogo from "../assets/cai-logo.png"; // ✅ Replace globe icon

/** Backend base URL */
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://compliance-ai-app.onrender.com/api/comparator";

/** Build unique country options; labels include the code name */
function buildCountryOptions(data) {
  const seen = new Set();
  const out = [];
  for (const row of data) {
    const country = row.country || row.Country || "";
    const code = row.code || row.code_name || row.Code || "";
    if (!country || seen.has(country)) continue;
    seen.add(country);
    out.push({ value: country, label: code ? `${country} (${code})` : country });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/** Simple highlighter for topic matches */
const highlight = (text, query) => {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "ig");
  return text.split(re).map((part, i) =>
    re.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
  );
};

/** Clause helpers */
const extractClause = (text) => {
  if (!text) return null;
  const m = text.match(/\b(?:Clause|Cl\.?|Article)\s*(\d+(?:\.\d+)?)/i);
  return m ? `Clause ${m[1]}` : null;
};
const removeClausePrefix = (text) => {
  if (!text) return text;
  return text.replace(
    /^\s*(?:Clause|Cl\.?|Article)\s*\d+(?:\.\d+)?\s*[:\-–]?\s*/i,
    ""
  );
};

const GlobalComparator = () => {
  const countryOptions = useMemo(() => buildCountryOptions(comparatorData), []);
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");
  const [country3, setCountry3] = useState("");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  /** Exclude already-selected countries from other dropdowns */
  const optionsFor = (slot) => {
    const chosen = new Set([country1, country2, country3].filter(Boolean));
    return countryOptions.filter((opt) => {
      if (slot === 1) return !chosen.has(opt.value) || opt.value === country1;
      if (slot === 2) return !chosen.has(opt.value) || opt.value === country2;
      return !chosen.has(opt.value) || opt.value === country3;
    });
  };

  const runCompare = async () => {
    const countries = [country1, country2, country3].filter(Boolean);
    const q = topic.trim();
    if (!q || countries.length === 0) return;

    setLoading(true);
    setError(null);
    setResults({});
    try {
      const res = await fetch(`${API_BASE}/compare/global`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countries, topic: q }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
      setResults(data.results || {});
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-layout">
      {/* Left: Form */}
      <div className="gc-form">
        <div className="gc-header">
          <img src={caiLogo} alt="Compliance AI Logo" className="gc-logo" />
          <h2 className="gc-title">Global Code Comparator</h2>
        </div>

        <div className="field">
          <label htmlFor="country1">Country 1</label>
          <select
            id="country1"
            value={country1}
            onChange={(e) => setCountry1(e.target.value)}
          >
            <option value="">Select a country…</option>
            {optionsFor(1).map((opt) => (
              <option key={`c1-${opt.value}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="country2">Country 2</label>
          <select
            id="country2"
            value={country2}
            onChange={(e) => setCountry2(e.target.value)}
          >
            <option value="">Select a country…</option>
            {optionsFor(2).map((opt) => (
              <option key={`c2-${opt.value}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="country3">Country 3</label>
          <select
            id="country3"
            value={country3}
            onChange={(e) => setCountry3(e.target.value)}
          >
            <option value="">Select a country…</option>
            {optionsFor(3).map((opt) => (
              <option key={`c3-${opt.value}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="topic">Compliance Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. gifts, hospitality, samples"
            onKeyDown={(e) => {
              if (e.key === "Enter") runCompare();
            }}
          />
        </div>

        <button
          className="btn"
          onClick={runCompare}
          disabled={
            loading || !topic.trim() || ![country1, country2, country3].some(Boolean)
          }
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {/* Right: Results */}
      <div className="gc-content">
        {error && <div className="gc-error">Error: {error}</div>}

        {loading && <div className="gc-loading">Working on it…</div>}

        {!error && !loading && Object.keys(results).length === 0 && (
          <div className="gc-muted">
            Pick up to three countries and a topic, then hit <strong>Compare</strong>.
          </div>
        )}

        {!error && !loading && Object.keys(results).length > 0 && (
          <div className="gc-results">
            <h3 className="gc-results-title">
              Results for: <em>{topic.trim()}</em>
            </h3>

            {Object.entries(results).map(([country, info]) => (
              <div className="gc-card" key={country}>
                <div className="gc-card-head">
                  <div className="gc-card-title">
                    <strong>{country}</strong>
                    {info.code ? (
                      <span className="gc-code"> — {info.code}</span>
                    ) : null}
                  </div>
                  {info.url && (
                    <a
                      className="gc-link"
                      href={info.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source
                    </a>
                  )}
                </div>

                {info.error ? (
                  <div className="gc-error">{info.error}</div>
                ) : (
                  <ul className="gc-list">
                    {(info.matches || []).map((m, i) => {
                      const key = `${country}-${i}`;
                      const isExpanded = !!expanded[key];
                      const full = m.full || m;
                      const preview = m.preview || m;
                      const clause = extractClause(full || preview);
                      const displayPreview = removeClausePrefix(preview);
                      const displayFull = removeClausePrefix(full || preview);

                      return (
                        <li
                          key={i}
                          className={`gc-snippet ${
                            isExpanded ? "expanded" : "collapsed"
                          }`}
                        >
                          {clause && (
                            <div className="gc-snippet-clause">{clause}</div>
                          )}
                          <div className="gc-snippet-text">
                            {highlight(
                              isExpanded ? displayFull : displayPreview,
                              topic.trim()
                            )}
                          </div>
                          {full && full !== preview && (
                            <button
                              type="button"
                              className={`read-more ${
                                isExpanded ? "fade-out" : ""
                              }`}
                              onClick={() =>
                                setExpanded((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                            >
                              {isExpanded ? "Show less" : "Read more"}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalComparator;
