import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

const mockClauseData = [
  { name: 'Clause 2', violations: 12 },
  { name: 'Clause 9', violations: 7 },
  { name: 'Clause 12', violations: 15 },
];

const mockCompanyData = [
  { name: 'Pfizer', cases: 10 },
  { name: 'GSK', cases: 8 },
  { name: 'AstraZeneca', cases: 5 },
];

const mockTrendData = [
  { month: 'Jan', cases: 3 },
  { month: 'Feb', cases: 4 },
  { month: 'Mar', cases: 6 },
  { month: 'Apr', cases: 5 },
  { month: 'May', cases: 8 },
  { month: 'Jun', cases: 2 },
];

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">📊 ABPI Compliance Dashboard</h1>
      <p className="mb-6 text-gray-600">A visual summary of compliance activity by clause, company, and trend.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📘 Violations by Clause</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockClauseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="violations" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📊 Cases by Company</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockCompanyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cases" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">📅 Monthly Case Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockTrendData}>
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
