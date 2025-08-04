import React, { useEffect, useState } from 'react';
import './GlobalComparator.css';

const GlobalComparator = () => {
  const [topic, setTopic] = useState('');
  const [selectedCountries, setSelectedCountries] = useState(['', '', '']);
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
          throw new Error('Invalid countries data format');
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries.');
      }
    };

    fetchCountries();
  }, []);

  const handleCompare = async () => {
    setLoading(true);
    setResult(null);
    setError('');

    const selected = selectedCountries.filter(Boolean);
    if (selected.length === 0 || !topic.trim()) {
      setError('Please select at least one country and enter a topic.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://compliance-ai-app.onrender.com/api/comparator/compare/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countries: selected, topic })
      });

      if (!response.ok) {
        throw new Error('Comparison request failed.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error comparing:', err);
      setError('Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (index, value) => {
    const newSelection = [...selectedCountries];
    newSelection[index] = value;
    setSelectedCountries(newSelection);
  };

  const groupedOptions = countries.reduce((acc, curr) => {
    const group = curr.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr.label);
    return acc;
  }, {});

  return (
    <div className="comparator-container">
      <h2>🌍 Global Code Comparator</h2>

      {[0, 1, 2].map((index) => (
        <div key={index}>
          <label>Country {index + 1}</label>
          <select value={selectedCountries[index]} onChange={(e) => handleCountryChange(index, e.target.value)}>
            <option value="">Select a country</option>
            {Object.entries(groupedOptions).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      ))}

      <label>Compliance Topic</label>
      <input
        type="text"
        placeholder="e.g. hospitality, samples..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={handleCompare} disabled={loading}>
        {loading ? 'Comparing...' : 'Compare'}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="results">
          <h3>Results for: {result.topic}</h3>
          <ul>
            {Object.entries(result.comparison).map(([country, res]) => (
              <li key={country}>
                <strong>{country}:</strong> {res}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GlobalComparator;