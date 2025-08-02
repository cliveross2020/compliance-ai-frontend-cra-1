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
    if (!countries.length || !selectedTopic) return;

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
      <h2 className="title">🌐 Global Code Comparator</h2>

      <div className="comparator-section">
        <div className="selector-group">
          <label>EFPIA National Codes:</label>
          <select multiple value={selectedEFPIA} onChange={(e) =>
            setSelectedEFPIA(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }>
            {EFPIA_COUNTRIES.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label>IFPMA Associations:</label>
          <select multiple value={selectedIFPMA} onChange={(e) =>
            setSelectedIFPMA(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }>
            {IFPMA_ASSOCIATIONS.map((assoc) => (
              <option key={assoc} value={assoc}>{assoc}</option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label>Compliance Topic:</label>
          <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            <option value="">Select...</option>
            {COMPLIANCE_TOPICS.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <button onClick={handleCompare} className="compare-btn">
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                {['UK', ...selectedEFPIA, ...selectedIFPMA].map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedTopic}</td>
                {['UK', ...selectedEFPIA, ...selectedIFPMA].map((c) => (
                  <td key={c}>{results[c] || '—'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GlobalComparator;
