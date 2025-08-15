// src/pages/AskCaiWorkbench.js
import React, { useMemo, useState, useRef } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

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

  // Route through backend proxy (CORS-safe)
  const proxiedUrl = useMemo(() => {
    return pdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}` : "";
  }, [pdfUrl]);

  // Viewer search term (drives #search=… in viewer)
  const [searchTerm, setSearchTerm] = useState("");
  const viewerKey = `${proxiedUrl}|${searchTerm}`; // force iframe remount to apply new #search
  const viewerSrc = proxiedUrl
    ? `/pdfjs/web/viewer.html?file=${encodeURIComponent(proxiedUrl)}${
        searchTerm ? `#search=${encodeURIComponent(searchTerm)}` : "#zoom=page-width"
      }`
    : "";

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState("");

  const canAsk = question.trim().length > 2 && !asking;

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError(null);
    setAnswer("");
    setSearchTerm(""); // clear last search

    try {
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          pdf_url: pdfUrl, // send selected PDF URL (backend uses proxy to fetch)
          top_k: 6,
          max_words: 350,
        }),
      });
      if (!res.ok) throw new Error(`AskCAI failed: ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer || "");

      // Optional: gently prompt built-in find if we saw a clause but no viewer search yet
      const firstCite = (data.answer || "").match(/Clause\s\d+(?:\.\d+)?/i)?.[0];
      if (firstCite && !searchTerm) {
        // rather than alert, we can auto-populate the viewer search:
        setSearchTerm(firstCite);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  // Render the answer and turn "Clause 10.5" patterns into clickable links that set the viewer search
  function renderAnswerWithLinks(text) {
    if (!text) return null;
    const regex = /(Clause\s\d+(?:\.\d+)?)/gi;
    const parts = text.split(regex);
    return parts.map((chunk, i) => {
      if (regex.test(chunk)) {
        const term = chunk.trim();
        return (
          <button
            key={`c-${i}`}
            type="button"
            className="clause-link"
            onClick={() => setSearchTerm(term)}
            title={`Find ${term} in the PDF`}
          >
            {term}
          </button>
        );
      }
      return <span key={`t-${i}`}>{chunk}</span>;
    });
  }

  return (
    <div className="workbench">
      {/* Left: PDF.js viewer (has built-in Find panel + toolbar) */}
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

            {proxiedUrl && (
              <a className="wb-download" href={proxiedUrl} target="_blank" rel="noreferrer" download>
                Download PDF
              </a>
            )}
          </div>
        </div>

        <div className="wb-viewer-wrap">
          {viewerSrc ? (
            <iframe
              key={viewerKey}
              className="wb-viewer"
              title="Code PDF"
              src={viewerSrc}
              allow="clipboard-write"
            />
          ) : (
            <div className="wb-pdf-placeholder">Select a document…</div>
          )}
        </div>

        <div className="wb-hint">Tip: use the viewer’s Find box or click a clause in the answer.</div>
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
            <div className="wb-answer-body">{renderAnswerWithLinks(answer)}</div>
          </div>
        )}
      </section>
    </div>
  );
}
