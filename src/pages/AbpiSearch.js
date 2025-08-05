import React, { useState } from "react";
import "./AbpiSearch.css";
import caiLogo from "../assets/cai-logo.png";

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSummary("");
    setError("");

    try {
      const response = await fetch("https://compliance-ai-app.onrender.com/api/abpi/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Error:", err);
      setError("❌ Failed to retrieve clause information.");
    } finally {
      setLoading(false);
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
        {loading && <p className="abpi-loading">🔄 Loading...</p>}
        {error && <p className="abpi-error">{error}</p>}
        {summary && (
          <div
            className="abpi-summary"
            dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, "<br />") }}
          />
        )}
        {!loading && !summary && !error && (
          <p className="abpi-placeholder">Try asking about digital materials, gifts, clauses, etc.</p>
        )}
      </div>
    </div>
  );
};

export default AbpiSearch;
