import React, { useMemo, useState } from "react";
import comparatorData from "../data/global_comparator.json";
import "./GlobalComparator.css";
import caiLogo from "../assets/cai-logo.png";

/** Backend base URL */
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://compliance-ai-app.onrender.com/api/comparator";

/** Build unique country options with code name labels */
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

/** Highlight matched topic in preview/full text */
const highlight = (text, query) => {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "ig");
  return text.split(re).map((part, i) =>
    re.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
  );
};

const GlobalComparator = () => {
  const countryOptions = useMemo(() => buildCountryOptions(comparatorData), []);
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");
  const [country3, setCountry3] = useState("");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Filter dropdown options to avoid duplicate selections */
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

  const toggleExpand = (country, idx) => {
    setExpanded((prev) => ({
      ...prev,
      [`${country}-${idx}`]: !prev[`${country}-${idx}`],
    }));
  };

  return (
    <div className="gc-layout">
      {/* Left Panel - Form */}
      <div className="gc-form">
        <div className="gc-header">
          <img src={caiLogo} alt="CAI Logo" className="gc-logo" />
          <h2 className="gc-title">Global Code Comparator</h2>
        </div>

        {[1, 2, 3].map((slot) => (
          <div className="field" key={slot}>
            <label htmlFor={`country${slot}`}>Country {slot}</label>
            <select
              id={`country${slot}`}
              value={slot === 1 ? country1 : slot === 2 ? country2 : country3}
              onChange={(e) =>
                slot === 1
                  ? setCountry1(e.target.value)
                  : slot === 2
                  ? setCountry2(e.target.value)
                  : setCountry3(e.target.value)
              }
            >
              <option value="">Select a country…</option>
              {optionsFor(slot).map((opt) => (
                <option key={`${slot}-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

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
          disabled={loading || !topic.trim() || ![country1, country2, country3].some(Boolean)}
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {/* Right Panel - Results */}
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
                    {info.code ? <span className="gc-code"> — {info.code}</span> : null}
                  </div>
                  {info.url && (
                    <a className="gc-link" href={info.url} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  )}
                </div>

                {info.error && <div className="gc-error">{info.error}</div>}

                <ul className="gc-list">
                  {(info.matches || []).map((m, i) => {
                    const isExpanded = expanded[`${country}-${i}`];
                    return (
                      <li
                        key={i}
                        className={`gc-snippet ${isExpanded ? "expanded" : "collapsed"}`}
                      >
                        <span className="gc-snippet-text">
                          {highlight(isExpanded ? m.full : m.preview, topic.trim())}
                        </span>
                        {m.full && m.full !== m.preview && (
                          <button
                            className={`read-more ${isExpanded ? "fade-out" : ""}`}
                            onClick={() => toggleExpand(country, i)}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalComparator;
