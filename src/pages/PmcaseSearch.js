import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css'; // Global styles

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
      const response = await axios.post('/api/cases/search', {
        query: query.trim(),
      });

      setResults(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Main">
      <h1>PMCPA Case Search</h1>

      <form onSubmit={handleSearch} className="AbpiSearch-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PMCPA cases..."
          className="border p-2 rounded mr-2"
        />
        <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {results.length > 0 && (
        <div className="PageContainer">
          <table className="min-w-full table-auto border border-gray-300 shadow-sm rounded-lg mt-6">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="p-3 text-left">Case No</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Clauses</th>
                <th className="p-3 text-left">Summary</th>
                <th className="p-3 text-left">Link</th>
              </tr>
            </thead>
            <tbody>
              {results.map((caseItem, idx) => (
                <tr key={idx} className="border-t text-sm">
                  <td className="p-2">{caseItem.case_number}</td>
                  <td className="p-2">{caseItem.company}</td>
                  <td className="p-2 whitespace-pre-wrap">{caseItem.clauses || '—'}</td>
                  <td className="p-2 whitespace-pre-wrap">{caseItem.summary}</td>
                  <td className="p-2">
                    <a
                      href={caseItem.url}
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

      {!loading && !results.length && query && (
        <p className="text-gray-400 italic mt-4">No results found for "{query}".</p>
      )}
    </div>
  );
}

export default PmcaseSearch;
