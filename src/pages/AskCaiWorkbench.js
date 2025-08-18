// src/pages/AskCaiWorkbench.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

/* ---------- Backend roots ---------- */
const RAW =
  process.env.REACT_APP_API_ROOT ||
  process.env.REACT_APP_BACKEND_URL ||
  "https://compliance-ai-app.onrender.com";
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

/** Turn “(Clause 10.5)” into clickable links */
function linkifyClauses(text) {
  if (!text) return "";
  const re = /\(Clause\s+([0-9]+(?:\.[0-9]+)*)\)/gi;
  return text.replace(re, (_m, num) => {
    const clause = `Clause ${num}`;
    return `<a href="#" class="clause-link" data-clause="${clause}">(${clause})</a>`;
  });
}

/* ---------- Adobe SDK loader ---------- */
function ensureAdobeSdk() {
  if (window.AdobeDC) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const id = "adobe-pdf-embed-sdk";
    if (document.getElementById(id)) {
      const check = () =>
        window.AdobeDC ? resolve() : setTimeout(check, 80);
      check();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://acrobatservices.adobe.com/view-sdk/viewer.js";
    s.async = true;
    s.onload = () => {
      const check = () =>
        window.AdobeDC ? resolve() : setTimeout(check, 80);
      check();
    };
    s.onerror = () => reject(new Error("Failed to load Adobe viewer"));
    document.head.appendChild(s);
  });
}

/* ---------- component ---------- */
export default function AskCaiWorkbench() {
  // PDF selection
  const ALL_PDFS = useMemo(buildPdfOptions, []);
  const [preset, setPreset] = useState("abpi"); // abpi | efpia | ifpma | other
  const [otherUrl, setOtherUrl] = useState("");
  const [loadError, setLoadError] = useState("");
  const [copyHint, setCopyHint] = useState(""); // transient hint after clicking a clause

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

  // Same-origin URL via backend proxy (prevents CORS)
  const proxiedPdf = useMemo(() => {
    return pdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}` : "";
  }, [pdfUrl]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answerHtml, setAnswerHtml] = useState("");

  const canAsk = question.trim().length > 2 && !asking;

  // Adobe container refs
  const containerRef = useRef(null); // outer container
  const viewerRef = useRef(null);    // inner div for Adobe

  /** Small helpers for PDF validation */
  function bytesToString(buf, max = 8) {
    const arr = new Uint8Array(buf.slice(0, max));
    return Array.from(arr).map((b) => String.fromCharCode(b)).join("");
  }

  async function loadIntoAdobe(proxiedUrl) {
    setLoadError("");

    // ensure SDK
    try {
      await ensureAdobeSdk();
    } catch (e) {
      setLoadError(e.message || String(e));
      return;
    }

    // Fetch PDF bytes from backend
    let res;
    try {
      res = await fetch(proxiedUrl, { credentials: "omit" });
    } catch (e) {
      setLoadError(`Couldn’t reach backend proxy: ${e.message || e}`);
      return;
    }
    if (!res.ok) {
      let body = "";
      try {
        body = await res.text();
      } catch {
        body = "Upstream error";
      }
      setLoadError(`Proxy error ${res.status}: ${body}`);
      return;
    }

    let buf;
    try {
      buf = await res.arrayBuffer();
    } catch (e) {
      setLoadError(`Failed to read file bytes: ${e.message || e}`);
      return;
    }

    // Validate bytes look like a PDF
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const head = bytesToString(buf, 8).toUpperCase();
    const looksPdf = ct.includes("application/pdf") || head.includes("%PDF");
    if (!looksPdf) {
      setLoadError(
        "This link didn’t return a PDF (server sent HTML or another type). Use “Download PDF”, or update the JSON with a direct PDF link."
      );
      return;
    }

    // Create viewer wrapper if needed
    if (containerRef.current && !viewerRef.current) {
      const inner = document.createElement("div");
      inner.id = "adobe-dc-view";
      inner.style.width = "100%";
      inner.style.height = "100%";
      containerRef.current.appendChild(inner);
      viewerRef.current = inner;
    }
    if (!viewerRef.current) return;

    // Clear previous render (if any)
    viewerRef.current.innerHTML = "";

    // Render with Adobe
    try {
      const adobeDCView = new window.AdobeDC.View({
        clientId: process.env.REACT_APP_ADOBE_EMBED_CLIENT_ID,
        divId: viewerRef.current.id,
      });

      await adobeDCView.previewFile(
        {
          content: { promise: Promise.resolve(buf) },
          metaData: { fileName: "document.pdf" },
        },
        {
          embedMode: "SIZED_CONTAINER",
          showZoomControl: true,
          showAnnotationTools: false,
          showLeftHandPanel: true,
          defaultViewMode: "FIT_PAGE",
        }
      );
    } catch (e) {
      setLoadError(`Adobe viewer error: ${e.message || e}`);
    }
  }

  // Create the container once
  useEffect(() => {
    // nothing: containerRef is bound via JSX
  }, []);

  // Re-load the viewer when the selected PDF changes
  useEffect(() => {
    if (!proxiedPdf) return;
    loadIntoAdobe(proxiedPdf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxiedPdf]);

  // Handle clickable “(Clause …)” links: copy to clipboard for quick viewer search
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
        setCopyHint(`Copied “${clause}”. Press ⌘F / Ctrl+F and paste to jump.`);
        setTimeout(() => setCopyHint(""), 2500);
      } catch {
        setCopyHint(`Press ⌘F / Ctrl+F and type: ${clause}`);
        setTimeout(() => setCopyHint(""), 2500);
      }
    };
    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, [answerHtml]);

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

  return (
    <div className="workbench">
      {/* Left: Adobe Embed viewer */}
      <section className="wb-left">
        <div className="wb-left-head">
          <div className="wb-doc-pickers">
            <label className="wb-label">Document</label>
            <select
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value);
                setLoadError("");
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
                  setOtherUrl(e.target.value);
                  setLoadError("");
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
          {/* Adobe viewer container */}
          <div
            id="adobe-pdf-container"
            ref={containerRef}
            style={{ width: "100%", height: "78vh" }}
          />
          {!pdfUrl && <div className="wb-pdf-placeholder">Select a document…</div>}
        </div>

        <div className="wb-hint">
          The viewer includes <strong>Find</strong>. Click a cited clause to copy it—then
          press <strong>⌘F</strong> / <strong>Ctrl+F</strong> to jump-search.
          {loadError && <div className="wb-error" style={{ marginTop: 8 }}>{loadError}</div>}
          {copyHint && <div className="wb-tip" style={{ marginTop: 8 }}>{copyHint}</div>}
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
    </div>
  );
}
