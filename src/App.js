import './styles.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AbpiSearch from './pages/AbpiSearch';
import GlobalComparator from './pages/GlobalComparator';
import PmcaseSearch from './pages/PmcaseSearch';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-green-900 text-white px-6 py-4 shadow-md">
          <h1 className="text-xl font-bold mb-2">Compliance AI</h1>
          <nav className="flex gap-4">
            <Link to="/" className="hover:underline">ABPI Search</Link>
            <Link to="/comparator" className="hover:underline">Global Comparator</Link>
            <Link to="/cases" className="hover:underline">PMCPA Case Search</Link>
          </nav>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<AbpiSearch />} />
            <Route path="/comparator" element={<GlobalComparator />} />
            <Route path="/cases" element={<PmcaseSearch />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
