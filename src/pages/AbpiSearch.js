import React, { useState } from "react";

const ABPISearch = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('https://compliance-ai-app.onrender.com/api/abpi/search', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResult(data.summary);
    } catch (error) {
      setResult("❌ Error retrieving clause data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📘 ABPI Clause Search</h2>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow p-2 border rounded-md"
          placeholder="Search clauses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-green-900 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>
      <div className="mt-6 bg-white p-4 border rounded shadow-sm min-h-[150px]">
        {loading ? (
          <p className="text-gray-500 italic">Loading...</p>
        ) : result ? (
          <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, "<br />") }} />
        ) : (
          <p className="text-gray-400">No results yet. Try a search above.</p>
        )}
      </div>
    </div>
  );
};

export default ABPISearch;

