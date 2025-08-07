import React, { useState } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";

const clauseToPageMap = {
  "clause 1": 6,
  "clause 2": 7,
  "clause 3": 9,
  "clause 4": 11,
  "clause 5.1": 13,
  "clause 5": 13,
  "clause 6": 15,
  // ✅ Add more known clause-page mappings here
};

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [iframeSrc, setIframeSrc] = useState("/abpi/2024-abpi-code-of-practice.pdf");

  const handleSearch = () => {
    const cleaned = query.trim().toLowerCase();
    const matchedClause = Object.keys(clauseToPageMap).find((key) =>
      cleaned.includes(key)
    );

    if (matchedClause) {
      const page = clauseToPageMap[matchedClause];
      setIframeSrc(`/abpi/2024-abpi-code-of-practice.pdf#page=${page}`);
    } else {
      // Default to full PDF if no match
      setIframeSrc("/abpi/2024-abpi-code-of-practice.pdf");
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
          placeholder="Search the 2024 ABPI Code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="abpi-input"
        />
        <button onClick={handleSearch} className="abpi-button">
          Search
        </button>
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
            Try searching for a clause like <strong>Clause 5.1</strong>, or just browse the code above.
          </p>
        )}
      </div>
    </div>
  );
};

export default AbpiSearch;
