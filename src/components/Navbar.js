import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const Navbar = () => {
  return (
    <nav className="Navbar">
      <div className="Navbar-brand">
        <span className="Navbar-title">Compliance AI</span>
      </div>
      <ul className="Navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/chatbot">Chatbot</Link></li>
        <li><Link to="/comparator">Comparator</Link></li>
        <li><Link to="/abpi-search">ABPI Search</Link></li> {/* ✅ Newly added */}
      </ul>
    </nav>
  );
};

export default Navbar;
