import React, { useState } from 'react';
import axios from 'axios';

const AbpiSearch = () => {
  const [query, setQuery] = useState('');
  const [filterClauses, setFilterClauses] = useState([]);
  const [filterTopics, setFilterTopics] = useState([]);
  const [filterAudience, setFilterAudience] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const clauseOptions = ['Clause 1', 'Clause 2', 'Clause 3', 'Clause 4', 'Clause 5'];
  const topicOptions = ['promotional_materials', 'hospitality', 'sponsorship', 'digital_communication'];
  const audienceOptions = ['HCP', 'Patient', 'Internal'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/search/abpi`, {
        query,
        filter_clauses: filterClauses,
        filter_topics: filterTopics,
        filter_audience: filterAudience,
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelect = (event, setter) => {
    const selected = Array.from(event.target.selectedOptions, option => option.value);
    setter(selected);
  };

  return (
    <div className="Main">
      <div className="Comparator">
        <h2>ABPI Code Search</h2>
        <form className="Comparator-form" onSubmit={handleSubmit}>
          <label htmlFor="query">Search Query</label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., promotional material"
          />

          <label htmlFor="clauses">Filter by Clauses</label>
          <select id="clauses" multiple value={filterClauses} onChange={(e) => handleMultiSelect(e, setFilterClauses)}>
            {clauseOptions.map((clause) => (
              <option key={clause} value={clause}>{clause}</option>
            ))}
          </select>

          <label htmlFor="topics">Filter by Topics</label>
          <select id="topics" multiple value={filterTopics} onChange={(e) => handleMultiSelect(e, setFilterTopics)}>
            {topicOptions.map((topic) => (
              <option key={topic} value={topic}>{topic.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <label htmlFor="audience">Filter by Audience</label>
          <select id="audience" multiple value={filterAudience} onChange={(e) => handleMultiSelect(e, setFilterAudience)}>
            {audienceOptions.map((aud) => (
              <option key={aud} value={aud}>{aud}</option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="Comparator-results">
            <h3>Search Results</h3>
            <ul>
              {results.map((item, index) => (
                <li key={index} style={{ marginBottom: '1rem' }}>
                  <strong>{item.id}</strong>: {item.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbpiSearch;
