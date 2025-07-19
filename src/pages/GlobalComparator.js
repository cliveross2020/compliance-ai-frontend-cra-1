import React, { useState } from 'react';
import axios from 'axios';

const GlobalComparator = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableCountries = ['UK', 'Germany', 'France', 'US'];
  const availableTopics = [
    'hospitality',
    'promotional_materials'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCountries.length === 0 || !selectedTopic) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/compare/global`,
        {
          countries: selectedCountries,
          topic: selectedTopic,
        }
      );
      setResults(response.data);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Comparator">
      <h2>Global Code Comparator</h2>
      <form className="Comparator-form" onSubmit={handleSubmit}>
        <label htmlFor="countries">Select Countries:</label>
        <select
          id="countries"
          multiple
          value={selectedCountries}
          onChange={(e) =>
            setSelectedCountries(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {availableCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <label htmlFor="topic">Select Compliance Topic:</label>
        <select
          id="topic"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">-- Choose a topic --</option>
          {availableTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic.replace('_', ' ')}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {results && (
        <div className="Comparator-results">
          <h3>Comparison Results for: <em>{results.topic}</em></h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Guideline</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results.comparison).map(([country, guideline]) => (
                <tr key={country}>
                  <td>{country}</td>
                  <td>{guideline}</td>
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
