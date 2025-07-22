// src/App.js
import './styles.css';
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import AbpiSearch from './pages/AbpiSearch';
import GlobalComparator from './pages/GlobalComparator';
import PmcaseSearch from './pages/PmcaseSearch';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-green-900 text-white px-6 py-4 shadow-md">
          <h1 className="text-2xl font-bold mb-3">Compliance AI</h1>
          <nav className="flex flex-wrap gap-6 text-base">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/abpi" className="hover:underline">ABPI Search</Link>
            <Link to="/comparator" className="hover:underline">Global Comparator</Link>
            <Link to="/cases" className="hover:underline">PMCPA Case Search</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/chatbot" className="hover:underline">Chatbot</Link>
          </nav>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/abpi" element={<AbpiSearch />} />
            <Route path="/comparator" element={<GlobalComparator />} />
            <Route path="/cases" element={<PmcaseSearch />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
