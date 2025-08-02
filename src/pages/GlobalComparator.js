import React, { useState } from 'react';
import Select from 'react-select';
import './GlobalComparator.css';

const efpiaCountries = [
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Italy', value: 'Italy' },
  { label: 'Belgium', value: 'Belgium' },
  { label: 'Sweden', value: 'Sweden' },
  { label: 'UK', value: 'UK' },
];

const ifpmaAssociations = [
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Japan', value: 'Japan' },
  { label: 'Australia', value: 'Australia' },
  { label: 'India', value: 'India' },
  { label: 'Brazil', value: 'Brazil' },
];

const allCountries = [
  { label: 'ABPI (UK)', value: 'UK' },
  ...efpiaCountries.filter(c => c.value !== 'UK'),
  ...ifpmaAssociations
];

const GlobalComparator = () => {
  const [topic, setTopic] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!topic || selectedCountries.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch('https://compliance-ai-app.onrender.com/api/compare/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          countries: selectedCountries.map(c => c.value)
        })
      });
      const data = await response.json();
      setResults(data.comparison || {});
    } catch (err) {
      console.error('❌ Error comparing codes:', err);
    }
    setLoading(false);
  };

  return (
    <div className="global-comparator-container">
      <h1>🌍 Global Code Comparator</h1>
      <div className="global-comparator-controls">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a compliance topic (e.g. hospitality, sponsorship)"
          className="global-comparator-dropdown"
        />
        <Select
          isMulti
          className="global-comparator-dropdown"
          options={allCountries}
          placeholder="Select countries or associations..."
          value={selectedCountries}
          onChange={setSelectedCountries}
        />
        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <table className="global-comparator-table">
          <thead>
            <tr>
              <th>Country/Code</th>
              <th>Compliance Rule</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(results).map(([country, rule]) => (
              <tr key={country}>
                <td>{country}</td>
                <td>{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GlobalComparator;
