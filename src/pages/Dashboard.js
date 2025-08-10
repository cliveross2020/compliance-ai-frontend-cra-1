import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

export default function Dashboard() {
  const [company, setCompany] = useState("");
  const [clause, setClause] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [metrics, setMetrics] = useState(null);
  const [report, setReport] = useState(null);

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState(null);

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
      setMetrics(await res.json());
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
      const res = await fetch(`${API}/dashboard/query?${params}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReport(await res.json());
    } catch (e) {
      setError(e.message || "Failed to fetch data");
    } finally {
      setLoadingQuery(false);
    }
  }

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadMetrics();
      runQuery();
    }
  }, [params]); // eslint-disable-line

  function exportCSV() {
    if (!report?.items?.length) return;
    const rows = [
      ["case_id", "company", "clause", "date", "outcome", "url"],
      ...report.items.map(r => [r.case_id, r.company, r.clause, r.date, r.outcome, r.url]),
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

  const kpi = metrics?.kpi || {};
  const topClauses = metrics?.top_clauses?.data || [];
  const topCompanies = metrics?.top_companies?.data || [];
  const trend = metrics?.trend?.data || [];

  return (
    <div className="dash">
      <div className="dash-header">
        <h1>Compliance Dashboard</h1>
        <p className="muted">Interactive PMCPA case insights for executives — filter and drill down instantly.</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <input placeholder="Company (e.g., AstraZeneca)" value={company} onChange={(e)=>setCompany(e.target.value)} />
        <input placeholder="Clause (e.g., 5.1)" value={clause} onChange={(e)=>setClause(e.target.value)} />
        <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        <button onClick={()=>{loadMetrics(); runQuery();}} disabled={loadingMetrics||loadingQuery}>
          {loadingMetrics || loadingQuery ? "Updating…" : "Apply"}
        </button>
      </div>

      {error && <div className="err">Error: {error}</div>}

      {/* KPI Cards */}
      <div className="kpi-grid">
        {Object.entries(kpi).map(([key, obj]) => (
          <div className="kpi-card" key={key}>
            <div className="kpi-label">{key.replace(/_/g, " ")}</div>
            <div className="kpi-value">{obj?.value ?? 0}</div>
            <div className="kpi-desc">{obj?.description}</div>
          </div>
        ))}
      </div>

      {/* Top Clauses */}
      <h3>Top clauses</h3>
      <p className="chart-subtext">{metrics?.top_clauses?.description}</p>
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

      {/* Top Companies */}
      <h3>Top companies</h3>
      <p className="chart-subtext">{metrics?.top_companies?.description}</p>
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

      {/* Monthly Trend */}
      <h3>Monthly trend</h3>
      <p className="chart-subtext">{metrics?.trend?.description}</p>
      <ul className="spark">
        {trend.map((r, i) => (
          <li key={i} title={`${r.month}: ${r.cases}`}>
            <span className="spark-bar" style={{height: `${Math.max(6, (r.cases / (Math.max(...trend.map(t=>t.cases)) || 1)) * 64)}px`}} />
            <span className="spark-label">{r.month?.slice(2)}</span>
          </li>
        ))}
        {trend.length === 0 && <li className="muted small">No data</li>}
      </ul>

      {/* Query & Report */}
      <div className="report">
        {report && (
          <div className="report-headline">
            <strong>{report.count}</strong> case{report.count !== 1 ? "s" : ""} matching:
            {company && <> company = <em>{company}</em></>}
            {clause && <>; clause = <em>{clause}</em></>}
            {(dateFrom || dateTo) && <>; date = <em>{dateFrom || "…"} → {dateTo || "…"} </em></>}
          </div>
        )}

        <div className="report-actions">
          <button onClick={runQuery} disabled={loadingQuery}>Refresh</button>
          <button onClick={exportCSV} disabled={!report?.items?.length}>Export CSV</button>
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
              {(report?.items || []).map((r, i) => (
                <tr key={i}>
                  <td>{r.case_id}</td>
                  <td>{r.company}</td>
                  <td>{r.clause}</td>
                  <td>{r.date}</td>
                  <td>{r.outcome}</td>
                  <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">Open</a> : "–"}</td>
                </tr>
              ))}
              {!report?.items?.length && (
                <tr><td colSpan="6" className="muted">No rows to display.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
