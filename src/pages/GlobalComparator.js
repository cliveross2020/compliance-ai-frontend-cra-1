import React, { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './GlobalComparator.css';

const EFPIA_COUNTRIES = [
  'Germany', 'France', 'Spain', 'Italy', 'Belgium', 'Netherlands',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal'
];

const IFPMA_ASSOCIATIONS = [
  'USA', 'Canada', 'Japan', 'Australia', 'India', 'South Korea',
  'Brazil', 'South Africa'
];

const COMPLIANCE_TOPICS = [
  'Promotion', 'Clinical Trials', 'Digital Materials',
  'Sponsorship', 'Transparency'
];

const GlobalComparator = () => {
  const [selectedEFPIA, setSelectedEFPIA] = useState([]);
  const [selectedIFPMA, setSelectedIFPMA] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const formatOptions = (list) => list.map(name => ({ label: name, value: name }));

  const handleCompare = async () => {
    const countries = ['UK', ...selectedEFPIA.map(o => o.value), ...selectedIFPMA.map(o => o.value)];
    if (!selectedTopic) return;

    setLoading(true);
    try {
      const response = await axios.post('https://compliance-ai-app.onrender.com/api/compare/global', {
        countries,
        topic: selectedTopic.value,
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
        <div className="dropdown-group">
          <label>EFPIA National Codes</label>
          <Select
            options={formatOptions(EFPIA_COUNTRIES)}
            isMulti
            value={selectedEFPIA}
            onChange={setSelectedEFPIA}
            className="react-select"
          />
        </div>

        <div className="dropdown-group">
          <label>IFPMA Associations</label>
          <Select
            options={formatOptions(IFPMA_ASSOCIATIONS)}
            isMulti
            value={selectedIFPMA}
            onChange={setSelectedIFPMA}
            className="react-select"
          />
        </div>

        <div className="dropdown-group">
          <label>Compliance Topic</label>
          <Select
            options={formatOptions(COMPLIANCE_TOPICS)}
            value={selectedTopic}
            onChange={setSelectedTopic}
            className="react-select"
          />
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
              {['UK', ...selectedEFPIA.map(o => o.value), ...selectedIFPMA.map(o => o.value)].map(c => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedTopic.value}</td>
              {['UK', ...selectedEFPIA.map(o => o.value), ...selectedIFPMA.map(o => o.value)].map(c => (
                <td key={c}>{results[c] || 'No data available'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GlobalComparator;
