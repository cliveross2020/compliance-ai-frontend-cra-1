import React, { useState, useEffect } from 'react';
import './PmcaseSearch.css';

const PmcaseSearch = () => {
  const [query, setQuery] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    codeYear: '',
    clause: '',
    appeal: '',
    review: '',
  });

  const fetchCases = async (append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`https://compliance-ai-app.onrender.com/api/cases/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          date_from: filters.dateFrom,
          date_to: filters.dateTo,
          code_year: filters.codeYear ? parseInt(filters.codeYear) : undefined,
          clauses: filters.clause ? [filters.clause] : [],
          appeal: filters.appeal,
          review: filters.review,
          limit: 6,
          offset: append ? offset : 0,
        }),
      });

      const data = await res.json();
      if (data && data.results) {
        setCases(prev => append ? [...prev, ...data.results] : data.results);
        setOffset(prev => append ? prev + data.results.length : data.results.length);
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
  // define inline to avoid dependency issue
  const loadInitial = () => fetchCases(false);
  loadInitial();
  }, []); 

  return (
    <div className="pmcase-container">
      <h1>📁 PMCPA Case Search</h1>

      <form onSubmit={handleSearch} className="pmcase-form">
        <input
          type="text"
          value={query}
          placeholder="Search title, summary, etc..."
          onChange={(e) => setQuery(e.target.value)}
          className="pmcase-input"
        />

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="pmcase-input"
          placeholder="From date"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="pmcase-input"
          placeholder="To date"
        />

        <input
          type="text"
          value={filters.codeYear}
          placeholder="Code Year (e.g. 2021)"
          onChange={(e) => setFilters({ ...filters, codeYear: e.target.value })}
          className="pmcase-input"
        />

        <input
          type="text"
          value={filters.clause}
          placeholder="Clause (e.g. 5.1)"
          onChange={(e) => setFilters({ ...filters, clause: e.target.value })}
          className="pmcase-input"
        />

        <select
          value={filters.appeal}
          onChange={(e) => setFilters({ ...filters, appeal: e.target.value })}
          className="pmcase-input"
        >
          <option value="">Appeal?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <select
          value={filters.review}
          onChange={(e) => setFilters({ ...filters, review: e.target.value })}
          className="pmcase-input"
        >
          <option value="">Review?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <button type="submit" className="pmcase-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="pmcase-results">
        {cases.length === 0 && !loading && <p>No cases found.</p>}
        {cases.map((c, idx) => (
          <div key={idx} className="pmcase-card">
            <h3>{c.title || c.case_number}</h3>
            <p><strong>Completed:</strong> {c.completed || 'N/A'}</p>
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
