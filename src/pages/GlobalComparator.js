// GlobalComparator.js (Dropdown logic updated for /countries endpoint)
import React, { useEffect, useState } from 'react';
import './GlobalComparator.css';

const GlobalComparator = () => {
  const [topic, setTopic] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://compliance-ai-app.onrender.com/api/comparator/countries');
        const data = await res.json();
        if (data.countries) {
          setCountries(data.countries);
        } else {
          throw new Error('No countries found');
        }
      } catch (err) {
        setError('Failed to load countries.');
        console.error('Error fetching countries:', err);
      }
    };
    fetchCountries();
  }, []);

  const handleCompare = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('https://compliance-ai-app.onrender.com/api/comparator/compare/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, countries: selectedCountries })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCountries(values);
  };

  return (
    <div className="comparator-container">
      <h2>🌍 Global Code Comparator</h2>
      <input
        type="text"
        placeholder="Enter a compliance topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <select multiple value={selectedCountries} onChange={handleSelectChange}>
        {countries.map((c, idx) => (
          <option key={idx} value={c.label}>{c.label} ({c.group})</option>
        ))}
      </select>
      <button onClick={handleCompare} disabled={loading}>
        {loading ? 'Comparing...' : 'Compare'}
      </button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="results">
          <h3>Results for: {result.topic}</h3>
          <ul>
            {Object.entries(result.comparison).map(([country, text], idx) => (
              <li key={idx}><strong>{country}:</strong> {text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GlobalComparator;
