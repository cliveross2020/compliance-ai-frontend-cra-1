import React, { useState } from "react";
import CAILogo from "../assets/cai-logo.png";

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://compliance-ai-app.onrender.com/api/abpi/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResult(data.summary);
    } catch (err) {
      setResult("❌ Error fetching results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-green-900">📘 ABPI Clause Search</h2>
        <img src={CAILogo} alt="CAI Logo" className="h-10 w-auto" />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="e.g. Clause 9, digital materials..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-800 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-green-900 text-white px-5 py-2 rounded-md hover:bg-green-800"
        >
          Search
        </button>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-h-[200px]">
        {loading ? (
          <p className="text-gray-500 italic">Searching the ABPI Code...</p>
        ) : result ? (
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, "<br />") }} />
        ) : (
          <p className="text-gray-400">Enter a search query above to get started.</p>
        )}
      </div>
    </div>
  );
};

export default AbpiSearch;
