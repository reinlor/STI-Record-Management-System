import React, { useState } from "react";

const sampleData = [
  {
    name: "Vidal, John Paulo",
    employeeNo: "02000293896",
    violation: "Disrespectful Behavior",
    referredStudent: "Lor, Rehneil B.",
    date: "July 26, 2025",
    status: "In progress",
  },
];

function ViewRequest() {
  const [search, setSearch] = useState("");

  const filtered = sampleData.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.employeeNo.includes(search)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mx-auto mt-8 w-full max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-lg">Request History</span>
        <input
          type="text"
          placeholder="Name/ ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-400 rounded px-3 py-2 w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 font-semibold">NAME</th>
              <th className="px-4 py-2 font-semibold">Employee No.</th>
              <th className="px-4 py-2 font-semibold">Violation</th>
              <th className="px-4 py-2 font-semibold">Referred Student</th>
              <th className="px-4 py-2 font-semibold">Date</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.employeeNo}</td>
                <td className="px-4 py-2">{row.violation}</td>
                <td className="px-4 py-2">{row.referredStudent}</td>
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.status}</td>
                <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-800">
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewRequest;