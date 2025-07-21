import React, { useState } from "react";
import axios from "axios";

const AbpiSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const AbpiResultItem = ({ result }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="result-card bg-white rounded-xl shadow p-4 mb-4 border border-gray-200 transition">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              {result.clauseNumber}: {result.title}
            </h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-green-700 hover:underline focus:outline-none transition"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              <strong>Clause Text:</strong> {result.fullText || "Clause text not available."}
            </div>
            <div className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded">
              💡 <strong>AI Summary:</strong> {result.aiSummary || "Summary not available yet."}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-900 mb-6">ABPI Clause Search</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clauses..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-green-500 transition"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-green-800 text-white rounded-lg hover:bg-green-700 transition"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-gray-500">Loading results...</div>
      ) : results.length > 0 ? (
        results.map((res, idx) => <AbpiResultItem key={idx} result={res} />)
      ) : (
        <div className="text-gray-400 italic">No results yet. Try a search above.</div>
      )}
    </div>
  );
};

export default AbpiSearch;
