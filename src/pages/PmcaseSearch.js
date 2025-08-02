import React, { useState, useEffect } from 'react';
import './PmcaseSearch.css';

const PmcaseSearch = () => {
  const [query, setQuery] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedSummaries, setExpandedSummaries] = useState({});

  const [filters, setFilters] = useState({
    codeYear: '',
    completedYear: '',
    clause: '',
    appeal: '',
    company: '',
  });

  const fetchCases = async (append = false) => {
    setLoading(true);
    try {
      const requestBody = {
        query,
        clauses: filters.clause ? [filters.clause] : [],
        code_year: filters.codeYear ? parseInt(filters.codeYear) : undefined,
        completed_year: filters.completedYear ? parseInt(filters.completedYear) : undefined,
        appeal: filters.appeal || undefined,
        company: filters.company || undefined,
        limit: 6,
        offset: append ? offset : 0,
      };

      const res = await fetch(`https://compliance-ai-app.onrender.com/api/cases/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="pmcase-container">
      <img src="/assets/CAI Logo 2.png" alt="Compliance AI" className="pmcase-logo" />
      <h1>PMCPA Case Search</h1>

      <form onSubmit={handleSearch} className="pmcase-form">
        <input
          type="text"
          value={query}
          placeholder="Search title, summary, etc..."
          onChange={(e) => setQuery(e.target.value)}
          className="pmcase-input"
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
          value={filters.completedYear}
          placeholder="Completed Year (e.g. 2023)"
          onChange={(e) => setFilters({ ...filters, completedYear: e.target.value })}
          className="pmcase-input"
        />

        <input
          type="text"
          value={filters.company}
          placeholder="Company (e.g. AstraZeneca)"
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
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

        <button type="submit" className="pmcase-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="pmcase-results">
        {cases.length === 0 && !loading && <p>No cases found.</p>}
        {cases.map((c, idx) => {
          const isExpanded = expandedSummaries[idx];
          const toggleSummary = () => setExpandedSummaries(prev => ({ ...prev, [idx]: !prev[idx] }));

          return (
            <div key={idx} className="pmcase-card">
              <h3>{c.case_number || c.title}</h3>
              <p><strong>Title:</strong> {c.title || 'N/A'}</p>
              <p><strong>Breach Clauses:</strong> {c.breach_clauses || 'N/A'}</p>
              <p><strong>No Breach Clauses:</strong> {c.no_breach_clauses || 'N/A'}</p>
              <p><strong>Applicable Code Year:</strong> {c.applicable_code_year || 'N/A'}</p>
              <p><strong>Completed:</strong> {formatDate(c.completed)}</p>
              <p><strong>Appeal:</strong> {c.appeal || 'N/A'}</p>
              <p><strong>Summary:</strong> {isExpanded ? c.summary : c.summary_short || 'N/A'}</p>
              {c.summary && c.summary.length > 300 && (
                <button onClick={toggleSummary} className="pmcase-toggle-summary">
                  {isExpanded ? 'Show less' : 'Show full summary'}
                </button>
              )}
              <a href={c.url} target="_blank" rel="noopener noreferrer">🔗 View full case</a>
            </div>
          );
        })}
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
