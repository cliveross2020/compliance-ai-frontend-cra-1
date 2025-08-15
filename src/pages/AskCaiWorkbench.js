// src/pages/AskCaiWorkbench.js
import React, { useEffect, useMemo, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
// API root (…/api)
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;
// Backend origin (no /api) — used to host the PDF.js viewer so it's same-origin with the file
const BACKEND = API.replace(/\/api\/?$/, "");

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

/** Replace (Clause 10.5) / (Clause 21.1) etc with clickable links */
function linkifyClauses(text) {
  if (!text) return "";
  // Matches (Clause 10), (Clause 10.5), (Clause 21.1.3), etc
  const re = /\(Clause\s+([0-9]+(?:\.[0-9]+)*)\)/gi;
  return text.replace(re, (_m, num) => {
    const clause = `Clause ${num}`;
    return `<a href="#" class="clause-link" data-clause="${clause}">(${clause})</a>`;
  });
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

  // Build a viewer URL *and* a same-origin file URL (via backend proxy)
  const [viewerHash, setViewerHash] = useState(""); // e.g. "#search=Clause%2010.5"
  const viewerUrl = useMemo(() => {
    if (!pdfUrl) return "";
    const proxiedFile = `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}`;
    const base = `${BACKEND}/pdfjs/web/viewer.html?file=${encodeURIComponent(proxiedFile)}`;
    return `${base}${viewerHash || ""}`;
  }, [pdfUrl, viewerHash]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answerHtml, setAnswerHtml] = useState(""); // rendered with links

  const canAsk = question.trim().length > 2 && !asking;

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError(null);
    setAnswerHtml("");

    try {
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          pdf_url: pdfUrl, // send selected PDF URL
          top_k: 6,
          max_words: 350,
        }),
      });
      if (!res.ok) throw new Error(`AskCAI failed: ${res.status}`);
      const data = await res.json();

      const html = linkifyClauses(String(data.answer || ""));
      setAnswerHtml(html);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  /* ------ tiny effect: wire clause links to the viewer search ------ */
  useEffect(() => {
    // delegate clicks inside the answer box
    const box = document.querySelector(".wb-answer-body");
    if (!box) return;
    const onClick = (e) => {
      const a = e.target.closest("a.clause-link");
      if (!a) return;
      e.preventDefault();
      const clause = a.getAttribute("data-clause") || a.textContent || "";
      if (!clause) return;

      // Reload viewer with a search for the clause text.
      // PDF.js viewer understands #search=... in the hash.
      const searchHash = `#search=${encodeURIComponent(clause)}`;
      setViewerHash(searchHash);

      // Gentle UX hint (optional)
      window.alert(`Tip: Press ⌘F / Ctrl+F and search for “${clause}”.`);
    };
    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, [answerHtml, pdfUrl]);

  return (
    <div className="workbench">
      {/* Left: PDF viewer (served from backend to keep origin consistent) */}
      <section className="wb-left">
        <div className="wb-left-head">
          <div className="wb-doc-pickers">
            <label className="wb-label">Document</label>
            <select
              value={preset}
              onChange={(e) => {
                setViewerHash(""); // reset viewer search when switching docs
                setPreset(e.target.value);
              }}
              className="wb-select"
            >
              <option value="abpi">ABPI (UK)</option>
              <option value="efpia">EFPIA (EU)</option>
              <option value="ifpma">IFPMA (Global)</option>
              <option value="other">Other code…</option>
            </select>

            {preset === "other" && (
              <select
                className="wb-select ml"
                value={otherUrl}
                onChange={(e) => {
                  setViewerHash("");
                  setOtherUrl(e.target.value);
                }}
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

        <div className="wb-pdf-wrap">
          {viewerUrl ? (
            <iframe
              key={viewerUrl /* force refresh when hash changes */}
              className="wb-pdf"
              title="Code PDF"
              src={viewerUrl}
            />
          ) : (
            <div className="wb-pdf-placeholder">Select a document…</div>
          )}
        </div>

        <div className="wb-hint">
          Tip: press <strong>⌘F</strong> / <strong>Ctrl+F</strong> to find inside the PDF.
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

        {answerHtml && (
          <div className="wb-answer">
            <div
              className="wb-answer-body"
              dangerouslySetInnerHTML={{ __html: answerHtml }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
