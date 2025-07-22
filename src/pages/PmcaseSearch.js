import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css';

function PmcaseSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/cases/search', { query: query.trim() });
      setResults(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Main PmcaseSearch">
      <h2>📂 PMCPA Case Search</h2>

      <form onSubmit={handleSearch} className="AbpiSearch-form">
        <label htmlFor="caseQuery">Search</label>
        <input
          id="caseQuery"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter keywords, case number or company..."
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="text-sm text-gray-600 mt-4">Loading...</p>}
      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {!loading && !results.length && query && (
        <p className="text-gray-400 italic mt-4">No results found for "{query}".</p>
      )}

      {results.length > 0 && (
        <div className="PageContainer mt-6">
          <table className="min-w-full table-auto border border-gray-300 shadow-sm rounded-lg">
            <thead className="bg-green-900 text-white text-sm">
              <tr>
                <th className="p-3 text-left">Case No</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Clauses</th>
                <th className="p-3 text-left">Summary</th>
                <th className="p-3 text-left">Link</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => (
                <tr key={idx} className="border-t text-sm">
                  <td className="p-2">{item.case_number}</td>
                  <td className="p-2">{item.company}</td>
                  <td className="p-2 whitespace-pre-wrap">{item.clauses || '—'}</td>
                  <td className="p-2 whitespace-pre-wrap">{item.summary}</td>
                  <td className="p-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PmcaseSearch;
