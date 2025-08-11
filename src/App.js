import './styles.css';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import AbpiSearch from './pages/AbpiSearch';
import GlobalComparator from './pages/GlobalComparator';
import PmcaseSearch from './pages/PmcaseSearch';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import AskCaiWorkbench from "./pages/AskCaiWorkbench";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/askcai" element={<AskCAI />} />
          <Route path="/askcai" element={<AskCaiWorkbench />} />
          <Route path="/abpi" element={<AbpiSearch />} />
          <Route path="/comparator" element={<GlobalComparator />} />
          <Route path="/cases" element={<PmcaseSearch />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
