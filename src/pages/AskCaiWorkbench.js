// src/pages/AskCaiWorkbench.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

// Prefer BACKEND_URL; fall back to older API_ROOT or default
const BACKEND_ROOT =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_ROOT ||
  "https://compliance-ai-app.onrender.com";

const API = BACKEND_ROOT.endsWith("/api")
  ? BACKEND_ROOT
  : `${BACKEND_ROOT.replace(/\/+$/, "")}/api`;

const ADOBE_CLIENT_ID = process.env.REACT_APP_ADOBE_EMBED_CLIENT_ID || "";

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
    .filter((row) => typeof row.url === "string" && row.url.trim())
    .map((row) => {
      const label = `${row.country || "Unknown"} — ${row.code_name || "Code"}`;
      const key = `${label}::${row.url}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return { label, url: row.url };
    })
    .filter(Boolean);
}

/** Turn “(Clause 10.5)” into clickable links that can drive a search */
function linkifyClauses(text) {
  if (!text) return "";
  const re = /\(Clause\s+([0-9]+(?:\.[0-9]+)*)\)/gi;
  return text.replace(re, (_m, num) => {
    const clause = `Clause ${num}`;
    return `<a href="#" class="clause-link" data-clause="${clause}">(${clause})</a>`;
  });
}

/** Load Adobe SDK once */
function loadAdobeScript() {
  return new Promise((resolve, reject) => {
    if (window.AdobeDC) return resolve();
    const existing = document.querySelector('script[data-adobe-view-sdk]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://documentcloud.adobe.com/view-sdk/main.js";
    s.async = true;
    s.dataset.adobeViewSdk = "1";
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
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

  // Same-origin proxy endpoint that streams bytes
  const proxiedPdf = useMemo(() => {
    return pdfUrl ? `${API}/proxy/pdf?url=${encodeURIComponent(pdfUrl)}` : "";
  }, [pdfUrl]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [answerHtml, setAnswerHtml] = useState("");

  // Adobe viewer refs
  const adobeViewRef = useRef(null);
  const adobeApisRef = useRef(null);

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
          pdf_url: pdfUrl, // send the *original* URL for retrieval context
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

  /** Initialize Adobe viewer and (re)render when proxiedPdf changes */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!ADOBE_CLIENT_ID || !proxiedPdf) return;

      try {
        await loadAdobeScript();
        if (cancelled) return;

        // Wait for SDK “ready” if not already available
        if (!window.AdobeDC && typeof window.addEventListener === "function") {
          await new Promise((r) => {
            const handler = () => {
              window.removeEventListener("adobe_dc_view_sdk.ready", handler);
              r();
            };
            window.addEventListener("adobe_dc_view_sdk.ready", handler);
          });
        }

        // Create viewer instance once
        if (!adobeViewRef.current) {
          adobeViewRef.current = new window.AdobeDC.View({
            clientId: ADOBE_CLIENT_ID,
            divId: "adobe-embed-container",
          });
        }

        // Fetch bytes from backend proxy to avoid CORS
        const fileName = (pdfUrl.split("/").pop() || "document.pdf").split("?")[0];
        const filePromise = fetch(proxiedPdf, { credentials: "omit" }).then(async (r) => {
          if (!r.ok) throw new Error(`Proxy fetch failed: ${r.status}`);
          return await r.arrayBuffer();
        });

        adobeViewRef.current
          .previewFile(
            {
              content: { promise: filePromise }, // <— bytes, not URL
              metaData: { fileName },
            },
            {
              embedMode: "SIZED_CONTAINER",
              showDownloadPDF: true,
              showPrintPDF: true,
              showLeftHandPanel: false,
              defaultViewMode: "FIT_WIDTH",
            }
          )
          .then((viewer) => {
            if (viewer && viewer.getAPIs) {
              viewer
                .getAPIs()
                .then((apis) => {
                  adobeApisRef.current = apis;
                })
                .catch(() => {
                  adobeApisRef.current = null;
                });
            }
          })
          .catch((err) => console.error("Adobe preview error:", err));
      } catch (err) {
        console.error("Failed to init Adobe viewer:", err);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [proxiedPdf, pdfUrl]);

  /** Clicking a “(Clause …)” tries to search inside Adobe viewer */
  useEffect(() => {
    const box = document.querySelector(".wb-answer-body");
    if (!box) return;

    const onClick = async (e) => {
      const a = e.target.closest("a.clause-link");
      if (!a) return;
      e.preventDefault();
      const clause = a.getAttribute("data-clause") || a.textContent || "";

      try {
        if (adobeApisRef.current && adobeApisRef.current.search) {
          await adobeApisRef.current.search({ query: clause });
        } else {
          await navigator.clipboard.writeText(clause);
          alert(`Tip: Press ⌘F / Ctrl+F and search for “${clause}”. (Copied to clipboard)`);
        }
      } catch {
        await navigator.clipboard.writeText(clause);
        alert(`Tip: Press ⌘F / Ctrl+F and search for “${clause}”. (Copied to clipboard)`);
      }
    };

    box.addEventListener("click", onClick);
    return () => box.removeEventListener("click", onClick);
  }, [answerHtml]);

  return (
    <div className="workbench">
      {/* Left: Adobe PDF Embed container */}
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

        <div className="wb-pdf-wrap">
          <div
            id="adobe-embed-container"
            style={{ width: "100%", height: "100%", background: "#f7f8f9" }}
          />
        </div>

        <div className="wb-hint">
          The viewer includes <strong>Find</strong>. Click a cited clause to jump-search
          (or we’ll copy it so you can press ⌘F / Ctrl+F).
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
