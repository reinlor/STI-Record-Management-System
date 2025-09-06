import React, { useState, useMemo, useEffect, useContext } from "react";
import axios from "axios";
import ViewRequestModal from "./ViewRequestModal";
import { getStatusClasses } from "../components/statusClasses";
import { CircleCheck, Search, ChevronUp, ChevronDown } from "lucide-react";
import { AuthContext } from "../../../AuthProvider.jsx";

export default function StudentViewRequest({ isLoading = false }) {
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [requestData, setRequestData] = useState([]);
  const [sortColumn, setSortColumn] = useState("timeCreated");
  const [sortDirection, setSortDirection] = useState("desc");
  const { authData, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!authData || !authData.user?.uid) return;
      try {
        const res = await axios.get(`/slip/allSlips/${authData.user.uid}`);
        setRequestData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedAndFilteredData = useMemo(() => {
    let sortedData = [...requestData];

    if (sortColumn) {
      sortedData.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        let valueA = aValue;
        let valueB = bValue;

        if (sortColumn === "timeCreated" && aValue) {
          valueA = typeof aValue === "string" ? new Date(aValue) : new Date(aValue._seconds * 1000);
        }
        if (sortColumn === "timeCreated" && bValue) {
          valueB = typeof bValue === "string" ? new Date(bValue) : new Date(bValue._seconds * 1000);
        }
        
        if (sortColumn === "processedDate" && aValue) {
          valueA = new Date(aValue);
        }
        if (sortColumn === "processedDate" && bValue) {
          valueB = new Date(bValue);
        }

        if (valueA === null || valueA === undefined) return 1;
        if (valueB === null || valueB === undefined) return -1;

        if (valueA < valueB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortedData.filter(
      (row) =>
        (row.typeOfSlip || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.reason || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.status || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [requestData, search, sortColumn, sortDirection]);

  const renderSortIcon = (column) => {
    const isSorted = sortColumn === column;
    const activeColor = "text-yellow-500";
    const inactiveColor = "text-gray-400";

    return (
      <div className="flex flex-col ml-1 items-center justify-center -space-y-1">
        <ChevronUp 
          className={`w-4 h-4 transition-colors duration-200 ${isSorted && sortDirection === 'asc' ? activeColor : inactiveColor}`} 
        />
        <ChevronDown 
          className={`w-4 h-4 transition-colors duration-200 ${isSorted && sortDirection === 'desc' ? activeColor : inactiveColor}`} 
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
      <style>
        {`
          @keyframes smooth-fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-smooth-fade-in {
            animation: smooth-fade-in 0.3s ease-out forwards;
          }
        `}
      </style>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full container mx-auto border border-gray-200 animate-smooth-fade-in">
        {/* Header and Total Slips Card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
            My Request History
          </h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600">Total Slips Submitted</p>
            <p className="text-2xl font-bold text-gray-900">{requestData.length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by type, reason, or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
          />
        </div>

        {/* Loader */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex space-x-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-5 h-5 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-5 h-5 bg-yellow-400 rounded-full animate-bounce" />
            </div>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner bg-gray-50">
            <table className="min-w-full text-left table-auto">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th
                    className="px-6 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("typeOfSlip")}
                  >
                    <div className="flex items-center">
                      Slip Type {renderSortIcon("typeOfSlip")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("timeCreated")}
                  >
                    <div className="flex items-center">
                      Date Submitted {renderSortIcon("timeCreated")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">Reason</th>
                  <th
                    className="px-6 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status {renderSortIcon("status")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("processedDate")}
                  >
                    <div className="flex items-center">
                      Processed Date {renderSortIcon("processedDate")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredData.length > 0 ? (
                  sortedAndFilteredData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="bg-white border-b hover:bg-yellow-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.typeOfSlip}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.timeCreated
                          ? typeof row.timeCreated === "string"
                            ? new Date(row.timeCreated).toLocaleString()
                            : row.timeCreated._seconds
                            ? new Date(row.timeCreated._seconds * 1000).toLocaleString()
                            : "-"
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.reason || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(row.status, "table")}`}
                        >
                          {row.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.processedDate || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          className="py-2 px-4 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200"
                          onClick={() => setSelectedRow(row)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500 text-lg">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal */}
      {selectedRow && (
        <ViewRequestModal
          data={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
}