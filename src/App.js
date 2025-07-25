import './styles.css';
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import AbpiSearch from './pages/AbpiSearch';
import GlobalComparator from './pages/GlobalComparator';
import PmcaseSearch from './pages/PmcaseSearch';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AskCAI from './pages/AskCAI';
import logo from './assets/CAI Logo 2.png';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="Navbar">
        <div className="Navbar-brand">
          <img src={logo} alt="Compliance AI Logo" className="Navbar-logo" />
          <div className="Navbar-title">
            <span>Compliance</span> <span>AI</span>
          </div>
        </div>
        <ul className="Navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/abpi">ABPI Search</Link></li>
          <li><Link to="/comparator">Global Comparator</Link></li>
          <li><Link to="/cases">PMCPA Case Search</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/ask-cai">AskCAI</Link></li>
        </ul>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/abpi" element={<AbpiSearch />} />
          <Route path="/comparator" element={<GlobalComparator />} />
          <Route path="/cases" element={<PmcaseSearch />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ask-cai" element={<AskCAI />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

