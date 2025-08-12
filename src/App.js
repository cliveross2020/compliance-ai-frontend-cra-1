// src/App.js
import './styles.css';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import GlobalComparator from './pages/GlobalComparator';
import PmcaseSearch from './pages/PmcaseSearch';
import Dashboard from './pages/Dashboard';
import AskCaiWorkbench from './pages/AskCaiWorkbench'; // ✅ new page

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comparator" element={<GlobalComparator />} />
          <Route path="/cases" element={<PmcaseSearch />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Route AskCAI to the new workbench */}
          <Route path="/askcai" element={<AskCaiWorkbench />} />
          {/* optional: old path alias */}
          <Route path="/ask-cai" element={<Navigate to="/askcai" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
