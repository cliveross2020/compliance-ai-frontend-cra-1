import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const API_ROOT =
  process.env.REACT_APP_API_ROOT ||
  "https://compliance-ai-app.onrender.com/api";

export default function Dashboard() {
  const [company, setCompany] = useState("");
  const [clause, setClause] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_ROOT}/dashboard/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company || undefined,
          clause: clause || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCount(data.count || 0);
      setResults(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  // Load initial data (last 3 years)
  useEffect(() => {
    const now = new Date();
    const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    setDateFrom(threeYearsAgo.toISOString().slice(0, 10));
    setDateTo(now.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchData();
    }
  }, [dateFrom, dateTo]);

  return (
    <div className="dashboard">
      <h1>Compliance Dashboard</h1>

      {/* Filter Panel */}
      <div className="filter-panel">
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          type="text"
          placeholder="Clause"
          value={clause}
          onChange={(e) => setClause(e.target.value)}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button onClick={fetchData}>Search</button>
      </div>

      {/* Results Summary */}
      <div className="summary">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <p>
            Found <strong>{count}</strong> matching cases
          </p>
        )}
      </div>

      {/* Results Table */}
      {!loading && !error && results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Company</th>
              <th>Clause</th>
              <th>Date</th>
              <th>Outcome</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx}>
                <td>{row.case_id}</td>
                <td>{row.company}</td>
                <td>{row.clause}</td>
                <td>{row.date}</td>
                <td>{row.outcome}</td>
                <td>
                  {row.url ? (
                    <a href={row.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && results.length === 0 && <p>No cases found.</p>}
    </div>
  );
}
