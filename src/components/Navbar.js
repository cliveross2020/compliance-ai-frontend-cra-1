import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/cai-logo.png';

function Navbar() {
  return (
    <nav className="Navbar">
      <div className="Navbar-brand">
        <img src={logo} alt="Compliance AI Logo" className="Navbar-logo" />
        <span className="Navbar-title">
          <span>Compliance</span> <span>AI</span>
        </span>
      </div>
      <ul className="Navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/ask-cai">AskCAI</Link></li>
        <li><Link to="/abpi-search">ABPI Search</Link></li>
        <li><Link to="/comparator">Global Comparator</Link></li>
        <li><Link to="/pmcpa-case-search">PMCPA Case Search</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
