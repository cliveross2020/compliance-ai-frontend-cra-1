import React, { useEffect, useState } from 'react';
import './GlobalComparator.css';

const GlobalComparator = () => {
  const [topic, setTopic] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['', '', '']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const countriesUrl = 'https://compliance-ai-app.onrender.com/api/comparator/countries';
  const compareUrl = 'https://compliance-ai-app.onrender.com/api/comparator/compare/global';

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(countriesUrl);
        const data = await res.json();
        if (data.countries && Array.isArray(data.countries)) {
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
    setError('');
    setResult(null);

    const filteredCountries = selectedCountries.filter(Boolean);

    if (!topic || filteredCountries.length === 0) {
      setError('Please enter a topic and select at least one country.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(compareUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, countries: filteredCountries }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      console.log('Comparison result:', data);
      setResult(data.comparison);
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Failed to fetch comparison results.');
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (label, index) => (
    <div className="dropdown-container" key={index}>
      <label>{label}</label>
      <select
        value={selectedCountries[index]}
        onChange={(e) => {
          const updated = [...selectedCountries];
          updated[index] = e.target.value;
          setSelectedCountries(updated);
        }}
      >
        <option value="">Select a country</option>
        {countries.map((item, idx) => (
          <option key={idx} value={item.label}>
            {item.label} {item.group ? `(${item.group})` : ''}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="global-comparator">
      <h2>🌍 Global Code Comparator</h2>

      <div className="input-section">
        {['Country 1', 'Country 2', 'Country 3'].map((label, i) => renderDropdown(label, i))}

        <div className="input-container">
          <label>Compliance Topic</label>
          <input
            type="text"
            placeholder="e.g. hospitality, samples..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {result && (
        <div className="results-section">
          <h3>Comparison Results</h3>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Policy Summary</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([country, text]) => (
                <tr key={country}>
                  <td>{country}</td>
                  <td>{text}</td>
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
