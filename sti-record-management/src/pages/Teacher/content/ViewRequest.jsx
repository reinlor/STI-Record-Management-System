import React, { useState, useMemo } from "react";
import DisplayInfo from "./DisplayInfo";

function ViewRequest({ referralData = [], isLoading = false }) {
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const filtered = useMemo(() => {
    return referralData.filter(
      (row) =>
        (row.referredBy || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.employeeID || "").includes(search)
    );
  }, [referralData, search]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mx-auto mt-8 w-full max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-lg">Request History</span>
        <input
          type="text"
          placeholder="Name / ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-400 rounded px-3 py-2 w-64"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      ) : (
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
                  <td className="px-4 py-2">{row.referredBy}</td>
                  <td className="px-4 py-2">{row.employeeID}</td>
                  <td className="px-4 py-2">{row.reasonForReferral}</td>
                  <td className="px-4 py-2">{row.studentName}</td>
                  <td className="px-4 py-2">{row.preparedDate}</td>
                  <td className="px-4 py-2">{row.status}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-800 cursor-pointer"
                      onClick={() => setSelectedRow(row)}
                    >
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
      )}

      {selectedRow && (
        <DisplayInfo data={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
}

export default ViewRequest;
