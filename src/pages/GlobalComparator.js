// GlobalComparator.js
import React, { useState } from 'react';
import Select from 'react-select';
import './GlobalComparator.css';

const efpiaCountries = [
  { value: 'UK', label: 'UK' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Spain', label: 'Spain' },
  // add more from EFPIA as needed
];

const ifpmaCountries = [
  { value: 'USA', label: 'USA' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Australia', label: 'Australia' },
  { value: 'India', label: 'India' },
  // add more from IFPMA as needed
];

export default function GlobalComparator() {
  const [topic, setTopic] = useState('');
  const [efpia, setEfpia] = useState(null);
  const [ifpma, setIfpma] = useState(null);
  const [abpi] = useState({ value: 'UK', label: 'UK (ABPI)' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!topic || !efpia || !ifpma) return;
    setLoading(true);
    try {
      const res = await fetch('https://compliance-ai-app.onrender.com/api/compare/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          countries: [abpi.value, efpia.value, ifpma.value]
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error('Comparison failed:', e);
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <div className="global-comparator-container">
      <h1>🌍 Global Code Comparator</h1>
      <div className="global-comparator-controls">
        <input
          className="global-comparator-dropdown"
          type="text"
          placeholder="Enter a compliance topic (e.g. Promotion)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Select
          options={efpiaCountries}
          placeholder="EFPIA National Code"
          className="global-comparator-dropdown"
          onChange={setEfpia}
        />
        <Select
          options={ifpmaCountries}
          placeholder="IFPMA Association"
          className="global-comparator-dropdown"
          onChange={setIfpma}
        />
        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {result && (
        <table className="global-comparator-table">
          <thead>
            <tr>
              <th>Topic</th>
              {result.results.map((r, i) => (
                <th key={i}>{r.country}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{topic}</td>
              {result.results.map((r, i) => (
                <td key={i}>{r.summary || 'No data available for this topic'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
