import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GlobalComparator.css";

const GlobalComparator = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(["", "", ""]);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/comparator/countries")
      .then((res) => {
        setCountries(res.data.countries);
      })
      .catch((err) => {
        console.error("Failed to fetch countries:", err);
        setError("Could not load country list.");
      });
  }, []);

  const handleChange = (index, value) => {
    const updated = [...selectedCountries];
    updated[index] = value;
    setSelectedCountries(updated);
  };

  const handleCompare = () => {
    const filtered = selectedCountries.filter(c => c);
    if (filtered.length < 2 || !topic) {
      setError("Please select at least 2 countries and enter a topic.");
      return;
    }

    axios.post("/api/comparator/compare/global", {
      countries: filtered,
      topic: topic
    }).then((res) => {
      setResult(res.data);
      setError("");
    }).catch((err) => {
      console.error("Comparison failed:", err);
      setError("Failed to retrieve comparison results.");
    });
  };

  return (
    <div className="comparator-container">
      <h2>Global Code Comparator</h2>

      <div className="comparator-controls">
        {[0, 1, 2].map((i) => (
          <div key={i} className="dropdown-group">
            <label>Country {i + 1}</label>
            <select
              value={selectedCountries[i]}
              onChange={(e) => handleChange(i, e.target.value)}
            >
              <option value="">Select a country</option>
              {countries.map((c, idx) => (
                <option key={idx} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="topic-input">
          <label>Compliance Topic</label>
          <input
            type="text"
            placeholder="e.g. hospitality"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <button onClick={handleCompare}>Compare</button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="comparison-result">
          <h3>Results for: {result.topic}</h3>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.comparison).map(([country, rule], i) => (
                <tr key={i}>
                  <td>{country}</td>
                  <td>{rule}</td>
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
