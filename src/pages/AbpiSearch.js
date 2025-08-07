import React, { useEffect, useRef, useState } from "react";
import "./AbpiSearch.css";

const clauseOptions = [
  "Clause 1", "Clause 2", "Clause 3", "Clause 4", "Clause 5.1", "Clause 5.2", "Clause 6", "Clause 7", "Clause 8", "Clause 9", "Clause 10"
];

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [clause, setClause] = useState("");
  const viewerRef = useRef(null);

  const buildSearchURL = () => {
    const fileURL = "/pdfjs/2024-abpi-code-of-practice.pdf";
    const target = clause || query;
    if (!target) return `/pdfjs/web/viewer.html?file=${fileURL}`;

    // Fuzzy format matching for clause input
    const formatted = target
      .toLowerCase()
      .replace("clause", "")
      .replace(/[^0-9.]/g, "")
      .trim();

    return `/pdfjs/web/viewer.html?file=${fileURL}#search=${encodeURIComponent(
      formatted || query
    )}`;
  };

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.src = buildSearchURL();
    }
  }, [query, clause]);

  return (
    <div className="abpi-search-container">
      <h2 className="abpi-title">📘 ABPI Clause Search</h2>
      <div className="abpi-inputs">
        <input
          type="text"
          placeholder="Search keyword or clause (e.g. gifts or 5.1)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="abpi-input"
        />

        <select
          value={clause}
          onChange={(e) => setClause(e.target.value)}
          className="abpi-dropdown"
        >
          <option value="">-- Select Clause --</option>
          {clauseOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button
          className="abpi-button"
          onClick={() => {
            if (viewerRef.current) {
              viewerRef.current.src = buildSearchURL();
            }
          }}
        >
          Search
        </button>
      </div>

      <div className="abpi-pdf-container">
        <iframe
          ref={viewerRef}
          title="ABPI PDF Viewer"
          width="100%"
          height="800px"
          src={buildSearchURL()}
          style={{ border: "1px solid #ccc", borderRadius: "8px" }}
        ></iframe>
      </div>
    </div>
  );
};

export default AbpiSearch;
