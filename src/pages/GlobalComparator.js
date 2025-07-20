import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const GlobalComparator = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const countryOptions = [
    { value: 'UK', label: 'UK' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'US', label: 'US' },
  ];

  const topicOptions = [
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'promotional_materials', label: 'Promotional Materials' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCountries.length === 0 || !selectedTopic) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/compare/global`,
        {
          countries: selectedCountries.map((c) => c.value),
          topic: selectedTopic.value,
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
        <Select
          isMulti
          options={countryOptions}
          value={selectedCountries}
          onChange={setSelectedCountries}
          className="react-select"
        />

        <label htmlFor="topic">Select Compliance Topic:</label>
        <Select
          options={topicOptions}
          value={selectedTopic}
          onChange={setSelectedTopic}
          className="react-select"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {results && (
        <div className="Comparator-results">
          <h3>Comparison Results for: <em>{results.topic.replace('_', ' ')}</em></h3>
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
