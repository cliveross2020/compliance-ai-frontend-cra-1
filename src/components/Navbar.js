import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/cai-logo.png';
import './Navbar.css';

function Navbar() {
  const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <nav className="Navbar">
      <div className="Navbar-brand">
        <img src={logo} alt="Compliance AI Logo" className="Navbar-logo" />
        <span className="Navbar-title">
          <span>Compliance</span> <span>AI</span>
        </span>
      </div>

      <ul className="Navbar-links">
        <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
        <li><NavLink to="/askcai" className={({isActive})=>isActive?"active":undefined}>AskCAI</NavLink></li>
        <li><NavLink to="/comparator" className={linkClass}>Global Comparator</NavLink></li>
        <li><NavLink to="/cases" className={linkClass}>PMCPA Case Search</NavLink></li>
        <li><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
