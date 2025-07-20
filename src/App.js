import './styles.css';
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import GlobalComparator from './pages/GlobalComparator';
import AbpiSearch from './pages/AbpiSearch'; // ✅ Import added

function App() {
  return (
    <div>
      <nav className="Navbar">
        <div className="Navbar-brand">
          <span className="Navbar-title">Compliance AI</span>
        </div>
        <ul className="Navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/chatbot">Chatbot</Link></li>
          <li><Link to="/comparator">Comparator</Link></li>
          <li><Link to="/abpi-search">ABPI Search</Link></li> {/* ✅ New link */}
        </ul>
      </nav>
      <main className="Main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/comparator" element={<GlobalComparator />} />
          <Route path="/abpi-search" element={<AbpiSearch />} /> {/* ✅ New route */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
