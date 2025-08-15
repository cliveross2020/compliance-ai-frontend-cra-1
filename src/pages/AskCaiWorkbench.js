// src/pages/AskCaiWorkbench.js
import React, { useMemo, useRef, useState, useEffect } from "react";
import comparatorData from "../data/global_comparator.json";
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

/* ---------- main page ---------- */
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

  // Backend proxy (same-origin) → no CORS issues
  const proxiedPdfUrl = useMemo(() => {
    return rawPdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(rawPdfUrl)}` : "";
  }, [rawPdfUrl]);

  // Prefer PDF.js viewer (has a visible Find box). Use viewer hosted on the BACKEND for same-origin.
  const [usePdfJs, setUsePdfJs] = useState(true);
  // RAW is your backend root (e.g., https://compliance-ai-app.onrender.com)
  const viewerBase = `${RAW.replace(/\/+$/, "")}/pdfjs/web/viewer.html`;
  const pdfjsUrl = useMemo(() => {
    if (!proxiedPdfUrl) return "";
    // Keep the PDF.js search UI and a friendly zoom
    return `${viewerBase}?file=${encodeURIComponent(proxiedPdfUrl)}#zoom=page-width`;
  }, [proxiedPdfUrl]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState("");
  const [matches, setMatches] = useState([]); // [{ clause, text, page? }]

  const iframeRef = useRef(null);
  const canAsk = question.trim().length > 2 && !asking;

  // Heuristic: if PDF.js viewer isn’t present, fall back to native viewer
  useEffect(() => {
    if (!usePdfJs) return;
    let fallbackTimer = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        const title = doc?.title?.toLowerCase() || "";
        const text = doc?.body?.innerText?.slice(0, 200).toLowerCase() || "";
        if (!doc || title.includes("not found") || text.includes("cannot get")) {
          setUsePdfJs(false);
        }
      } catch {
        // If we can't access the doc, just keep PDF.js (same-origin should allow it)
      }
    }, 2000);
    return () => clearTimeout(fallbackTimer);
  }, [pdfjsUrl, usePdfJs]);

  function jumpToPage(page) {
    const pageNum = Math.max(1, Number(page) || 1);
    if (!iframeRef.current) return;

    if (usePdfJs) {
      // PDF.js supports #page= anchors
      iframeRef.current.src = `${pdfjsUrl.split("#")[0]}#page=${pageNum}&zoom=page-width`;
    } else {
      // native viewer also supports #page= in most browsers
      iframeRef.current.src = `${proxiedPdfUrl}#page=${pageNum}&view=FitH`;
    }
  }

  // Build an answer body where “Clause X.Y” is inline-clickable and jumps to a page if we have one
  function renderAnswerWithLinks(text) {
    if (!text) return null;
    const parts = [];
    const regex = /(Clause\s\d+(?:\.\d+)?)/gi;
    let lastIndex = 0;
    let m;

    while ((m = regex.exec(text)) !== null) {
      const before = text.slice(lastIndex, m.index);
      if (before) parts.push(<span key={`t-${lastIndex}`}>{before}</span>);

      const label = m[1];
      const hit = matches.find(
        (r) => (r?.clause || "").toLowerCase() === label.toLowerCase()
      );
      const canJump = !!hit?.page;

      parts.push(
        <button
          key={`c-${m.index}`}
          type="button"
          className="clause-inline"
          onClick={() => (canJump ? jumpToPage(hit.page) : alert(`Tip: Press ⌘F / Ctrl+F and search for “${label}”.`))}
          title={canJump ? `Jump to ${label}` : `Search in PDF for ${label}`}
        >
          {label}
        </button>
      );
      lastIndex = regex.lastIndex;
    }
    const tail = text.slice(lastIndex);
    if (tail) parts.push(<span key={`t-end`}>{tail}</span>);
    return parts;
  }

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError(null);
    setAnswer("");
    setMatches([]);

    try {
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          pdf_url: rawPdfUrl, // let the backend parse whichever code is selected
          top_k: 6,
          max_words: 350,
        }),
      });
      if (!res.ok) throw new Error(`AskCAI failed: ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer || "");
      setMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="workbench">
      {/* Left: PDF viewer (PDF.js with Find box; native fallback) */}
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
              src={
                usePdfJs && pdfjsUrl
                  ? pdfjsUrl
                  : `${proxiedPdfUrl}#page=1&view=FitH`
              }
              onLoad={() => {
                // If the viewer switched (e.g., new doc), keep page 1 & nice zoom
              }}
            />
          ) : (
            <div className="wb-pdf-placeholder">Select a document…</div>
          )}
        </div>
        {!usePdfJs && (
          <div className="wb-hint">
            Tip: press <strong>⌘F</strong> / <strong>Ctrl+F</strong> to find inside the PDF.
          </div>
        )}
      </section>

      {/* Right: Ask CAI */}
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
            {/* No pills; only inline, clickable clause references */}
            <div className="wb-answer-body">{renderAnswerWithLinks(answer)}</div>
          </div>
        )}
      </section>
    </div>
  );
}
