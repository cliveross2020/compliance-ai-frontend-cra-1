import React, { useState } from 'react';
import './PmcaseSearch.css';

const PmcaseSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('https://compliance-ai-app.onrender.com/api/cases/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setError('Unexpected response format.');
      }
    } catch (err) {
      console.error(err);
      setError('❌ Error fetching cases.');
    }

    setLoading(false);
  };

  return (
    <div className="pmcpa-search-container">
      <h1>🔍 PMCPA Case Search</h1>
      <p className="subtitle">Search completed PMCPA cases by keyword (e.g., product, clause, company)</p>

      <form onSubmit={handleSearch} className="pmcpa-search-form">
        <input
          type="text"
          value={query}
          placeholder="e.g., diabetes, Clause 2, GSK"
          onChange={(e) => setQuery(e.target.value)}
          className="pmcpa-search-input"
        />
        <button type="submit" className="pmcpa-search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="pmcpa-error">{error}</div>}

      <div className="pmcpa-results">
        {results.length > 0 && (
          <table className="pmcpa-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Company</th>
                <th>Title</th>
                <th>Date</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {results.map((caseItem, index) => (
                <tr key={index}>
                  <td>{caseItem.case_number}</td>
                  <td>{caseItem.company}</td>
                  <td>{caseItem.title}</td>
                  <td>{caseItem.date || 'N/A'}</td>
                  <td>
                    <a href={caseItem.link} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && results.length === 0 && query && !error && (
          <p>No results found for "{query}".</p>
        )}
      </div>
    </div>
  );
};

export default PmcaseSearch;
