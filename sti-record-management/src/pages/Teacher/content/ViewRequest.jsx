import React, { useState, useMemo } from "react";
import DisplayInfo from "./DisplayInfo";

export default function ViewRequest({ referralData = [], isLoading = false }) {
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const filtered = useMemo(() => {
    return referralData.filter(
      (row) =>
        (row.referredBy || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.employeeID || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.status || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [referralData, search]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 font-medium";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 font-medium";
      case "Rejected":
        return "bg-red-100 text-red-700 font-medium";
      default:
        return "bg-gray-200 text-gray-700 font-medium";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mx-auto mt-10 w-full max-w-6xl font-sans border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-4 md:mb-0">
          Referral History
        </h2>
        <input
          type="text"
          placeholder="Search by name, ID, or status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex space-x-3">
            <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-left table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Referred By</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Employee No.</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Student</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Reason</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Date</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((row, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.referredBy || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.employeeID || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.studentName || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.reasonForReferral || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.preparedDate || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(row.status)}`}>
                        {row.status || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform duration-100 transform active:scale-95"
                        onClick={() => setSelectedRow(row)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500 text-lg">
                    No referrals found.
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