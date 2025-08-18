// src/pages/AskCaiWorkbench.js
import React, { useEffect, useMemo, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API  = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;
const HOST = RAW.endsWith("/api") ? RAW.slice(0, -4) : RAW; // backend origin (no /api)

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

/** Turn “(Clause 10.5)” into a link that drives the viewer’s Find box */
function linkifyClauses(text) {
  if (!text) return "";
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
  const [preset, setPreset]   = useState("abpi"); // abpi | efpia | ifpma | other
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

  // Same-origin URL for the PDF (via backend proxy to avoid CORS + PDF.js origin checks)
  const proxiedPdf = useMemo(
    () => (pdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}` : ""),
    [pdfUrl]
  );

  // Search term to push into the viewer’s Find box
  const [searchTerm, setSearchTerm] = useState("");

  // Final viewer src: served by backend at /pdfjs/web/viewer.html
  const viewerSrc = useMemo(() => {
    if (!proxiedPdf) return "";
    const base = `${HOST.replace(/\/+$/, "")}/pdfjs/web/viewer.html`;
    const qs   = `file=${encodeURIComponent(proxiedPdf)}`;
    const hash = searchTerm ? `#search=${encodeURIComponent(searchTerm)}` : "";
    return `${base}?${qs}${hash}`;
  }, [HOST, proxiedPdf, searchTerm]);

  // Chat state
  const [question, setQuestion]   = useState("");
  const [asking, setAsking]       = useState(false);
  const [error, setError]         = useState(null);
  const [answerHtml, setAnswerHtml] = useState("");

  const canAsk = question.trim().length > 2 && !asking;

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setError(null);
    setAnswerHtml("");
    setSearchTerm("");

    try {
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          pdf_url: pdfUrl,
          top_k: 6,
          max_words: 350,
        }),
      });
      if (!res.ok) throw new Error(`AskCAI failed: ${res.status}`);
      const data = await res.json();
      setAnswerHtml(linkifyClauses(String(data.answer || "")));
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  // Clicking a “(Clause …)” link sets the viewer’s #search=…
  useEffect(() => {
    const box = document.querySelector(".wb-answer-body");
    if (!box) return;
    const onClick = (e) => {
      const a = e.target.closest("a.clause-link");
      if (!a) return;
      e.preventDefault();
      const clause = a.getAttribute("data-clause") || a.textContent || "";
      setSearchTerm(clause);
    };
    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, [answerHtml]);

  return (
    <div className="workbench">
      {/* Left: PDF.js viewer (from backend) */}
      <section className="wb-left">
        <div className="wb-left-head">
          <div className="wb-doc-pickers">
            <label className="wb-label">Document</label>
            <select
              value={preset}
              onChange={(e) => { setPreset(e.target.value); setSearchTerm(""); }}
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
                onChange={(e) => { setOtherUrl(e.target.value); setSearchTerm(""); }}
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
          {viewerSrc ? (
            <iframe
              className="wb-pdf"
              title="Code PDF (PDF.js)"
              src={viewerSrc}
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <div className="wb-pdf-placeholder">Select a document…</div>
          )}
        </div>

        <div className="wb-hint">
          The viewer has a built-in <strong>Find</strong>. Click any clause in the answer to auto-fill the viewer’s search box.
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
        </div>
        <div className="wb-qbox-actions">
          <button className="btn btn-primary" disabled={!canAsk} onClick={ask}>
            {asking ? "Thinking…" : "Ask"}
          </button>
          <span className="wb-count">{question.trim().length}/2000</span>
        </div>
        {error && <div className="wb-error">Error: {error}</div>}

        {answerHtml && (
          <div className="wb-answer">
            <div className="wb-answer-body" dangerouslySetInnerHTML={{ __html: answerHtml }} />
          </div>
        )}
      </section>
    </div>
  );
}
