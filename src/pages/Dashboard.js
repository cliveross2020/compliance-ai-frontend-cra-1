// src/pages/Dashboard.js
import React from 'react';

function Dashboard() {
  return (
    <section className="DashboardPreview">
      <h2>Dashboard Overview</h2>
      <div className="DashboardCards">
        <div className="Card">
          <h3>ABPI Search</h3>
          <p>Quickly reference ABPI clauses and sections.</p>
        </div>
        <div className="Card">
          <h3>Code Comparator</h3>
          <p>Compare promotional activities across compliance codes.</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
