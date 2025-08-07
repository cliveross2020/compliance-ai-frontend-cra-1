import React, { useState, useRef } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const iframeRef = useRef(null);

  const handleSearch = () => {
    if (!query.trim()) return;

    const iframeWindow = iframeRef.current?.contentWindow;
    if (iframeWindow) {
      iframeWindow.PDFViewerApplication?.eventBus?.dispatch("find", {
        query,
        type: "again",
        caseSensitive: false,
        findPrevious: false,
        highlightAll: true,
      });
    }
  };

  return (
    <div className="abpi-search-container">
      <div className="abpi-header">
        <img src={caiLogo} alt="Compliance AI Logo" className="abpi-logo" />
        <h2>ABPI Clause Search</h2>
      </div>

      <div className="abpi-input-row">
        <input
          type="text"
          placeholder="Search clause or keyword (e.g. gifts, Clause 5.1)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="abpi-input"
        />
        <button onClick={handleSearch} className="abpi-button">
          Search
        </button>
      </div>

      <div className="abpi-pdf-viewer">
        <iframe
          ref={iframeRef}
          title="ABPI Code PDF"
          src="/pdfjs/web/viewer.html?file=/pdfjs/2024-abpi-code-of-practice.pdf"
          width="100%"
          height="800px"
        ></iframe>
      </div>
    </div>
  );
};

export default AbpiSearch;
