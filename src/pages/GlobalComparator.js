import React, { useState } from 'react';
import axios from 'axios';
import './GlobalComparator.css';

const EFPIA_COUNTRIES = [
  'Germany', 'France', 'Spain', 'Italy', 'Belgium', 'Netherlands',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal',
];

const IFPMA_ASSOCIATIONS = [
  'USA', 'Canada', 'Japan', 'Australia', 'India', 'South Korea', 'Brazil', 'South Africa',
];

const COMPLIANCE_TOPICS = [
  'Promotion', 'Clinical Trials', 'Digital Materials', 'Sponsorship', 'Transparency'
];

function GlobalComparator() {
  const [selectedEFPIA, setSelectedEFPIA] = useState([]);
  const [selectedIFPMA, setSelectedIFPMA] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    const countries = ['UK', ...selectedEFPIA, ...selectedIFPMA];
    if (!selectedTopic) return;

    setLoading(true);
    try {
      const response = await axios.post('https://compliance-ai-app.onrender.com/api/compare/global', {
        countries,
        topic: selectedTopic,
      });
      setResults(response.data.comparison || {});
    } catch (error) {
      console.error('Comparison failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-comparator-container">
      <h1>🌍 Global Code Comparator</h1>

      <div className="global-comparator-controls">
        <div>
          <label>EFPIA National Codes</label>
          <select
            multiple
            value={selectedEFPIA}
            onChange={(e) => setSelectedEFPIA(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {EFPIA_COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label>IFPMA Associations</label>
          <select
            multiple
            value={selectedIFPMA}
            onChange={(e) => setSelectedIFPMA(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {IFPMA_ASSOCIATIONS.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Compliance Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">Select topic...</option>
            {COMPLIANCE_TOPICS.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <table className="global-comparator-table">
          <thead>
            <tr>
              <th>Topic</th>
              {['UK', ...selectedEFPIA, ...selectedIFPMA].map(c => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedTopic}</td>
              {['UK', ...selectedEFPIA, ...selectedIFPMA].map(c => (
                <td key={c}>{results[c] || '—'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GlobalComparator;
