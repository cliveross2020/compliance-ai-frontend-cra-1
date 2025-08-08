import React, { useMemo, useState } from "react";
import comparatorData from "../data/global_comparator.json";
import "./GlobalComparator.css";
import caiLogo from "../assets/cai-logo.png";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://compliance-ai-app.onrender.com/api/comparator";

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

const highlight = (text, query) => {
  if (!text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "ig");
  return text.split(re).map((part, i) =>
    re.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
  );
};

export default function GlobalComparator() {
  const countryOptions = useMemo(() => buildCountryOptions(comparatorData), []);
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");
  const [country3, setCountry3] = useState("");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState({});
  const [expandedCountry, setExpandedCountry] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setExpandedCountry({});
    try {
      const res = await fetch(`${API_BASE}/compare/global`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countries, topic: q }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setResults(data.results || {});
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (country) =>
    setExpandedCountry((prev) => ({ ...prev, [country]: !prev[country] }));

  const pickedCountries = [country1, country2, country3].filter(Boolean);

  return (
    <div className="gc-layout">
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
                (slot === 1 ? setCountry1 : slot === 2 ? setCountry2 : setCountry3)(
                  e.target.value
                )
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
            onKeyDown={(e) => e.key === "Enter" && runCompare()}
          />
        </div>

        <button
          className="btn"
          onClick={runCompare}
          disabled={loading || !topic.trim() || pickedCountries.length === 0}
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

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

            {pickedCountries.map((country) => {
              const info = results[country] || {};
              const isOpen = !!expandedCountry[country];
              const matches = Array.isArray(info.matches) ? info.matches : [];

              return (
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

                  {info.error ? (
                    <div className="gc-error">{info.error}</div>
                  ) : (
                    <>
                      <ul className={`gc-list ${isOpen ? "expanded" : "collapsed"}`}>
                        {matches.map((m, i) => (
                          <li className="gc-snippet" key={i}>
                            {m.clause && <div className="gc-snippet-clause">{m.clause}</div>}
                            <div className="gc-snippet-text">
                              {highlight(isOpen ? m.full : m.preview, topic.trim())}
                            </div>
                          </li>
                        ))}
                        {matches.length === 0 && (
                          <li className="gc-snippet">
                            <div className="gc-snippet-text">No relevant content found.</div>
                          </li>
                        )}
                      </ul>

                      {matches.length > 0 && (
                        <button
                          type="button"
                          className={`country-toggle ${isOpen ? "fade-out" : ""}`}
                          onClick={() => toggleCountry(country)}
                        >
                          {isOpen ? "Show less" : "Read more"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
