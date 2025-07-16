import React, { useState } from 'react';

function ABPISearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const response = await fetch('/api/search/abpi', {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    setResults(data.results);
  };

  return (
    <div className="component">
      <h2>ABPI Code of Practice Search</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search ABPI clauses"
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default ABPISearch;