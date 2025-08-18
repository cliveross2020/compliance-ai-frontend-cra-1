import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;
const ADOBE_CLIENT_ID = process.env.REACT_APP_ADOBE_EMBED_CLIENT_ID || "YOUR_ADOBE_CLIENT_ID";

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

/** Turn “(Clause 10.5)” into links we can click to search in the viewer. */
function linkifyClauses(text) {
  if (!text) return "";
  const re = /\(Clause\s+([0-9]+(?:\.[0-9]+)*)\)/gi;
  return text.replace(re, (_m, num) => {
    const clause = `Clause ${num}`;
    return `<a href="#" class="clause-link" data-clause="${clause}">(${clause})</a>`;
  });
}

/** Load Adobe Embed API (once). */
function loadAdobeScript() {
  return new Promise((resolve) => {
    if (window.AdobeDC) return resolve(true);
    const existing = document.querySelector('script[src*="documentcloud.adobe.com/view-sdk/main.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://documentcloud.adobe.com/view-sdk/main.js";
    s.async = true;
    s.onload = () => resolve(true);
    document.body.appendChild(s);
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

  // Adobe viewer refs/state
  const containerRef = useRef(null);
  const adobeViewRef = useRef(null);     // AdobeDC.View instance
  const viewerAPIsRef = useRef(null);    // result of getAPIs()
  const pendingSearchRef = useRef("");   // if user clicks a clause before APIs are ready

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answerHtml, setAnswerHtml] = useState("");

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

  /** Initialize or re-render the Adobe viewer when pdfUrl changes. */
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!pdfUrl || !containerRef.current) return;

      await loadAdobeScript();
      if (!window.AdobeDC || cancelled) return;

      // Create or reuse the viewer
      const adobeView = new window.AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
        divId: "adobe-dc-view",
      });
      adobeViewRef.current = adobeView;

      // Preview the file
      await adobeView.previewFile(
        {
          content: { location: { url: pdfUrl } },
          metaData: { fileName: (pdfUrl.split("/").pop() || "document.pdf") },
        },
        {
          embedMode: "SIZED_CONTAINER",
          defaultViewMode: "FIT_WIDTH",
          showAnnotationTools: false,
          showLeftHandPanel: true,
          showDownloadPDF: true,
        }
      );

      // Pick up viewer APIs when available
      try {
        const apis = await adobeView.getAPIs();
        if (cancelled) return;
        viewerAPIsRef.current = apis;

        // If we queued a search (user clicked a clause early), run it now.
        if (pendingSearchRef.current) {
          try {
            // If the method exists, use it. Otherwise we’ll fall back when clicked again.
            if (apis.search) {
              await apis.search({
                query: pendingSearchRef.current,
                caseSensitive: false,
                wholeWords: false,
                highlightAll: true,
              });
            }
          } catch {}
          pendingSearchRef.current = "";
        }
      } catch {
        // If getAPIs isn’t supported, we’ll still have the native search UI.
      }
    };

    init();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  /** Clicking a “(Clause …)” link -> try to search in the viewer */
  useEffect(() => {
    const box = document.querySelector(".wb-answer-body");
    if (!box) return;

    const onClick = async (e) => {
      const a = e.target.closest("a.clause-link");
      if (!a) return;
      e.preventDefault();
      const clause = a.getAttribute("data-clause") || a.textContent || "";

      const apis = viewerAPIsRef.current;
      if (apis && typeof apis.search === "function") {
        try {
          await apis.search({
            query: clause,
            caseSensitive: false,
            wholeWords: false,
            highlightAll: true,
          });
          return;
        } catch {
          // fall through to clipboard tip
        }
      } else {
        // viewer not ready; queue search once APIs arrive
        pendingSearchRef.current = clause;
      }

      // Fallback: copy & show tip
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(clause);
      } catch {}
      window.setTimeout(() => {
        alert(`Tip: Press ⌘F / Ctrl+F in the viewer and search for “${clause}”.`);
      }, 0);
    };

    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, [answerHtml]);

  return (
    <div className="workbench">
      {/* Left: Adobe PDF Embed viewer */}
      <section className="wb-left">
        <div className="wb-left-head">
          <div className="wb-doc-pickers">
            <label className="wb-label">Document</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
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

        {/* Adobe container (must have fixed height for SIZED_CONTAINER) */}
        <div className="wb-pdf-wrap">
          <div
            id="adobe-dc-view"
            ref={containerRef}
            style={{ width: "100%", height: "calc(100vh - 210px)" }}
          />
        </div>

        <div className="wb-hint">
          The viewer includes its own <strong>Find</strong>. Clicking a clause in the answer
          will jump to search (or copy the clause & show you the shortcut).
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
