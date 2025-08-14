// src/pages/AskCaiWorkbench.js
import React, { useMemo, useRef, useState } from "react";
import comparatorData from "../data/global_comparator.json";

// Keep styling even if a global import was accidentally removed
import "./AskCaiWorkbench.css";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

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

/* ---------- page ---------- */
export default function AskCaiWorkbench() {
  // PDF selection
  const ALL_PDFS = useMemo(buildPdfOptions, []);
  const [preset, setPreset] = useState("abpi"); // abpi | efpia | ifpma | other
  const [otherUrl, setOtherUrl] = useState("");

  const rawPdfUrl = useMemo(() => {
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

  // Route the PDF through the backend proxy to avoid CORS issues
  const proxiedPdfUrl = useMemo(() => {
    return rawPdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(rawPdfUrl)}` : "";
  }, [rawPdfUrl]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState("");            // model answer (≤350 words enforced server-side)
  const [clauses, setClauses] = useState([]);          // ["Clause 10.5", ...]
  const [matches, setMatches] = useState([]);          // [{ clause, text, page? }]

  const iframeRef = useRef(null);
  const canAsk = question.trim().length > 2 && !asking;

  function jumpToPage(page) {
    if (!proxiedPdfUrl || !iframeRef.current) return;
    const n = Math.max(1, Number(page) || 1);
    // Rebuild src with page anchor; keeps toolbar visible and fits horizontally
    iframeRef.current.src = `${proxiedPdfUrl}#page=${n}&view=FitH`;
  }

  function handleClauseClick(c) {
    // Try to find a match with page info
    const hit = matches.find((m) => (m?.clause || "").toLowerCase() === (c || "").toLowerCase());
    if (hit?.page) {
      jumpToPage(hit.page);
    } else {
      // No page metadata — show a gentle hint
      alert("Tip: press ⌘F / Ctrl+F in the PDF and search for: " + c);
    }
  }

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError(null);
    setAnswer("");
    setClauses([]);
    setMatches([]);
    try {
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          pdf_url: rawPdfUrl, // send the real PDF url; backend will fetch & parse
          top_k: 6,
          max_words: 350,
        }),
      });
      if (!res.ok) throw new Error(`AskCAI failed: ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer || "");
      setClauses(Array.isArray(data.clauses) ? data.clauses : []);
      setMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="workbench">
      {/* Left: PDF (iframe + browser native Find) */}
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

            {rawPdfUrl && (
              <a className="wb-download" href={rawPdfUrl} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            )}
          </div>
        </div>

        <div className="wb-pdf-wrap">
          {proxiedPdfUrl ? (
            <iframe
              ref={iframeRef}
              className="wb-pdf"
              title="Code PDF"
              // Start at page 1; user can still use built-in toolbar & Cmd/Ctrl+F
              src={`${proxiedPdfUrl}#page=1&view=FitH`}
            />
          ) : (
            <div className="wb-pdf-placeholder">Select a document…</div>
          )}
        </div>
        <div className="wb-hint">
          Press <strong>⌘F</strong> / <strong>Ctrl+F</strong> to find inside the PDF.
        </div>
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

            {clauses.length > 0 && (
              <div className="wb-citations">
                <div className="wb-cite-pills">
                  {clauses.map((c, i) => (
                    <button
                      type="button"
                      className="pill linklike"
                      key={`${c}-${i}`}
                      onClick={() => handleClauseClick(c)}
                      title="Jump to clause in PDF"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
