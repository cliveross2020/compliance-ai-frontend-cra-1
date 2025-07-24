import React from "react";

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4 text-green-900">📊 ABPI Compliance Dashboard</h1>
      <p className="text-gray-700 mb-8">
        Welcome to your real-time view of compliance metrics across ABPI clauses and company cases.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chart 1 */}
        <div className="bg-white shadow-md rounded-xl p-4 h-64 flex items-center justify-center border border-gray-200">
          <span className="text-gray-500">📈 Violations by Clause (placeholder)</span>
        </div>

        {/* Chart 2 */}
        <div className="bg-white shadow-md rounded-xl p-4 h-64 flex items-center justify-center border border-gray-200">
          <span className="text-gray-500">🏢 Cases by Company (placeholder)</span>
        </div>

        {/* Chart 3 */}
        <div className="bg-white shadow-md rounded-xl p-4 h-64 flex items-center justify-center border border-gray-200">
          <span className="text-gray-500">📅 Monthly Case Trends (placeholder)</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
