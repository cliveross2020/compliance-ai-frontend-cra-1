import React, { useState } from 'react';
import axios from 'axios';

function AbpiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const AbpiResultItem = ({ result }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="result-card">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              {result.clauseNumber}: {result.title}
            </h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-green-700 hover:underline focus:outline-none"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {expanded && (
          <div className="mt-3">
            <div className="clause-text">
              <strong>Clause Text:</strong>{' '}
              {result.fullText || 'Clause text not available.'}
            </div>
            <div className="ai-summary">
              💡 <strong>AI Summary:</strong>{' '}
              {result.aiSummary || 'Summary not available yet.'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="AbpiSearch">
      <h2>ABPI Clause Search</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clauses..."
        />
        <button type="submit">Search</button>
      </form>

      <div className="results">
        {loading ? (
          <p>Loading results...</p>
        ) : results.length > 0 ? (
          results.map((res, idx) => (
            <AbpiResultItem key={idx} result={res} />
          ))
        ) : (
          <p className="text-gray-400 italic">No results yet. Try a search above.</p>
        )}
      </div>
    </div>
  );
}

export default AbpiSearch;
