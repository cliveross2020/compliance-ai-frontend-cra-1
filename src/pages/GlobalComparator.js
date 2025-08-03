import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./GlobalComparator.css";

const GlobalComparator = () => {
  const [topic, setTopic] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://compliance-ai-app.onrender.com/api/comparator/countries");
        const data = await res.json();
        const options = data.countries.map((country) => ({
          label: country,
          value: country,
        }));
        setCountryOptions(options);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Failed to load countries.");
      }
    };
    fetchCountries();
  }, []);

  const handleCompare = async () => {
    setError("");
    if (!topic || selectedCountries.length < 1) {
      setError("Please enter a topic and select at least one country.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("https://compliance-ai-app.onrender.com/api/compare/global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim().toLowerCase(),
          countries: selectedCountries.map((c) => c.value),
        }),
      });

      const data = await res.json();
      setResults(data.comparison || {});
    } catch (err) {
      console.error("Comparison error:", err);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="global-comparator-container">
      <h1>🌍 Global Code Comparator</h1>

      <div className="global-comparator-controls">
        <input
          type="text"
          placeholder="Enter a compliance topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="global-comparator-dropdown"
        />

        <Select
          isMulti
          options={countryOptions}
          className="global-comparator-dropdown"
          placeholder="Select countries or associations..."
          value={selectedCountries}
          onChange={setSelectedCountries}
        />

        <button onClick={handleCompare} disabled={loading}>
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {error && <p className="global-comparator-error">{error}</p>}

      {results && (
        <table className="global-comparator-table">
          <thead>
            <tr>
              <th>Topic</th>
              {Object.keys(results).map((country) => (
                <th key={country}>{country}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{topic}</td>
              {Object.values(results).map((val, idx) => (
                <td key={idx}>{val}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GlobalComparator;
