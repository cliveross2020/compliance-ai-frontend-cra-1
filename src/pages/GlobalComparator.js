import React, { useState } from "react";
import axios from "axios";

const countryOptions = ["UK", "US", "Germany", "France", "Spain"];
const topicOptions = ["hospitality", "gifts", "sponsorship", "thresholds"];

const GlobalComparator = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCountryChange = (e) => {
    const { value, checked } = e.target;
    setSelectedCountries((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  const handleCompare = async () => {
    setError("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/compare/global`,
        {
          countries: selectedCountries,
          topic: selectedTopic,
        }
      );
      setResult(response.data);
    } catch (err) {
      setError("Comparison failed. Please try again.");
    }
  };

  return (
    <div className="comparator-container">
      <h2>Global Compliance Comparator</h2>

      <div>
        <label>Select Countries:</label>
        <div className="country-options">
          {countryOptions.map((country) => (
            <label key={country}>
              <input
                type="checkbox"
                value={country}
                checked={selectedCountries.includes(country)}
                onChange={handleCountryChange}
              />
              {country}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>Select Topic:</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">-- Select Topic --</option>
          {topicOptions.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleCompare} disabled={!selectedTopic || selectedCountries.length === 0}>
        Compare
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="comparison-result">
          <h3>Comparison Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GlobalComparator;
