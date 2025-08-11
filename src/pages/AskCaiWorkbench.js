// src/pages/AskCaiWorkbench.js
import React, { useMemo, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;
const WORKER_URL = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

/* ---------- helpers ---------- */

function defaultAbpiUrl() {
  const pdfs = (comparatorData || []).filter(
    (r) => typeof r.url === "string" && /\.pdf(\?|$)/i.test(r.url)
  );
  const abpi = pdfs.find(
    (r) =>
      /United Kingdom/i.test(r.country || "") &&
      /ABPI/i.test(r.code_name || "") &&
      /2024|2025/i.test(r.code_name || "")
  );
  return (
    abpi?.url ||
    pdfs.find((r) => /United Kingdom/i.test(r.country || ""))?.url ||
    "https://www.abpi.org.uk/media/xmbnr12q/final-2024-abpi-code-_interactive.pdf"
  );
}

function buildPdfOptions() {
  const seen = new Set();
  return (comparatorData || [])
    .filter((row) => typeof row.url === "string" && /\.pdf(\?|$)/i.test(row.url))
    .map((row) => {
      const label = `${row.country || "Unknown"} — ${row.code_name || "Code"}`;
      const key = `${label}::${row.url}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return { label, url: row.url };
    })
    .filter(Boolean);
}

/* ---------- tiny error boundary so the page never blanks ---------- */
class PdfErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error("[PDF viewer failed]", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="wb-pdf-error">
          <div>We couldn’t open the PDF (likely a network/CORS hiccup).</div>
          <button onClick={() => this.setState({ hasError: false, err: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- page ---------- */

export default function AskCaiWorkbench() {
  // PDF selection
  const ALL_PDFS = useMemo(buildPdfOptions, []);
  const [preset, setPreset] = useState("abpi"); // abpi | efpia | ifpma | other
  const [otherUrl, setOtherUrl] = useState("");

  const pdfUrl = useMemo(() => {
    if (preset === "abpi") return defaultAbpiUrl();
    if (preset === "efpia") {
      return (
        ALL_PDFS.find(
          (r) => /Europe\s*\(EFPIA\)/i.test(r.label) && /Code of Practice/i.test(r.label)
        )?.url || "https://www.efpia.eu/media/f2ccf3yd/efpia-code-of-practice-16052025.pdf"
      );
    }
    if (preset === "ifpma") {
      return (
        ALL_PDFS.find((r) => /IFPMA/i.test(r.label))?.url ||
        "https://www.ifpma.org/wp-content/uploads/2018/09/2023_IFPMA-Code-Interactive.pdf"
      );
    }
    return otherUrl || defaultAbpiUrl();
  }, [preset, otherUrl, ALL_PDFS]);

  // Route through the backend proxy to avoid CORS
  const proxiedUrl = useMemo(() => {
    if (!pdfUrl) return "";
    // adjust to your backend route name
    return `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}`;
  }, [pdfUrl]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  const [matches, setMatches] = useState([]);          // [{clause, text}]
  const [answer, setAnswer] = useState("");            // (≤350 words)
  const [usedClauses, setUsedClauses] = useState([]);  // ["Clause 10.5", ...]

  const canAsk = question.trim().length > 2 && !asking;

  const defaultLayout = useMemo(() => defaultLayoutPlugin(), []);

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError(null);
    setAnswer("");
    setMatches([]);
    setUsedClauses([]);

    try {
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, doc: preset, top_k: 6, max_words: 350 }),
      });
      if (!res.ok) throw new Error(`AskCAI failed: ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer || "");
      setMatches(Array.isArray(data.matches) ? data.matches : []);
      setUsedClauses(Array.isArray(data.clauses) ? data.clauses : []);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="workbench">
      {/* Left: PDF viewer */}
      <section className="wb-left">
        <div className="wb-left-head">
          <div className="wb-doc-pickers">
            <label className="wb-label">Document</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value)} className="wb-select">
              <option value="abpi">ABPI (UK)</option>
              <option value="efpia">EFPIA (EU)</option>
              <option value="ifpma">IFPMA (Global)</option>
              <option value="other">Other code…</option>
            </select>

            {preset === "other" && (
              <select
                className="wb-select ml"
                value={otherUrl}
                onChange={(e) => setOtherUrl(e.target.value)}
              >
                <option value="">Choose a code (PDF)</option>
                {ALL_PDFS.map((opt, i) => (
                  <option key={`${opt.url}-${i}`} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {pdfUrl && (
              <a className="wb-download" href={pdfUrl} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            )}
          </div>
        </div>

        <div className="wb-viewer-wrap">
          {proxiedUrl ? (
            <PdfErrorBoundary>
              <Worker workerUrl={WORKER_URL}>
                <Viewer
                  fileUrl={proxiedUrl}
                  plugins={[defaultLayout]}
                  onDocumentLoadFail={(e) => {
                    console.error("[PDF load fail]", e);
                    // Throw to trigger boundary on next paint
                    throw e;
                  }}
                />
              </Worker>
            </PdfErrorBoundary>
          ) : (
            <div className="wb-pdf-placeholder">Select a document…</div>
          )}
        </div>

        <div className="wb-hint">Use the toolbar’s Search to find inside the code.</div>
      </section>

      {/* Right: Chat */}
      <section className="wb-right">
        <h2>Chat with CAI</h2>

        <div className="wb-qbox">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about the code. E.g. 'What does the code say about promotional gifts?'"
            maxLength={2000}
          />
          <div className="wb-qbox-actions">
            <button className="btn btn-primary" disabled={!canAsk} onClick={ask}>
              {asking ? "Thinking…" : "Ask"}
            </button>
            <span className="wb-count">{question.trim().length}/2000</span>
          </div>
          {error && <div className="wb-error">Error: {error}</div>}
        </div>

        {answer && (
          <div className="wb-answer">
            <div className="wb-answer-body">{answer}</div>

            {usedClauses.length > 0 && (
              <div className="wb-citations">
                <div className="wb-cite-pills">
                  {usedClauses.map((c, i) => (
                    <span className="pill" key={`${c}-${i}`}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {matches.length > 0 && (
          <div className="wb-matches">
            <ul className="wb-match-list">
              {matches.map((m, i) => (
                <li key={i} className="wb-match">
                  <div className="wb-match-clause">{m.clause || "Clause"}</div>
                  <div className="wb-match-text">{m.text}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
