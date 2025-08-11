/* ===========================
   AskCaiWorkbench.css
   =========================== */

.workbench {
  --green: #0b4f44;
  --green-600: #0d5c50;
  --mint: #e8f3f1;
  --bg: #f6faf8;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #e2e8f0;
  --card: #ffffff;
  --shadow-sm: 0 1px 4px rgba(0,0,0,.06);
  --shadow-md: 0 8px 24px rgba(0,0,0,.08);

  display: grid;
  grid-template-columns: 1.15fr .95fr;
  gap: 1.25rem;
  color: var(--text);
}

/* ===== Left (PDF) ===== */

.wb-left {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  padding: 0.75rem 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
}

.wb-left-head {
  padding: .25rem .25rem .75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: .75rem;
}

.wb-doc-pickers {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.wb-label {
  font-size: .9rem;
  font-weight: 700;
  color: var(--green);
  margin-right: .25rem;
}

.wb-select {
  appearance: none;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: .55rem .9rem;
  font-size: .95rem;
  color: var(--text);
  box-shadow: var(--shadow-sm);
  transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}
.wb-select:hover { border-color: #d7e2db; }
.wb-select:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(11,79,68,.12); }
.wb-select.ml { margin-left: .25rem; }

.wb-download {
  margin-left: auto;
  text-decoration: none;
  background: #fff;
  border: 1px solid var(--border);
  color: var(--green);
  font-weight: 700;
  padding: .5rem .8rem;
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
  transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease;
}
.wb-download:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); border-color: #dfe7e3; }

.wb-pdf-wrap {
  margin-top: .75rem;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  flex: 1;
  min-height: 60vh;
}

.wb-pdf {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.wb-hint {
  text-align: right;
  margin-top: .5rem;
  color: var(--muted);
  font-size: .85rem;
}

/* ===== Right (Ask) ===== */

.wb-right {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wb-right h2 {
  margin: 0 0 .25rem;
  color: var(--green);
}

.wb-qbox {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  padding: .75rem;
}

.wb-qbox textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: .75rem .85rem;
  font-size: .98rem;
  color: var(--text);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.wb-qbox textarea:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(11,79,68,.12);
  background: #fff;
}

.wb-qbox-actions {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-top: .6rem;
}

.btn {
  display: inline-block;
  padding: .6rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
}

.btn-primary {
  background: var(--green);
  color: #fff;
  box-shadow: 0 6px 16px rgba(11,79,68,.18);
}
.btn-primary:hover { transform: translateY(-1px); background: var(--green-600); }

.wb-count { margin-left: auto; color: var(--muted); font-size: .85rem; }

.wb-error {
  margin-top: .6rem;
  color: #b42318;
  background: #feeceb;
  border: 1px solid #ffd2ce;
  padding: .55rem .7rem;
  border-radius: 10px;
  font-size: .9rem;
}

/* ===== Answer & citations ===== */

.wb-answer {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  padding: .9rem;
}

.wb-answer-label {
  font-weight: 800;
  color: var(--green);
  margin-bottom: .35rem;
}

.wb-answer-body {
  line-height: 1.55;
  color: var(--text);
}

.wb-citations {
  border-top: 1px solid var(--border);
  margin-top: .75rem;
  padding-top: .6rem;
}

.wb-cite-label {
  font-weight: 700;
  color: var(--green);
  margin-bottom: .35rem;
}

.wb-cite-pills {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

.pill {
  background: var(--mint);
  color: var(--green);
  border-radius: 999px;
  padding: .35rem .6rem;
  font-weight: 700;
  font-size: .85rem;
  border: 1px solid #d8ebe7;
}

.wb-cite-muted {
  color: var(--muted);
  font-size: .9rem;
}

/* ===== Matches ===== */

.wb-matches {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  padding: .9rem;
}

.wb-matches-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .4rem;
}

.wb-matches-head h3 {
  margin: 0;
  color: var(--green);
}

.sub {
  color: var(--muted);
  font-size: .9rem;
}

.wb-muted {
  color: var(--muted);
  font-size: .95rem;
}

.wb-match-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: .65rem;
  max-height: 340px;
  overflow-y: auto;
}

/* custom scrollbar */
.wb-match-list::-webkit-scrollbar { width: 8px; }
.wb-match-list::-webkit-scrollbar-thumb { background: rgba(11,79,68,.28); border-radius: 4px; }
.wb-match-list::-webkit-scrollbar-track { background: transparent; }

.wb-match {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 10px;
  padding: .7rem .75rem;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.wb-match:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,.05); border-color: #dfe7e3; }

.wb-match-clause {
  font-weight: 800;
  color: var(--green);
  margin-bottom: .25rem;
}

.wb-match-text {
  color: var(--text);
  line-height: 1.5;
  font-size: .96rem;
}

/* ===== Responsive ===== */

@media (max-width: 1100px) {
  .workbench {
    grid-template-columns: 1fr;
  }
  .wb-left, .wb-right {
    min-height: auto;
  }
  .wb-pdf-wrap { min-height: 55vh; }
}
