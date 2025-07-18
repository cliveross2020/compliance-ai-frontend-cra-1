import './styles.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
          <Link to="/chatbot" style={{ margin: '0 10px' }}>Chatbot</Link>
          <Link to="/dashboard" style={{ margin: '0 10px' }}>Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
