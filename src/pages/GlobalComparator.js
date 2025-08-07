import React, { useState } from "react";
import comparatorData from "../data/global_comparator.json";
import "./GlobalComparator.css";

const GlobalComparator = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState([]);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleCompare = () => {
    if (!topic.trim() || selectedCountries.length === 0) return;

    const filtered = comparatorData.filter((item) =>
      selectedCountries.includes(item.country)
    );

    const results = filtered.map((item) => ({
      country: item.country,
      code_name: item.code_name,
      url: item.url,
      note: `PDF link available — topic '${topic}' not yet extracted`, // Placeholder for future parsing
    }));

    setResults(results);
  };

  return (
    <div className="global-comparator-container">
      <h2>Global Comparator</h2>

      <div className="comparator-form">
        <label>
          Select Countries:
          <div className="checkbox-group">
            {Array.from(new Set(comparatorData.map((d) => d.country))).map(
              (country) => (
                <label key={country}>
                  <input
                    type="checkbox"
                    value={country}
                    checked={selectedCountries.includes(country)}
                    onChange={handleCountryChange}
                  />
                  {country}
                </label>
              )
            )}
          </div>
        </label>

        <label>
          Compliance Topic:
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. gifts, hospitality, disclosure"
          />
        </label>

        <button onClick={handleCompare}>Compare</button>
      </div>

      {results.length > 0 && (
        <div className="comparison-results">
          <h3>Results</h3>
          <ul>
            {results.map((res, idx) => (
              <li key={idx}>
                <strong>{res.country}</strong> —{" "}
                <a href={res.url} target="_blank" rel="noreferrer">
                  {res.code_name}
                </a>
                <p>{res.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GlobalComparator;
