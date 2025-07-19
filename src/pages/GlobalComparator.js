// src/pages/GlobalComparator.js
import React, { useState } from 'react';
import axios from 'axios';

const countryList = ["UK", "Germany", "US", "France"];
const topicList = ["hospitality", "promotional_materials"];

function GlobalComparator() {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleCountry = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const handleCompare = async () => {
    if (selectedCountries.length === 0 || !selectedTopic) {
      setError("Please select at least one country and a topic.");
      return;
    }

    setLoading(true);
    setError(null);
    setComparisonResults(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/compare/global`, {
        countries: selectedCountries,
        topic: selectedTopic
      });

      setComparisonResults(response.data.comparison);
    } catch (err) {
      setError("Failed to fetch comparison data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ComparatorContainer">
      <h2>🌍 Global Comparator</h2>

      <div className="FormSection">
        <h4>Select Countries:</h4>
        {countryList.map(country => (
          <label key={country}>
            <input
              type="checkbox"
              value={country}
              checked={selectedCountries.includes(country)}
              onChange={() => toggleCountry(country)}
            />
            {country}
          </label>
        ))}
      </div>

      <div className="FormSection">
        <h4>Select Topic:</h4>
        <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
          <option value="">-- Choose Topic --</option>
          {topicList.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <button onClick={handleCompare}>Compare</button>

      {loading && <p>Loading...</p>}
      {error && <p className="Error">{error}</p>}

      {comparisonResults && (
        <div className="ResultsTable">
          <h4>Results for: <em>{selectedTopic}</em></h4>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(comparisonResults).map(([country, rule]) => (
                <tr key={country}>
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
}

export default GlobalComparator;
