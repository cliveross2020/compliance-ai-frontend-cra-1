import React from 'react';

const Dashboard = () => {
  // Mock data
  const stats = {
    totalClauses: 127,
    totalCases: 346,
    mostCitedClause: 'Clause 9.1 – Misleading claims',
    lastUpdated: 'July 24, 2025',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-[#1a2e22]">📊 ABPI Compliance Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 border border-gray-200">
          <h2 className="text-sm text-gray-500">Total Clauses</h2>
          <p className="text-2xl font-bold text-[#1a2e22]">{stats.totalClauses}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 border border-gray-200">
          <h2 className="text-sm text-gray-500">PMCPA Cases</h2>
          <p className="text-2xl font-bold text-[#1a2e22]">{stats.totalCases}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 border border-gray-200">
          <h2 className="text-sm text-gray-500">Last Updated</h2>
          <p className="text-md font-medium text-[#1a2e22]">{stats.lastUpdated}</p>
        </div>
      </div>

      {/* Charts + Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200 h-64 flex items-center justify-center">
          <p className="text-gray-400">[📈 Chart: Case trends coming soon]</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a2e22] mb-2">Most Cited Clause</h3>
          <p className="text-gray-700">{stats.mostCitedClause}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
