import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/cai-logo.png';
import './Navbar.css';

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
        <li>
          <NavLink to="/" end activeClassName="active">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/ask-cai" activeClassName="active">
            Ask CAI
          </NavLink>
        </li>
        <li>
          <NavLink to="/abpi-search" activeClassName="active">
            ABPI Search
          </NavLink>
        </li>
        <li>
          <NavLink to="/comparator" activeClassName="active">
            Global Comparator
          </NavLink>
        </li>
        <li>
          <NavLink to="/pmcpa-case-search" activeClassName="active">
            PMCPA Case Search
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" activeClassName="active">
            Dashboard
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
