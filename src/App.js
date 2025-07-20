import './styles.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; // ✅ Import reusable Navbar
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import GlobalComparator from './pages/GlobalComparator';
import AbpiSearch from './pages/AbpiSearch'; // ✅ New ABPI Search page

function App() {
  return (
    <div>
      <Navbar /> {/* ✅ Replaces old nav markup */}
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
