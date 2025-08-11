// src/pages/AskCaiWorkbench.js
import React, { useMemo, useRef, useState } from "react";
import "./AskCaiWorkbench.css";
import comparatorData from "../data/global_comparator.json";

const RAW = process.env.REACT_APP_API_ROOT || "https://compliance-ai-app.onrender.com";
const API = RAW.endsWith("/api") ? RAW : `${RAW.replace(/\/+$/, "")}/api`;

/** Helper: prefer UK ABPI 2024 as default */
function defaultAbpiUrl() {
  // find a UK ABPI 2024 PDF if possible, else first UK PDF, else first PDF we have
  const pdfs = (comparatorData || []).filter((r) => typeof r.url === "string" && /\.pdf(\?|$)/i.test(r.url));
  const abpi = pdfs.find(
    (r) =>
      /United Kingdom/i.test(r.country || "") &&
      /ABPI/i.test(r.code_name || "") &&
      /2024|2025/i.test(r.code_name || "")
  );
  if (abpi) return abpi.url;
  const uk = pdfs.find((r) => /United Kingdom/i.test(r.country || ""));
  if (uk) return uk.url;
  return pdfs[0]?.url || "https://www.abpi.org.uk/media/xmbnr12q/final-2024-abpi-code-_interactive.pdf";
}

/** Build a list of all PDF codes from the comparator JSON */
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

export default function AskCaiWorkbench() {
  // PDF selection
  const ALL_PDFS = useMemo(buildPdfOptions, []);
  const [preset, setPreset] = useState("abpi"); // "abpi" | "efpia" | "ifpma" | "other"
  const [otherUrl, setOtherUrl] = useState("");

  // Resolve the active PDF URL
  const pdfUrl = useMemo(() => {
    if (preset === "abpi") {
      return defaultAbpiUrl();
    }
    if (preset === "efpia") {
      // a stable EFPIA PDF from your data if present, else fallback
      const pick =
        ALL_PDFS.find(
          (r) => /Europe\s*\(EFPIA\)/i.test(r.label) && /Code of Practice/i.test(r.label)
        )?.url ||
        "https://www.efpia.eu/media/f2ccf3yd/efpia-code-of-practice-16052025.pdf";
      return pick;
    }
    if (preset === "ifpma") {
      const pick =
        ALL_PDFS.find((r) => /IFPMA/i.test(r.label))?.url ||
        "https://www.ifpma.org/wp-content/uploads/2018/09/2023_IFPMA-Code-Interactive.pdf";
      return pick;
    }
    // other
    return otherUrl || defaultAbpiUrl();
  }, [preset, otherUrl, ALL_PDFS]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  // Results
  const [matches, setMatches] = useState([]);          // [{clause, text}]
  const [answer, setAnswer] = useState("");            // string (≤350)
  const [usedClauses, setUsedClauses] = useState([]);  // ["Clause 10.5", "Clause 19.2", ...]

  const iframeRef = useRef(null);
  const canAsk = question.trim().length > 2 && !asking;

  async function ask() {
    const q = question.trim();
    if (!q) return;

    setAsking(true);
    setError(null);
    setAnswer("");
    setMatches([]);
    setUsedClauses([]);

    try {
      // For now the backend uses ABPI matches regardless of PDF selection.
      // We still pass doc=preset so we can switch later when EFPIA paragraphs are ingested.
      const res = await fetch(`${API}/askcai/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          doc: preset,     // "abpi" | "efpia" | "ifpma" | "other"
          top_k: 6,
          max_words: 350,
        }),
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
      {/* Left: PDF viewer (native → has Find) */}
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

            <a className="wb-download" href={pdfUrl} target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </div>
        </div>

        <div className="wb-pdf-wrap">
          <iframe
            ref={iframeRef}
            className="wb-pdf"
            title="Code PDF"
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
          />
        </div>
        <div className="wb-hint">
          Tip: press <strong>⌘F</strong> / <strong>Ctrl+F</strong> to find inside the PDF.
        </div>
      </section>

      {/* Right: AskCAI + matches */}
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
            <div className="wb-answer-label">Answer (≤ 350 words)</div>
            <div className="wb-answer-body">{answer}</div>

            <div className="wb-citations">
              <div className="wb-cite-label">Cited clauses</div>
              {usedClauses.length ? (
                <div className="wb-cite-pills">
                  {usedClauses.map((c, i) => (
                    <span className="pill" key={`${c}-${i}`}>
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="wb-cite-muted">
                  No clause references detected. (The backend enforces citations; try a more specific question.)
                </div>
              )}
            </div>
          </div>
        )}

        <div className="wb-matches">
          <div className="wb-matches-head">
            <h3>Relevant clauses</h3>
            <div className="sub">Top matches used to ground the answer.</div>
          </div>
          {matches.length === 0 ? (
            <div className="wb-muted">No matches yet. Ask a question to see clause hits.</div>
          ) : (
            <ul className="wb-match-list">
              {matches.map((m, i) => (
                <li key={i} className="wb-match">
                  <div className="wb-match-clause">{m.clause || "Clause"}</div>
                  <div className="wb-match-text">{m.text}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
