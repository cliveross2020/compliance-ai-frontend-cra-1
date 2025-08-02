import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [clauseData, setClauseData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://compliance-ai-app.onrender.com/api/dashboard/metrics"); 
        const data = await response.json(); // ✅ Fixed variable name
        setClauseData(data.clause_data || []);
        setCompanyData(data.company_data || []);
        setTrendData(data.trend_data || []);
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">📊 ABPI Compliance Dashboard</h1>
      <p className="mb-6 text-gray-600">A visual summary of compliance activity by clause, company, and trend.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📘 Violations by Clause</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clauseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="clause" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="violations" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🏢 Cases by Company</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={companyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="company" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cases" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📅 Monthly Case Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cases" stroke="#FF5722" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
