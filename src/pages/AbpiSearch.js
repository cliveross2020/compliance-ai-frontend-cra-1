import React, { useState, useRef } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const iframeRef = useRef(null);

  const handleSearch = () => {
    if (!query.trim()) return;

    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow) return;

    const pdfApp = iframeWindow.PDFViewerApplication;

    // Dispatch a fresh search
    pdfApp?.eventBus?.dispatch("find", {
      query,
      type: "",
      caseSensitive: false,
      findPrevious: false,
      highlightAll: true,
    });

    // Reset match counter
    setMatchIndex(0);

    // Listen for match count
    const updateMatches = (e) => {
      const total = e.matchesCount?.total || 0;
      setMatchCount(total);
    };

    // Remove existing listener to avoid duplicates
    pdfApp?.eventBus?.off("updatefindmatchescount", updateMatches);
    pdfApp?.eventBus?.on("updatefindmatchescount", updateMatches);
  };

  const handleNextMatch = () => {
    if (!query.trim() || matchCount < 2) return;

    const nextIndex = (matchIndex + 1) % matchCount;
    setMatchIndex(nextIndex);

    const iframeWindow = iframeRef.current?.contentWindow;
    const pdfApp = iframeWindow?.PDFViewerApplication;

    pdfApp?.eventBus?.dispatch("find", {
      query,
      type: "again",
      caseSensitive: false,
      findPrevious: false,
      highlightAll: true,
    });
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

      {matchCount > 1 && (
        <button onClick={handleNextMatch} className="abpi-next-button">
          Next Match ({matchIndex + 1} of {matchCount})
        </button>
      )}

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

