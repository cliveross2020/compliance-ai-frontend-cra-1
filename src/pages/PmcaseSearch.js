import React, { useState, useEffect } from 'react';
import './PmcaseSearch.css';

const PmcaseSearch = () => {
  const [query, setQuery] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchCases = async (append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`https://compliance-ai-app.onrender.com/api/cases/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          limit: 6,
          offset: append ? offset : 0,
        }),
      });

      const data = await res.json();
      if (data && data.results) {
        setCases((prev) => append ? [...prev, ...data.results] : data.results);
        setOffset((prev) => prev + data.results.length);
        setHasMore(data.results.length === 6);
      }
    } catch (err) {
      console.error('❌ Error fetching cases:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchCases(false);
  };

  const handleLoadMore = () => {
    fetchCases(true);
  };

  useEffect(() => {
    fetchCases(false); // Initial load
  }, []);

  return (
    <div className="pmcase-container">
      <h1>📁 PMCPA Case Search</h1>
      <form onSubmit={handleSearch} className="pmcase-form">
        <input
          type="text"
          value={query}
          placeholder="Search for clauses, keywords, company, etc..."
          onChange={(e) => setQuery(e.target.value)}
          className="pmcase-input"
        />
        <button type="submit" className="pmcase-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="pmcase-results">
        {cases.length === 0 && !loading && <p>No cases found.</p>}
        {cases.map((c, idx) => (
          <div key={idx} className="pmcase-card">
            <h3>{c.title || c.case_number}</h3>
            <p><strong>Company:</strong> {c.company}</p>
            <p><strong>Date:</strong> {c.date}</p>
            <p><strong>Summary:</strong> {c.summary?.slice(0, 300)}{c.summary?.length > 300 ? '...' : ''}</p>
            <a href={c.url} target="_blank" rel="noopener noreferrer">🔗 View full case</a>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="pmcase-loadmore">
          <button onClick={handleLoadMore} className="pmcase-button" disabled={loading}>
            {loading ? 'Loading...' : 'View More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PmcaseSearch;
