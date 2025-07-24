import React, { useEffect, useState } from 'react';
import './AbpiDashboard.css';

const AbpiDashboard = () => {
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for future API call
    const fetchDashboardData = async () => {
      try {
        // Simulate API delay
        setTimeout(() => {
          setSummaryStats({
            totalClauses: 102,
            mostCitedClause: 'Clause 2',
            totalViolations: 387,
            topCompanies: ['PharmaCorp', 'MediLife', 'Healthix'],
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>📊 ABPI Compliance Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : summaryStats ? (
        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Clauses</h3>
            <p>{summaryStats.totalClauses}</p>
          </div>
          <div className="card">
            <h3>Total Violations</h3>
            <p>{summaryStats.totalViolations}</p>
          </div>
          <div className="card">
            <h3>Most Cited Clause</h3>
            <p>{summaryStats.mostCitedClause}</p>
          </div>
          <div className="card">
            <h3>Top Companies</h3>
            <ul>
              {summaryStats.topCompanies.map((company, index) => (
                <li key={index}>{company}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default AbpiDashboard;
