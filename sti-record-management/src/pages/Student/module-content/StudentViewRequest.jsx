import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import ViewRequestModal from "./ViewRequestModal";
import { getStatusClasses } from "../components/statusClasses";
import { Search, Loader2, X, ChevronDown } from "lucide-react";
import { AuthContext } from "../../../AuthProvider.jsx";

export default function StudentViewRequest() {
  const { authData } = useContext(AuthContext);

  // data + ui state
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Filters & sorting
  const [filters, setFilters] = useState({
    formType: "All",
    statuses: [],
    dateRange: "All",
    customStart: "",
    customEnd: "",
  });
  const [sortOption, setSortOption] = useState("Newest First");

  // fetch slips
  useEffect(() => {
    const fetchData = async () => {
      if (!authData || !authData.user?.uid) {
        setRequestData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`/slip/allSlips/${authData.user.uid}`);
        setRequestData(res.data || []);
      } catch (err) {
        console.error("Error fetching slips:", err);
        setRequestData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authData]);

  // helpers: normalize incoming time values to Date
  const parseToDate = (val) => {
    if (!val) return null;
    // Firestore-like timestamp { _seconds: number, _nanoseconds: number }
    if (typeof val === "object" && val._seconds) {
      return new Date(val._seconds * 1000);
    }
    // ISO string or number
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (val) => {
    const d = parseToDate(val);
    return d ? d.toLocaleString() : "-";
  };

  // Date range helpers
  const isWithinRange = (val, range, customStart, customEnd) => {
    const d = parseToDate(val);
    if (!d) return false;
    const now = new Date();

    if (range === "All") return true;
    if (range === "Today") {
      return d.toDateString() === now.toDateString();
    }
    if (range === "This Week") {
      // week starts Sunday
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return d >= startOfWeek && d <= now;
    }
    if (range === "This Month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (range === "This Year") {
      return d.getFullYear() === now.getFullYear();
    }
    if (range === "Custom") {
      const s = customStart ? new Date(customStart) : null;
      const e = customEnd ? new Date(customEnd) : null;
      if (s && e) {
        // normalize to include entire end day
        e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      }
      if (s) return d >= s;
      if (e) {
        e.setHours(23, 59, 59, 999);
        return d <= e;
      }
      return true;
    }
    return true;
  };

  // processedData: apply filters, search, sort
  const processedData = useMemo(() => {
    let data = Array.isArray(requestData) ? [...requestData] : [];

    // Filter by formType
    if (filters.formType !== "All") {
      data = data.filter((r) => r.typeOfSlip === filters.formType);
    }

    // Filter by statuses (multi-select)
    if (filters.statuses.length > 0) {
      data = data.filter((r) => filters.statuses.includes(r.status));
    }

    // Filter by dateRange (based on timeCreated)
    if (filters.dateRange && filters.dateRange !== "All") {
      data = data.filter((r) =>
        isWithinRange(r.timeCreated, filters.dateRange, filters.customStart, filters.customEnd)
      );
    }

    // Search (applies to reason, form type, status)
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      data = data.filter((r) => {
        const typeMatch = (r.typeOfSlip || "").toLowerCase().includes(q);
        const reasonMatch = (r.reason || "").toLowerCase().includes(q);
        const statusMatch = (r.status || "").toLowerCase().includes(q);
        return typeMatch || reasonMatch || statusMatch;
      });
    }

    // Sorting
    data.sort((a, b) => {
      // handle timeCreated parsing safely
      const aDate = parseToDate(a.timeCreated);
      const bDate = parseToDate(b.timeCreated);

      if (sortOption === "Newest First") {
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate - aDate;
      }
      if (sortOption === "Oldest First") {
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate - bDate;
      }
      return 0;
    });

    return data;
  }, [requestData, filters, search, sortOption]);

  // UI helpers to toggle status checkbox in filters
  const toggleStatusFilter = (status) => {
    setFilters((prev) => {
      const exists = prev.statuses.includes(status);
      const newStatuses = exists ? prev.statuses.filter((s) => s !== status) : [...prev.statuses, status];
      return { ...prev, statuses: newStatuses };
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      formType: "All",
      statuses: [],
      dateRange: "All",
      customStart: "",
      customEnd: "",
    });
    setSortOption("Newest First");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
      <div className="w-full max-w-screen-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">My Request History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing <span className="font-semibold text-blue-500">{processedData.length}</span> results
                {requestData.length ? (
                  <span className="text-gray-500"> of {requestData.length} total</span>
                ) : null}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center w-full sm:min-w-[280px] md:min-w-[320px] lg:min-w-[400px] border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400">
                    <Search className="ml-3 text-gray-400 w-5 h-5" />
                    <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by form, reason, or status"
                    className="w-full pl-3 pr-4 py-2 bg-transparent text-sm md:text-base focus:outline-none"
                    />
                </div>

              <button
                onClick={() => clearFilters()}
                className="px-3 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm hover:bg-red-100 whitespace-nowrap"
                title="Clear all filters"
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            {/* Form Type */}
            <div className="flex-grow">
              <label htmlFor="form-type-select" className="block text-xs font-medium text-gray-500 mb-1">Form Type</label>
              <select
                id="form-type-select"
                value={filters.formType}
                onChange={(e) => setFilters((p) => ({ ...p, formType: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-yellow-400"
              >
                <option value="All">All Forms</option>
                <option value="Absent Slip">Absent Slip</option>
                <option value="Incident Report Form">Incident Report Form</option>
              </select>
            </div>

            {/* Status multi-select */}
            <div className="relative flex-grow">
              <label htmlFor="status-select" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <button
                id="status-select"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-yellow-400"
              >
                {filters.statuses.length > 0 ? filters.statuses.join(", ") : "All"}
                <ChevronDown size={16} className={`transform transition-transform ${showStatusDropdown ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-20">
                  <div className="flex flex-col gap-1">
                    {["Pending", "Approved", "Denied"].map((status) => (
                      <label key={status} className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={filters.statuses.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 rounded"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date range */}
            <div className="flex-grow">
              <label htmlFor="date-range-select" className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <select
                id="date-range-select"
                value={filters.dateRange}
                onChange={(e) => setFilters((p) => ({ ...p, dateRange: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-yellow-400"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
                <option value="Custom">Custom Range</option>
              </select>
            </div>

            {/* Sort options */}
            <div className="flex-grow">
              <label htmlFor="sort-select" className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* Custom date range inputs (visible only when Custom selected) */}
          {filters.dateRange === "Custom" && (
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="date"
                value={filters.customStart}
                onChange={(e) => setFilters((p) => ({ ...p, customStart: e.target.value }))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm w-full md:w-1/2 focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="date"
                value={filters.customEnd}
                onChange={(e) => setFilters((p) => ({ ...p, customEnd: e.target.value }))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm w-full md:w-1/2 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}

          {/* Active filter tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.formType !== "All" && (
              <span className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {filters.formType}
                <button
                  onClick={() => setFilters((p) => ({ ...p, formType: "All" }))}
                  className="ml-1 text-yellow-700 font-bold"
                  aria-label="remove form type filter"
                >
                  <X size={12}/>
                </button>
              </span>
            )}

            {filters.statuses.map((s) => (
              <span key={s} className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm">
                {s}
                <button
                  onClick={() => toggleStatusFilter(s)}
                  className="ml-1 text-green-700 font-bold"
                  aria-label={`remove status ${s}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {filters.dateRange !== "All" && (
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                {filters.dateRange === "Custom"
                  ? `Custom: ${filters.customStart || "—"} → ${filters.customEnd || "—"}`
                  : filters.dateRange}
                <button
                  onClick={() => setFilters((p) => ({ ...p, dateRange: "All", customStart: "", customEnd: "" }))}
                  className="ml-1 text-blue-700 font-bold"
                >
                  <X size={12}/>
                </button>
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <table className="min-w-full text-left table-auto divide-y divide-gray-200">
                <thead className="bg-white sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Form Type</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Date Submitted</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700">Reason</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Processed Date</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedData.length > 0 ? (
                    processedData.map((row, idx) => (
                      <tr key={idx} className="bg-white border-b hover:bg-yellow-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{row.typeOfSlip}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(row.timeCreated)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{row.reason || "-"}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(row.status, "table")}`}>
                            {row.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(row.processedDate)}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedRow(row)}
                            className="py-2 px-4 bg-yellow-400 text-black rounded-lg font-semibold shadow hover:bg-yellow-500 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedRow && (
          <ViewRequestModal
            data={selectedRow}
            onClose={() => setSelectedRow(null)}
          />
        )}
      </div>
    </div>
  );
}