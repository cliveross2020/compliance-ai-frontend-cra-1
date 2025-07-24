import React from "react";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

const clauseData = [
  { clause: "Clause 2", violations: 10 },
  { clause: "Clause 3", violations: 5 },
  { clause: "Clause 7", violations: 14 },
  { clause: "Clause 12", violations: 8 },
];

const companyData = [
  { name: "Pfizer", value: 12 },
  { name: "GSK", value: 9 },
  { name: "Novartis", value: 7 },
  { name: "AZ", value: 5 },
];

const trendData = [
  { month: "Jan", cases: 5 },
  { month: "Feb", cases: 8 },
  { month: "Mar", cases: 6 },
  { month: "Apr", cases: 10 },
  { month: "May", cases: 7 },
];

const COLORS = ["#4caf50", "#81c784", "#a5d6a7", "#c8e6c9"];

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4 text-green-900">📊 ABPI Compliance Dashboard</h1>
      <p className="text-gray-700 mb-8">
        A visual summary of compliance activity by clause, company, and trend.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chart 1: Violations by Clause */}
        <div className="bg-white shadow-md rounded-xl p-4 h-80 border border-gray-200">
          <h2 className="text-lg font-medium mb-2">📘 Violations by Clause</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={clauseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clause" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="violations" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Cases by Company */}
        <div className="bg-white shadow-md rounded-xl p-4 h-80 border border-gray-200">
          <h2 className="text-lg font-medium mb-2">🏢 Cases by Company</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={companyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {companyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Monthly Case Trends */}
        <div className="bg-white shadow-md rounded-xl p-4 h-80 border border-gray-200">
          <h2 className="text-lg font-medium mb-2">📅 Monthly Case Trends</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#4caf50" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
