import React, { useState } from 'react';
import axios from 'axios';

function GlobalComparator() {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!selectedCountries.length || !selectedTopic) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/compare/global', {
        countries: selectedCountries,
        topic: selectedTopic,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Comparison failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Main">
      <h2>Global Code Comparator</h2>

      <div className="comparator-form">
        <label htmlFor="countries">Select Countries:</label>
        <select
          id="countries"
          multiple
          value={selectedCountries}
          onChange={(e) =>
            setSelectedCountries(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
        >
          <option value="UK">UK</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Spain">Spain</option>
          <option value="Italy">Italy</option>
        </select>

        <label htmlFor="topic">Select Compliance Topic:</label>
        <select
          id="topic"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Select...</option>
          <option value="Promotion">Promotion</option>
          <option value="Clinical Trials">Clinical Trials</option>
          <option value="Digital Materials">Digital Materials</option>
        </select>

        <button className="compare-btn" onClick={handleCompare}>
          Compare
        </button>
      </div>

      {loading && <p>Loading comparison...</p>}

      {Object.keys(results).length > 0 && (
        <div className="PageContainer">
          <table className="min-w-full table-auto border border-gray-200 rounded-xl shadow-sm">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="p-3 text-left">Topic</th>
                {selectedCountries.map((country) => (
                  <th key={country} className="p-3 text-left">{country}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 font-medium">{selectedTopic}</td>
                {selectedCountries.map((country) => (
                  <td key={country} className="p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {results[selectedTopic]?.[country] || '—'}
                  </td>
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
