import React, { useEffect, useState } from "react";
import "./News.css";

const API_ROOT =
  process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com/api";

export default function News() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_ROOT}/news?limit=60`);
        const data = await res.json();
        if (!cancel) setItems(Array.isArray(data.items) ? data.items : []);
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, []);

  const sources = ["all", ...Array.from(new Set(items.map(i => i.source).filter(Boolean)))];

  const shown = items.filter(i => {
    const m1 = source === "all" || i.source === source;
    const m2 = !q || (i.title || "").toLowerCase().includes(q.toLowerCase());
    return m1 && m2;
  });

  return (
    <div className="news-page">
      <h1>Compliance News</h1>

      <div className="news-filters">
        <select value={source} onChange={e => setSource(e.target.value)}>
          {sources.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Filter by title…"
        />
      </div>

      {loading && <div>Loading…</div>}

      {!loading && (
        <ul className="news-list">
          {shown.map((it, i) => (
            <li className="news-card" key={`${it.url || i}-${i}`}>
              <div className="news-card-header">
                <span className="news-source">{it.source || "Source"}</span>
                <span className="news-time">
                  {(it.published || "").replace("T", " ").slice(0, 16)}
                </span>
              </div>
              <a
                className="news-title"
                href={it.url}
                target="_blank"
                rel="noreferrer"
              >
                {it.title}
              </a>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="news-empty">No results.</li>
          )}
        </ul>
      )}
    </div>
  );
}
