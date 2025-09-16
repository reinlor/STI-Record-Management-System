import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import RequestSlipHistory from "./RequestSlipHistory.jsx";
import axios from "axios";
import historyW from "../../../assets/history.png";
import closeB from "../../../assets/closeblack.png";
import closeW from "../../../assets/close.png";
import checkW from "../../../assets/check.png";
import { AuthContext } from '../../../AuthProvider.jsx';

import {
    Search,
    User,
    Clipboard,
    Plus,
    Check,
    X,
    Clock,
    ChevronLeft,
    ChevronRight,
    ClipboardList
  } from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SLIP_TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "Absent Slip", label: "Absent Slip" },
  { value: "Incident Report", label: "Incident Report" },
];

const DATE_FILTER_OPTIONS = [
  { value: "", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

// Helper for date filtering
function isWithinDate(ms, filter) {
  if (!ms) return false;
  const now = new Date();
  const date = new Date(ms);
  switch (filter) {
    case "today":
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    case "week": {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return date >= startOfWeek && date <= endOfWeek;
    }
    case "month":
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    case "year":
      return date.getFullYear() === now.getFullYear();
    default:
      return true;
  }
}

function parseToMillis(dateInput) {
  // Your existing date parsing logic
  if (!dateInput) return null;

  if (typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
    try {
      return dateInput.toDate().getTime();
    } catch {
      return null;
    }
  }

  if (typeof dateInput === 'object' && (dateInput.seconds !== undefined || dateInput._seconds !== undefined)) {
    const seconds = dateInput.seconds ?? dateInput._seconds;
    const nanos = dateInput.nanoseconds ?? dateInput._nanoseconds ?? 0;
    return (Number(seconds) * 1000) + Math.floor(Number(nanos) / 1e6);
  }

  if (typeof dateInput === 'number') {
    return dateInput > 1e12 ? dateInput : dateInput * 1000;
  }

  if (typeof dateInput === 'string') {
    const parsed = Date.parse(dateInput);
    if (!isNaN(parsed)) return parsed;

    const simplified = dateInput.replace(/\s+at\s+/i, ' ').replace(/UTC.*$/i, '').trim();
    const parsed2 = Date.parse(simplified);
    if (!isNaN(parsed2)) return parsed2;
  }

  return null;
}

function formatDate(dateInput) {
  // Your existing date formatting logic
  const ms = typeof dateInput === 'number' ? dateInput : parseToMillis(dateInput);
  if (!ms) return '';
  const d = new Date(ms);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function RequestSlip() {
  const [display, setDisplay] = useState(false);
  const [allSlipData, setAllSlipData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filterSlipType, setFilterSlipType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [body, setBody] = useState("Please proceed to the Guidance and Counseling Office");
  const [sortBy, setSortBy] = useState("newest");

  // Add state for editable remarks
  const [remarks, setRemarks] = useState("");

  if (!authData?.user?.access?.requestSlip) {
    const error401 = () => {
      navigate('/error401')
    }
    return error401()
  }

  const handleStatusChange = async (slipType, slipId, status, slip) => {
    try {
      console.log(remarks)
      // Include remarks if Absent Slip
      const updatePayload = slipType === "Absent Slip"
        ? { status, remarks }
        : { status };
      
        console.log(updatePayload)

      await axios.put(`/slip/update/${slipType}/${slipId}`, updatePayload);

      const emailData = {
        to: slip.email,
        subject: `Your ${slipType} Request has been ${status}`,
        text: `Hello ${slip.name},\n\nYour ${slipType} submitted on ${slip.timeCreatedFormatted} has been ${status}.\n\n ${body} \n\n- Admin`
      };

      await axios.post("/email/send", emailData);

      setAllSlipData((prev) =>
        prev.map((s) =>
          s._id === slipId
            ? { ...s, status, ...(slipType === "Absent Slip" ? { remarks } : {}) }
            : s
        )
      );

      toast.success(`Slip updated to ${status} and email sent!`);
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update slip or send email");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/slip/allSlips");
        const allSlips = (res.data || []).map((slip) => {
          const ms = parseToMillis(slip.timeCreated);
          return {
            ...slip,
            timeCreatedMs: ms,
            timeCreatedFormatted: ms ? formatDate(ms) : '',
          };
        });
        allSlips.sort((a, b) => (b.timeCreatedMs || 0) - (a.timeCreatedMs || 0));
        setAllSlipData(allSlips);
      } catch (error) {
        console.error("Error fetching slip data:", error.message);
      }
    };
    fetchData();
  }, []);

  // --- Add sortBy state and logic ---
  const filteredSlipData = allSlipData
    .filter((slip) => slip.status === "Pending")
    .filter((slip) => {
      const nameMatch = String(slip.name || '').toLowerCase().includes(search.toLowerCase());
      const sidMatch = String(slip.sid || '').toLowerCase().includes(search.toLowerCase());
      return nameMatch || sidMatch;
    })
    .filter((slip) => {
      if (!filterSlipType) return true;
      return slip.typeOfSlip === filterSlipType;
    })
    .filter((slip) => {
      if (!filterDate) return true;
      return isWithinDate(slip.timeCreatedMs, filterDate);
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (b.timeCreatedMs || 0) - (a.timeCreatedMs || 0);
      } else {
        return (a.timeCreatedMs || 0) - (b.timeCreatedMs || 0);
      }
    });

  // Pagination logic
  const totalRows = filteredSlipData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pagedSlipData = filteredSlipData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // data na iloload sa table
  const requestTable = pagedSlipData.map((slips) => (
    <tr key={slips._id} className="hover:bg-gray-100 transition bg-[#0172bd]">
      <td className="px-4 py-3">{slips.name}</td>
      <td className="px-4 py-3">{slips.sid}</td>
      <td className="px-4 py-3">{slips.typeOfSlip}</td>
      <td className="px-4 py-3">{slips.timeCreatedFormatted || formatDate(slips.timeCreated)}</td>
      {/* STATUS with conditional styling */}
      <td
        className={`px-4 py-3 font-semibold ${slips.status === "Approved"
          ? "text-green-600 bg-green-300"
          : slips.status === "Rejected"
            ? "text-red-600 bg-red-300"
            : "text-gray-600 bg-gray-300"
          }`}
      >
        {slips.status}
      </td>
      {/* <td className="px-4 py-3">{slips.reason}</td> */}
      <td className="px-4 py-3">{slips.attachmentCount}</td>
      {authData?.user?.access?.requestSlip ? <td className="px-4 py-3">
        <button
          className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
          onClick={() => openSlip(slips._id)}>
          Open
        </button>
      </td> : null}
    </tr>
  ));

  // --- Modal logic ---
  const [showStudentReportModal, setShowStudentReportModal] = useState(false);
  const [studentReportSlip, setStudentReportSlip] = useState(null);

  const closeStudentReportModal = () => {
    setShowStudentReportModal(false);
    setStudentReportSlip(null);
  };

  function StudentReportModal({ slip, onClose }) {
    if (!slip) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white w-full sm:max-w-3xl rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-[#0172bd]">Student Report</h2>
              <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
                {slip.typeOfSlip}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-[#0172bd] hover:scale-110 hover:text-blue-500"
            >
              <X className="w-10 h-10 object-cover rounded " />
            </button>
          </div>
          <hr className="mb-4" />

          {/* Student Info */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-[#0172bd] mb-2">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Name</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.name}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Student No.</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.sid}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Email</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.email}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Program/Section</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.program}</div>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-[#0172bd] mb-2">Report Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Date of Incident</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.incidentDate || ""}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Time of Incident</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.incidentTime || ""}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Location of Incident</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.incidentLocation || ""}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Person/s Involved</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.personsInvolved || ""}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600">Witness Name (if any)</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.witnessName || ""}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600">Witness Contact Info</label>
                <div className="border rounded px-3 py-2 bg-gray-50">{slip.witnessContact || ""}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600">Narrative of the Incident</label>
                <div className="border rounded px-3 py-2 bg-gray-50 whitespace-pre-line">{slip.narrative || ""}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600">Actions Taken</label>
                <div className="border rounded px-3 py-2 bg-gray-50 whitespace-pre-line">{slip.actionsTaken || ""}</div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-[#0172bd] mb-2">Supporting Evidence</h3>
            <div className="flex flex-wrap gap-4">
              {(slip.attachments || []).length === 0 && (
                <span className="text-gray-400">No attachments.</span>
              )}
              {(slip.attachments || []).map((url, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Attachment ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </a>
                  <span className="text-xs text-[#0172bd] mt-2 text-center">
                    Attachment {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openSlip = (id) => {
    const foundSlip = allSlipData.find((slip) => slip._id === id);
    if (foundSlip) {
      if (foundSlip.typeOfSlip === "Student Report") {
        setStudentReportSlip(foundSlip);
        setShowStudentReportModal(true);
      } else {
        setSelectedSlip(foundSlip);
        setDisplay(true);
        // Set remarks if Absent Slip
        if (foundSlip.typeOfSlip === "Absent Slip") {
          setRemarks(foundSlip.remarks || "");
        } else {
          setRemarks("");
        }
      }
    } else {
      console.error("Slip not found in local data");
    }
  };

  // Reset remarks when closing modal
  const closeModal = () => {
    setDisplay(false);
    setSelectedSlip(null);
    setRemarks("");
  };

  const displaySlipForm = () => {
    if (!display || !selectedSlip) return null;

    // Destructure URLs here, where selectedSlip is guaranteed to exist
    const { proofUrl, excuseLetterUrl, guardianValidIDUrl, medicalCertificateUrl } = selectedSlip;

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white w-full sm:max-w-350 lg:max-w-400 rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">
          
          {/* header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-[#0172bd]">Request Slip Form</h2>
              <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
                {selectedSlip.typeOfSlip}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="text-2xl text-[#0172bd] hover:scale-110 hover:text-blue-500"
            >
              <X className="w-10 h-10 object-cover rounded " />
            </button>
          </div>
          <hr className="mb-4" />

          {/* Responsive grid: stack on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* LEFT PANEL */}
            <div className="space-y-6">
              <div className="space-y-2">
                {/* Info Section */}
                {[
                  { label: "Name: ", value: selectedSlip.name },
                  { label: "Program: ", value: selectedSlip.program },
                  { label: "Date: ", value: selectedSlip.timeCreatedFormatted || formatDate(selectedSlip.timeCreated) },
                  { label: "Year & Section: ", value: selectedSlip.yearSection || "4A" },
                  { label: "Email: ", value: selectedSlip.email },
                  {
                    label: "Status: ",
                    value: selectedSlip.status,
                    className:
                      selectedSlip.status === "Approved"
                        ? "text-green-600 font-bold"
                        : selectedSlip.status === "Rejected"
                          ? "text-red-600 font-bold"
                          : "text-gray-600 font-bold",
                  },
                  // { label: "Reason: ", value: selectedSlip.reason },
                  { label: "Days Absent: ", value: selectedSlip.daysAbsent },
                ].map((item, i) => (
                  <div key={i} className="flex items-center flex-wrap">
                    <p className="font-bold text-[#0172bd] mr-5">{item.label}</p>
                    <p className={`font-semibold ${item.className || "text-black"} break-all`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Attachments Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Proof of Transaction */}
                {proofUrl && (
                  <div className="flex flex-col items-center">
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={proofUrl}
                        alt="Proof of Transaction"
                        className="w-24 h-24 object-cover rounded"
                      />
                    </a>
                    <span className="text-xs text-[#0172bd] mt-2 text-center">
                      Proof of Transaction
                    </span>
                  </div>
                )}

                {/* Excuse Letter */}
                {excuseLetterUrl && (
                  <div className="flex flex-col items-center">
                    <a href={excuseLetterUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={excuseLetterUrl}
                        alt="Excuse Letter"
                        className="w-24 h-24 object-cover rounded"
                      />
                    </a>
                    <span className="text-xs text-[#0172bd] mt-2 text-center">
                      Excuse Letter
                    </span>
                  </div>
                )}

                {/* Medical Certificate */}
                {medicalCertificateUrl && (
                  <div className="flex flex-col items-center">
                    <a href={medicalCertificateUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={medicalCertificateUrl}
                        alt="Medical Certificate"
                        className="w-24 h-24 object-cover rounded"
                      />
                    </a>
                    <span className="text-xs text-[#0172bd] mt-2 text-center">
                      Medical Certificate
                    </span>
                  </div>
                )}

                {/* Guardian’s ID */}
                {guardianValidIDUrl && (
                  <div className="flex flex-col items-center">
                    <a href={guardianValidIDUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={guardianValidIDUrl}
                        alt="Guardian’s ID"
                        className="w-24 h-24 object-cover rounded"
                      />
                    </a>
                    <span className="text-xs text-[#0172bd] mt-2 text-center">
                      Guardian’s ID
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[#0172bd]">Send Email To</label>
                <input
                  type="text"
                  value={selectedSlip.email}
                  className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[#0172bd]">Body</label>
                <textarea
                  className="border rounded px-3 py-2 w-full h-20 sm:h-24 resize-none text-xs sm:text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              {/* --- EDITABLE REMARKS FIELD FOR ABSENT SLIP --- */}
              {selectedSlip.typeOfSlip === "Absent Slip" && (
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#0172bd]">Remarks</label>
                  <textarea
                    className="border rounded px-3 py-2 w-full h-16 sm:h-20 resize-none text-xs sm:text-sm"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Enter remarks here..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: always at the bottom, full width on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 pt-6">
            <button
              onClick={() => handleStatusChange(selectedSlip.typeOfSlip, selectedSlip._id, "Denied", selectedSlip)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#dc3545] hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Deny
              <img src={closeW} alt="closeW" className="w-4 h-4 object-cover rounded " />
            </button>

            <button
              onClick={() => handleStatusChange(selectedSlip.typeOfSlip, selectedSlip._id, "Approved", selectedSlip)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#28a745] hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              Approve
              <img src={checkW} alt="checkW" className="w-4 h-4 object-cover rounded " />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 h-full p-3">
      <div className="bg-white shadow-md p-4 rounded-lg overflow-y-auto">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div className="text-left">
            <div className="flex items-center gap-2">
            <ClipboardList className="h-10 w-10 text-[#0172bd]" />
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0172bd] mb-2">Request Slip Processing</p>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">Approve/ Deny Request Slips.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* History button */}
            {authData?.user?.access?.requestSlip && (
              <button
                className="flex items-center justify-center gap-2 bg-[#0172bd] text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto shadow-lg font-semibold"
                onClick={() => navigate("/guidance/request-slip-history")}
              >
                History
                <Clock className="w-5 h-5 object-cover rounded" />
              </button>
            )}

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <Search className="w-4 h-4 object-cover rounded "/>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Type of Slip</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              value={filterSlipType}
              onChange={e => setFilterSlipType(e.target.value)}
            >
              {SLIP_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            >
              {DATE_FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar h-[62vh] relative">
          <table className="w-full text-left">
            <thead>
              <tr className=" text-white">
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Student No.</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                {/* <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Reason</th> */}
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Attachments</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pagedSlipData.map((slips) => (
                <tr key={slips._id} className="hover:bg-gray-100 transition">
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap font-semibold w-1/4">{slips.name}</td>
                  <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.sid}</td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.typeOfSlip}</td>
                  <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">
                    {slips.timeCreatedFormatted || formatDate(slips.timeCreated)}
                  </td>
                  <td
                    className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${slips.status === "Approved"
                      ? "text-green-600"
                      : slips.status === "Rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                      }`}
                  >
                    {slips.status}
                  </td>
                  {/* <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 break-words max-w-[120px] truncate align-middle" title={slips.reason}>
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[140px]">
                      {slips.reason}
                    </span>
                  </td> */}
                  <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>

                  {authData?.user?.access?.requestSlip && (
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                      <button
                        className="bg-[#0172bd] text-white font-bold px-3 sm:px-4 py-1 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto"
                        onClick={() => openSlip(slips._id)}
                      >
                        Open
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
                  {/* Pagination controls - OUTSIDE the scrollable table */}
          <div className="w-full flex justify-center lg:justify-end items-center mt-2 pr-0 lg:pr-2">
            <nav className="flex items-center space-x-1">
              <button
                className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5 object-cover rounded" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0172bd] text-white' : 'hover:bg-gray-200 text-[#0172bd]'}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-5 h-5 object-cover rounded" />
              </button>
            </nav>
          </div>
      </div>

      {/* Modals */}
      {displaySlipForm()}
      {showStudentReportModal && (
        <StudentReportModal slip={studentReportSlip} onClose={closeStudentReportModal} />
      )}
    </div>
  );
}

export default RequestSlip;