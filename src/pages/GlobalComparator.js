import React, { useState } from "react";
import "./GlobalComparator.css";
import comparatorData from "../../data/global_comparator.json";

const GlobalComparator = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uniqueCountries = [
    ...new Set(comparatorData.map((entry) => entry.country)),
  ];

  const handleCountryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedCountries(selected);
  };

  const handleCompare = async () => {
    if (!topic.trim() || selectedCountries.length === 0) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/compare/global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, countries: selectedCountries }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unknown error");

      const enrichedResults = data.map((entry) => {
        const match = comparatorData.find(
          (item) => item.country === entry.country
        );
        return {
          ...entry,
          code_url: match ? match.url : null,
          code_name: match ? match.code_name : entry.country,
        };
      });

      setResults(enrichedResults);
    } catch (err) {
      setError(err.message || "Failed to compare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comparator-container">
      <h2>Global Code Comparator</h2>

      <div className="comparator-controls">
        <select
          multiple
          onChange={handleCountryChange}
          className="comparator-dropdown"
        >
          {uniqueCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Enter compliance topic (e.g. gifts, meetings)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="comparator-input"
        />

        <button onClick={handleCompare} className="comparator-button">
          Compare
        </button>
      </div>

      {loading && <div className="comparator-loading">Loading...</div>}
      {error && <div className="comparator-error">{error}</div>}

      {results.length > 0 && (
        <div className="comparator-results">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Code</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, index) => (
                <tr key={index}>
                  <td>{res.country}</td>
                  <td>
                    {res.code_url ? (
                      <a
                        href={res.code_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {res.code_name || "View PDF"}
                      </a>
                    ) : (
                      res.code_name || res.country
                    )}
                  </td>
                  <td>{res.summary || "No match found."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GlobalComparator;
