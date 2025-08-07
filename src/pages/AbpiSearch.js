import React, { useState, useRef, useEffect } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";
import { pdfjs, Document, Page } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CLAUSE_OPTIONS = [
  "Clause 1", "Clause 2", "Clause 2.1", "Clause 3", "Clause 5.1", "Clause 6", "Clause 9.1", "Clause 12", "Clause 14.2", "Clause 18.5",
];

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedClause, setSelectedClause] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const viewerRef = useRef();

  useEffect(() => {
    // Reload PDF if search changes
    if (pdf) {
      searchInPdf();
    }
  }, [query, selectedClause]);

  const handleSearch = () => {
    if (!pdf) return;
    searchInPdf();
  };

  const onDocumentLoadSuccess = (pdfDoc) => {
    setNumPages(pdfDoc.numPages);
    setPdf(pdfDoc);
  };

  const scrollToPage = (pageNum) => {
    const viewer = viewerRef.current;
    const canvas = viewer?.querySelector(`[data-page-number="${pageNum}"]`);
    if (canvas) {
      canvas.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const normalizeClause = (text) => {
    return text?.toLowerCase().replace("clause", "").replace(/\s+/g, "").trim();
  };

  const searchInPdf = async () => {
    if (!pdf) return;
    const searchTerm = selectedClause || query;
    const normalizedSearch = normalizeClause(searchTerm);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(" ").toLowerCase();

      if (
        text.includes(normalizedSearch) ||
        text.includes(query.toLowerCase())
      ) {
        setPageNumber(i);
        scrollToPage(i);
        break;
      }
    }
  };

  return (
    <div className="abpi-search-container">
      <div className="abpi-header">
        <img src={caiLogo} alt="CAI Logo" className="abpi-logo" />
        <h2>ABPI Clause Search</h2>
      </div>

      <div className="abpi-controls">
        <input
          type="text"
          placeholder="Enter keyword or clause (e.g. 5.1, gifts)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="abpi-input"
        />
        <select
          value={selectedClause}
          onChange={(e) => setSelectedClause(e.target.value)}
          className="abpi-dropdown"
        >
          <option value="">-- Select Clause --</option>
          {CLAUSE_OPTIONS.map((clause) => (
            <option key={clause} value={clause}>
              {clause}
            </option>
          ))}
        </select>
        <button onClick={handleSearch} className="abpi-button">
          Search
        </button>
      </div>

      <div className="abpi-pdf-viewer" ref={viewerRef}>
        <Document
          file="/abpi/2024-abpi-code-of-practice.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          className="pdf-document"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default AbpiSearch;
