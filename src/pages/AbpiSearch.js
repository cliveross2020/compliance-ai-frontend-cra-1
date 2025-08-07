import React, { useState } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";

// Page numbers are examples — adjust if needed
const clauseToPageMap = {
  "1": 6,
  "2": 7,
  "3": 9,
  "4": 11,
  "5": 12,
  "5.1": 13,
  "5.2": 14,
  "6": 15,
  "7": 16,
  "8": 17,
  "9": 18,
  "10": 20,
  // Add more clauses here as needed
};

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [iframeSrc, setIframeSrc] = useState("/abpi/2024-abpi-code-of-practice.pdf");

  const normalizeClause = (input) => {
    return input
      .toLowerCase()
      .replace("clause", "")
      .replace(/\s+/g, "")
      .replace(/\.+$/, ""); // remove trailing dots
  };

  const handleSearch = () => {
    const cleaned = normalizeClause(query);
    const matchedPage = clauseToPageMap[cleaned];

    if (matchedPage) {
      setIframeSrc(`/abpi/2024-abpi-code-of-practice.pdf#page=${matchedPage}`);
    } else {
      setIframeSrc("/abpi/2024-abpi-code-of-practice.pdf");
    }
  };

  const handleDropdownChange = (e) => {
    const selectedClause = e.target.value;
    setQuery(`Clause ${selectedClause}`);
    const page = clauseToPageMap[selectedClause];
    if (page) {
      setIframeSrc(`/abpi/2024-abpi-code-of-practice.pdf#page=${page}`);
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
          placeholder="Search clause (e.g. 5.1, Clause 6)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="abpi-input"
        />
        <button onClick={handleSearch} className="abpi-button">
          Search
        </button>
      </div>

      <div className="abpi-dropdown-wrapper">
        <label htmlFor="clause-select" className="abpi-dropdown-label">
          Or select a clause:
        </label>
        <select
          id="clause-select"
          className="abpi-dropdown"
          onChange={handleDropdownChange}
          defaultValue=""
        >
          <option value="" disabled>
            -- Select Clause --
          </option>
          {Object.keys(clauseToPageMap).map((clause) => (
            <option key={clause} value={clause}>
              Clause {clause}
            </option>
          ))}
        </select>
      </div>

      <div className="abpi-results">
        <iframe
          src={iframeSrc}
          width="100%"
          height="900px"
          style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          title="ABPI 2024 PDF"
        ></iframe>

        {!query && (
          <p className="abpi-placeholder">
            Try searching for a clause like <strong>5.1</strong> or use the dropdown above.
          </p>
        )}
      </div>
    </div>
  );
};

export default AbpiSearch;
