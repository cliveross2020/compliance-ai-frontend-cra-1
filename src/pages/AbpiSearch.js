// src/components/AbpiClauseSearch.js
import React, { useState, useEffect, useRef } from 'react';
import './AbpiClauseSearch.css';

const CLAUSE_LIST = [
  '1', '2', '3', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2', '7.1', '7.2', '18.1', '18.2', '24.1', '24.2', // etc...
];

const AbpiClauseSearch = () => {
  const [query, setQuery] = useState('');
  const [clause, setClause] = useState('');
  const [results, setResults] = useState([]);
  const iframeRef = useRef();

  const handleSearch = async () => {
    const res = await fetch(`/api/abpi/search?query=${encodeURIComponent(query)}&clause=${clause}`);
    const data = await res.json();
    setResults(data.results);
  };

  const scrollToClause = (targetClause) => {
    const clauseAnchor = encodeURIComponent(targetClause.replace(/\./g, '-'));
    iframeRef.current?.contentWindow?.postMessage({ type: 'scrollToClause', clause: clauseAnchor }, '*');
  };

  useEffect(() => {
    const listener = (event) => {
      if (event.data?.type === 'pdfReady' && clause) {
        scrollToClause(clause);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [clause]);

  return (
    <div className="abpi-search-wrapper">
      <div className="search-controls">
        <input
          placeholder="Search ABPI (e.g. 'gifts')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={clause} onChange={(e) => setClause(e.target.value)}>
          <option value="">-- Select Clause --</option>
          {CLAUSE_LIST.map((c) => (
            <option key={c} value={c}>{`Clause ${c}`}</option>
          ))}
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="results">
        {results.map((res, idx) => (
          <div key={idx} className="result-box">
            <div className="clause-heading">Clause {res.clause}</div>
            <div className="snippet">{res.text}</div>
            <button onClick={() => scrollToClause(res.clause)}>View in PDF</button>
          </div>
        ))}
      </div>

      <div className="pdf-viewer-container">
        <iframe
          title="ABPI PDF"
          ref={iframeRef}
          src="/pdfjs/web/viewer.html?file=/pdfjs/2024-abpi-code-of-practice.pdf"
          width="100%"
          height="800px"
          onLoad={() => {
            if (clause) scrollToClause(clause);
          }}
        />
      </div>
    </div>
  );
};

export default AbpiClauseSearch;
