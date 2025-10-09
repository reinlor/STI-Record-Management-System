import React, { useState, useMemo, useRef, useEffect } from "react";
import DisplayInfo from "./DisplayInfo";
import { Search, Loader2, X, ChevronDown, Filter, ChevronUp } from "lucide-react";
import { getStatusClasses } from "../../Student/components/statusClasses";
import LoadingDots from "../../../component/Loading";

export default function ViewRequest({ referralData = [], isLoading = false }) {
  // UI state
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Filters & sorting
  const [filters, setFilters] = useState({
    status: [],
    dateRange: "All",
    customStart: "",
    customEnd: "",
  });
  const [sortOption, setSortOption] = useState("Newest First");

  // Status options for teachers
  const statusOptions = ["Pending", "In Progress", "Resolved", "Denied", "Cancelled"];

  // REF for the status dropdown to detect outside clicks
  const dropdownRef = useRef(null);

  // Effect to handle clicks outside the status dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    }
    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Effect to update window width on resize for responsive logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // helpers: normalize incoming time values to Date
  const parseToDate = (val) => {
    if (!val) return null;
    if (typeof val === "object" && val._seconds) {
      return new Date(val._seconds * 1000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (val) => {
    const d = parseToDate(val);
    return d ? d.toLocaleString() : "-";
  };

  // Helper for text truncation
  const truncateText = (text, limit) => {
    if (!text) return "-";
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
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
    let data = Array.isArray(referralData) ? [...referralData] : [];

    // Filter by statuses (multi-select)
    if (filters.status.length > 0) {
      data = data.filter((r) => filters.status.includes(r.status));
    }

    // Filter by dateRange (based on preparedDate)
    if (filters.dateRange && filters.dateRange !== "All") {
      data = data.filter((r) =>
        isWithinRange(r.preparedDate, filters.dateRange, filters.customStart, filters.customEnd)
      );
    }

    // Search (applies to referredBy, studentName, employeeID, status, reasonForReferral)
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      data = data.filter((row) =>
        (row.referredBy || "").toLowerCase().includes(q) ||
        (row.studentName || "").toLowerCase().includes(q) ||
        (row.employeeID || "").toLowerCase().includes(q) ||
        (row.status || "").toLowerCase().includes(q) ||
        (row.reasonForReferral || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    data.sort((a, b) => {
      const aDate = parseToDate(a.preparedDate);
      const bDate = parseToDate(b.preparedDate);

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
  }, [referralData, filters, search, sortOption]);

  // UI helpers to toggle status checkbox in filters
  const toggleStatusFilter = (status) => {
    setFilters((prev) => {
      const exists = prev.status.includes(status);
      const newStatuses = exists ? prev.status.filter((s) => s !== status) : [...prev.status, status];
      return { ...prev, status: newStatuses };
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      status: [],
      dateRange: "All",
      customStart: "",
      customEnd: "",
    });
    setSortOption("Newest First");
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
      <div className="w-full max-w-screen-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 animate-smooth-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Referral History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing <span className="font-semibold text-blue-500">{processedData.length}</span> results
                {referralData.length ? (
                  <span className="text-gray-500"> of {referralData.length} total</span>
                ) : null}
              </p>
            </div>
            {/* Search and Filters buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center w-full sm:min-w-[280px] md:min-w-[320px] lg:min-w-[400px] border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400">
                <Search className="ml-3 text-gray-400 w-5 h-5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, status, or reason"
                  className="w-full pl-3 pr-4 py-2 bg-transparent text-sm md:text-base focus:outline-none"
                />
              </div>
              {/* Toggle filter button for mobile view */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-200 sm:hidden flex items-center gap-2 whitespace-nowrap"
              >
                <Filter size={16} />
                Filters
              </button>
              <button
                onClick={() => clearFilters()}
                className="px-3 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm hover:bg-red-100 whitespace-nowrap"
                title="Clear all filters"
              >
                Clear filters
              </button>
            </div>
          </div>
          {/* Filters section */}
          <div className={`flex-wrap items-end gap-3 mb-4 ${showFilters ? 'flex' : 'hidden'} sm:flex`}>
            {/* Status multi-select */}
            <div ref={dropdownRef} className="relative flex-grow">
              <label htmlFor="status-select" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <button
                id="status-select"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-yellow-400"
              >
                {filters.status.length > 0 ? filters.status.join(", ") : "All"}
                <ChevronDown size={16} className={`transform transition-transform ${showStatusDropdown ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-20">
                  <div className="flex flex-col gap-1">
                    {statusOptions.map((status) => (
                      <label key={status} className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
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
          {/* Custom date range inputs */}
          {filters.dateRange === "Custom" && showFilters && (
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
            {filters.status.map((s) => (
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
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
            {isLoading ? (
              <LoadingDots />
            ) : (
              <table className="min-w-full text-left table-auto divide-y divide-gray-200">
                <thead className="bg-white sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Referred By</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Employee No.</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Student</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700">Reason</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedData.length > 0 ? (
                    processedData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="bg-white border-b hover:bg-yellow-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{row.referredBy || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.employeeID || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.studentName || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {truncateText(row.reasonForReferral, windowWidth < 640 ? 50 : 100)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(row.preparedDate)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(row.status, "table")}`}>
                            {row.status || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            className="py-2 px-4 bg-yellow-400 text-black font-semibold rounded-lg shadow hover:bg-yellow-500 transition-colors"
                            onClick={() => setSelectedRow(row)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No referrals found.
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
          <DisplayInfo
            data={selectedRow}
            onClose={() => setSelectedRow(null)}
          />
        )}
      </div>
    </div>
  );
}