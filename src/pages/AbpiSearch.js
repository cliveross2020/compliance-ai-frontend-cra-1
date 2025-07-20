import React, { useState } from 'react';
import axios from 'axios';

function AbpiSearch() {
  const [query, setQuery] = useState('');
  const [filterClauses, setFilterClauses] = useState([]);
  const [filterTopics, setFilterTopics] = useState([]);
  const [filterAudience, setFilterAudience] = useState([]);
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://compliance-ai-backend.onrender.com/api/search/abpi', {
        query,
        filter_clauses: filterClauses,
        filter_topics: filterTopics,
        filter_audience: filterAudience,
      });
      setResults(response.data.results);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  return (
    <div className="PageContainer AbpiSearch">
      <h2>ABPI Code Search</h2>
      <form onSubmit={handleSearch}>
        <label>Search Query</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., promotional material"
        />

        <label>Filter by Clauses</label>
        <select multiple value={filterClauses} onChange={(e) => setFilterClauses([...e.target.selectedOptions].map(o => o.value))}>
          <option value="Clause 1">Clause 1</option>
          <option value="Clause 2">Clause 2</option>
          <option value="Clause 3">Clause 3</option>
          <option value="Clause 4">Clause 4</option>
        </select>

        <label>Filter by Topics</label>
        <select multiple value={filterTopics} onChange={(e) => setFilterTopics([...e.target.selectedOptions].map(o => o.value))}>
          <option value="promotional materials">promotional materials</option>
          <option value="hospitality">hospitality</option>
          <option value="sponsorship">sponsorship</option>
          <option value="digital communication">digital communication</option>
        </select>

        <label>Filter by Audience</label>
        <select multiple value={filterAudience} onChange={(e) => setFilterAudience([...e.target.selectedOptions].map(o => o.value))}>
          <option value="HCP">HCP</option>
          <option value="Patient">Patient</option>
          <option value="Internal">Internal</option>
        </select>

        <button type="submit">Search</button>
      </form>

      <div className="results">
        {results.map((item, index) => (
          <div key={index} className="result-item">
            <strong>{item.id}</strong>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AbpiSearch;
