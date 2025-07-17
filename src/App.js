// src/App.js
import './styles.css';
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';

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
        </ul>
      </nav>
      <main className="Main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;