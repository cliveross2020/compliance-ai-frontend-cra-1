import React, { useState } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";

const CLAUSES = [
  "Clause 1", "Clause 2", "Clause 3", "Clause 4",
  "Clause 5", "Clause 5.1", "Clause 6", "Clause 7", "Clause 8",
  "Digital", "Gifts", "Sponsorship", "Transfers of Value"
];

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedClause, setSelectedClause] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    const term = selectedClause || query;
    if (term.trim()) {
      setSearchTerm(term.trim());
    }
  };

  return (
    <div className="abpi-search-container">
      <div className="abpi-header">
        <img src={caiLogo} alt="CAI Logo" className="abpi-logo" />
        <h2>ABPI Clause Search</h2>
      </div>

      <div className="abpi-input-row">
        <input
          type="text"
          placeholder="Search clause (e.g. 5.1, Clause 2, gifts)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedClause(""); // reset dropdown
          }}
          className="abpi-input"
        />
        <button onClick={handleSearch} className="abpi-button">
          Search
        </button>
      </div>

      <div className="abpi-input-row">
        <select
          className="abpi-dropdown"
          value={selectedClause}
          onChange={(e) => {
            setSelectedClause(e.target.value);
            setQuery(""); // reset input
          }}
        >
          <option value="">-- Select Clause --</option>
          {CLAUSES.map((clause) => (
            <option key={clause} value={clause}>
              {clause}
            </option>
          ))}
        </select>
      </div>

      {searchTerm && (
        <div className="abpi-pdf-viewer">
          <iframe
            title="ABPI PDF"
            width="100%"
            height="600px"
            src={`/pdfjs/web/viewer.html?file=/2024-abpi-code-of-practice.pdf#search=${encodeURIComponent(
              searchTerm
            )}`}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default AbpiSearch;
