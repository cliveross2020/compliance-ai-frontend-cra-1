// src/pages/AskCaiWorkbench.js
import React, { useEffect, useMemo, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

/* ---------- API roots ---------- */
const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_ROOT ||
  "https://compliance-ai-app.onrender.com";

const API = BACKEND.endsWith("/api")
  ? BACKEND
  : `${BACKEND.replace(/\/+$/, "")}/api`;

const HOST = BACKEND.endsWith("/api")
  ? BACKEND.slice(0, -4)
  : BACKEND; // backend origin (no /api)

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

/** Turn “(Clause 10.5)” into clickable links that copy clause text for Find */
function linkifyClauses(text) {
  if (!text) return "";
  const re = /\(Clause\s+([0-9]+(?:\.[0-9]+)*)\)/gi;
  return text.replace(re, (_m, num) => {
    const clause = `Clause ${num}`;
    return `<a href="#" class="clause-link" data-clause="${clause}">(${clause})</a>`;
  });
}

/* ---------- Adobe Embed script loader (one time) ---------- */
function useAdobeSDK() {
  const [ready, setReady] = useState(!!window.AdobeDC);

  useEffect(() => {
    if (window.AdobeDC) {
      setReady(true);
      return;
    }
    const existing = document.querySelector('script[data-adobe="viewer"]');
    if (existing) {
      existing.addEventListener("load", () => setReady(true), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = "https://documentcloud.adobe.com/view-sdk/viewer.js";
    s.async = true;
    s.defer = true;
    s.dataset.adobe = "viewer";
    s.onload = () => setReady(true);
    s.onerror = () => console.error("Adobe Embed SDK failed to load.");
    document.head.appendChild(s);
  }, []);

  return ready;
}

/* ---------- page ---------- */
export default function AskCaiWorkbench() {
  const ADOBE_KEY = process.env.REACT_APP_ADOBE_EMBED_CLIENT_ID || "";

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

  // Always proxy PDFs through backend to avoid CORS everywhere
  const proxiedPdf = useMemo(() => {
    return pdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}` : "";
  }, [pdfUrl]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answerHtml, setAnswerHtml] = useState("");

  // Toast (on clause copy)
  const [toast, setToast] = useState("");

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
          pdf_url: pdfUrl, // send original link (retrieval uses it)
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

  /* Clicking “(Clause …)” copies the clause and shows a toast */
  useEffect(() => {
    const box = document.querySelector(".wb-answer-body");
    if (!box) return;

    const onClick = async (e) => {
      const a = e.target.closest("a.clause-link");
      if (!a) return;
      e.preventDefault();
      const clause = a.getAttribute("data-clause") || a.textContent || "";
      try {
        await navigator.clipboard.writeText(clause);
        setToast(`Copied “${clause}”. Press ⌘F / Ctrl+F and paste to jump.`);
      } catch {
        setToast(`Press ⌘F / Ctrl+F and type “${clause}”.`);
      }
    };

    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, [answerHtml]);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- Adobe Embed init ---------- */
  const adobeReady = useAdobeSDK();

  useEffect(() => {
    if (!adobeReady || !ADOBE_KEY || !proxiedPdf) return;

    const host = document.getElementById("adobe-dc-view");
    if (!host) return;

    // clean host to re-mount
    host.innerHTML = "";

    try {
      const view = new window.AdobeDC.View({
        clientId: ADOBE_KEY,
        divId: "adobe-dc-view",
      });

      view.previewFile(
        {
          content: { location: { url: proxiedPdf } },
          metaData: { fileName: "code.pdf" },
        },
        {
          embedMode: "SIZED_CONTAINER",
          showDownloadPDF: true,
          showPrintPDF: true,
          showLeftHandPanel: true,
          dockPageControls: true,
          defaultViewMode: "FIT_PAGE",
        }
      );
    } catch (err) {
      console.error("Adobe preview error:", err);
    }
  }, [adobeReady, ADOBE_KEY, proxiedPdf]);

  return (
    <div className="workbench" style={{ position: "relative" }}>
      {/* Left: PDF viewer */}
      <section className="wb-left">
        <div className="wb-left-head">
          <div className="wb-doc-pickers">
            <label className="wb-label">Document</label>

            <select
              value={preset}
              onChange={(e) => {
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
                className="wb-select"
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

        <div className="wb-pdf-wrap">
          {/* Adobe host */}
          <div id="adobe-dc-view" className="wb-adobe-host" />
        </div>

        <div className="wb-hint">
          The viewer includes <strong>Find</strong>. Click a cited clause to copy it—then
          press <strong>⌘F</strong> / <strong>Ctrl+F</strong> to jump-search.
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
            <div
              className="wb-answer-body"
              dangerouslySetInnerHTML={{ __html: answerHtml }}
            />
          </div>
        )}
      </section>

      {/* Toast */}
      <div className={`wb-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
