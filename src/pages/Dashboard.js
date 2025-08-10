import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

export default function Dashboard() {
  // Filters
  const [company, setCompany] = useState("");
  const [clause, setClause] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Data
  const [kpi, setKpi] = useState({ total_cases: 0, unique_companies: 0, most_breached_clause: null });
  const [topClauses, setTopClauses] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [trend, setTrend] = useState([]);

  const [queryCount, setQueryCount] = useState(0);
  const [queryItems, setQueryItems] = useState([]);

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState(null);

  // Default to last 3 years on first render
  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(now.toISOString().slice(0, 10));
  }, []);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (company) p.set("company", company);
    if (clause) p.set("clause", clause);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    return p.toString();
  }, [company, clause, dateFrom, dateTo]);

  async function loadMetrics() {
    setLoadingMetrics(true);
    setError(null);
    try {
      const res = await fetch(`${API}/dashboard/metrics?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setKpi(data.kpi || {});
      setTopClauses(data.top_clauses || []);
      setTopCompanies(data.top_companies || []);
      setTrend(data.trend || []);
    } catch (e) {
      setError(e.message || "Failed to load metrics");
    } finally {
      setLoadingMetrics(false);
    }
  }

  async function runQuery() {
    setLoadingQuery(true);
    setError(null);
    try {
      const res = await fetch(`${API}/dashboard/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company || undefined,
          clause: clause || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQueryCount(data.count || 0);
      setQueryItems((data.items || []).slice(0, 25)); // small table preview
    } catch (e) {
      setError(e.message || "Failed to fetch data");
    } finally {
      setLoadingQuery(false);
    }
  }

  // Load both when filters change
  useEffect(() => {
    if (dateFrom && dateTo) {
      loadMetrics();
      runQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function exportCSV() {
    const rows = [
      ["case_id", "company", "clause", "date", "outcome", "url"],
      ...queryItems.map(r => [r.case_id, r.company, r.clause, r.date, r.outcome, r.url]),
    ];
    const csv = rows.map(r => r.map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard_query.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dash">
      <div className="dash-header">
        <h1>Compliance Dashboard</h1>
        <p className="muted">Filter by company, clause, or dates to update the KPIs and report.</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <input placeholder="Company (e.g., AstraZeneca)"
               value={company} onChange={(e)=>setCompany(e.target.value)} />
        <input placeholder="Clause (e.g., 5.1)"
               value={clause} onChange={(e)=>setClause(e.target.value)} />
        <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        <button onClick={()=>{loadMetrics(); runQuery();}} disabled={loadingMetrics||loadingQuery}>
          {loadingMetrics || loadingQuery ? "Updating…" : "Apply"}
        </button>
      </div>

      {error && <div className="err">Error: {error}</div>}

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total cases</div>
          <div className="kpi-value">{kpi.total_cases ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Unique companies</div>
          <div className="kpi-value">{kpi.unique_companies ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Most-breached clause</div>
          <div className="kpi-value">{kpi.most_breached_clause ?? "–"}</div>
        </div>
      </div>

      {/* Top lists + Trend */}
      <div className="panels">
        <div className="panel">
          <div className="panel-title">Top clauses</div>
          <ul className="bar-list">
            {topClauses.map((r, i) => (
              <li key={i}>
                <span className="bar-label">{r.clause || "Unknown"}</span>
                <span className="bar">
                  <span className="bar-fill" style={{width: `${(r.count / (topClauses[0]?.count || 1)) * 100}%`}} />
                </span>
                <span className="bar-count">{r.count}</span>
              </li>
            ))}
            {topClauses.length === 0 && <li className="muted small">No data</li>}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-title">Top companies</div>
          <ul className="bar-list">
            {topCompanies.map((r, i) => (
              <li key={i}>
                <span className="bar-label">{r.company || "Unknown"}</span>
                <span className="bar">
                  <span className="bar-fill" style={{width: `${(r.count / (topCompanies[0]?.count || 1)) * 100}%`}} />
                </span>
                <span className="bar-count">{r.count}</span>
              </li>
            ))}
            {topCompanies.length === 0 && <li className="muted small">No data</li>}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-title">Monthly trend</div>
          <ul className="spark">
            {trend.map((r, i) => (
              <li key={i} title={`${r.month}: ${r.cases}`}>
                <span className="spark-bar" style={{height: `${Math.max(6, (r.cases / (Math.max(...trend.map(t=>t.cases)) || 1)) * 64)}px`}} />
                <span className="spark-label">{r.month?.slice(2)}</span>
              </li>
            ))}
            {trend.length === 0 && <li className="muted small">No data</li>}
          </ul>
        </div>
      </div>

      {/* Query & Report */}
      <div className="report">
        <div className="report-head">
          <div>
            <div className="panel-title">Query & Report</div>
            <div className="muted">Found <strong>{queryCount}</strong> matching cases</div>
          </div>
          <div className="report-actions">
            <button onClick={runQuery} disabled={loadingQuery}>Refresh</button>
            <button onClick={exportCSV} disabled={queryItems.length === 0}>Export CSV</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
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
              {queryItems.map((r, i) => (
                <tr key={i}>
                  <td>{r.case_id}</td>
                  <td>{r.company}</td>
                  <td>{r.clause}</td>
                  <td>{r.date}</td>
                  <td>{r.outcome}</td>
                  <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">Open</a> : "–"}</td>
                </tr>
              ))}
              {queryItems.length === 0 && (
                <tr><td colSpan="6" className="muted">No rows to display.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
