import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import LoadingDots from '../../../component/Loading';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";

import {
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// --- Reuse date helpers from RequestSlip ---
function parseToMillis(dateInput) {
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

const parseToDate = (val) => {
  if (!val) return null;

  if (val.toDate && typeof val.toDate === "function") {
    return val.toDate();
  }

  if (typeof val === "object" && val._seconds) {
    return new Date(val._seconds * 1000);
  }

  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};


const formatDate = (val) => {
  const d = parseToDate(val);
  if (!d) return "-";

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "N/A";
  }
};

function IncidentReportHistoryModal({ slip, onClose }) {
  if (!slip) return null;
  const { attachmentUrl = [] } = slip;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="relative bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-7xl rounded-lg shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] animate-fadeIn custom-scrollbar outline-solid outline-2 outline-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#0172bd]">Incident Report</h2>
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

        {/* Responsive grid: stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {/* LEFT PANEL */}
          <div className="space-y-6">
            <div className="space-y-2">
              {/* Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border border-gray-300 p-2 rounded-md text-sm">
                <div>
                  <p className="font-bold text-[#0172bd]">Name:</p>
                  <p className="font-semibold text-black break-all">{slip.name}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Program & Section:</p>
                  <p className="font-semibold text-black break-all">{`${slip.program} ${slip.section}`}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Student ID:</p>
                  <p className="font-semibold text-black break-all">{slip.sid}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Status:</p>
                  <p className={`font-semibold break-all ${slip.status === "Approved" || slip.status === "Resolved"
                    ? "text-green-600"
                    : slip.status === "Denied" || slip.status === "Cancelled"
                      ? "text-red-600"
                      : "text-gray-600"
                    }`}>{slip.status}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Date:</p>
                  <p className="font-semibold text-black break-all">{slip.timeCreatedFormatted || formatDate(slip.timeCreated)}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Type of Slip:</p>
                  <p className="font-semibold text-black break-all">{slip.typeOfSlip}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Email:</p>
                  <p className="font-semibold text-black break-all">{slip.email}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Witness Name:</p>
                  <p className="font-semibold text-black break-all">{slip.witnessName}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Witness Contact:</p>
                  <p className="font-semibold text-black break-all">{slip.witnessContact}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Person Involved:</p>
                  <p className="font-semibold text-black break-all">{slip.personInvolved}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Location Of Incident:</p>
                  <p className="font-semibold text-black break-all">{slip.locationOfIncident}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Incident Time:</p>
                  <p className="font-semibold text-black break-all">{slip.incidentTime}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Date Of Incident:</p>
                  <p className="font-semibold text-black break-all">{slip.dateOfIncident}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Processed Date:</p>
                  <p className="font-semibold text-black break-all">{formatDate(slip.processedDate)}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0172bd]">Processed By:</p>
                  <p className="font-semibold text-black break-all">{slip.processedBy}</p>
                </div>
              </div>
              {/* Narrative Report (full width) */}
              <div>
                <label className="block text-sm font-bold mb-1 text-[#0172bd]">Narrative Report:</label>
                <textarea
                  className="border rounded px-3 py-2 w-full h-16 sm:h-20 resize-none text-xs sm:text-sm custom-scrollbar"
                  value={slip.narrativeReport || ""}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-[#0172bd]">Action Taken:</label>
                <textarea
                  className="border rounded px-3 py-2 w-full h-16 sm:h-20 resize-none text-xs sm:text-sm custom-scrollbar"
                  value={slip.actionTaken || ""}
                  readOnly
                />
              </div>
            </div>

          </div>
          {/* RIGHT PANEL */}
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Remarks:</label>
              <textarea
                className="border rounded px-3 py-2 w-full h-16 sm:h-20 resize-none text-xs sm:text-sm custom-scrollbar"
                value={slip.remarks || ""}
                readOnly
              />
            </div>

            {/* Attachments Section */}
            <label className="block text-sm font-bold mb-1 text-[#0172bd]">Attachments:</label>
            <div className="md:col-span-2 grid grid-cols-2 gap-6 mt-2 ">

              {attachmentUrl.length === 0 && (
                <span className="text-gray-400">No attachments.</span>
              )}
              {attachmentUrl.map((url, idx) => (
                <div key={idx} className="flex flex-col items-center border rounded-md border-black p-3">
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
    </div>
  );
}

function RequestSlipHistory() {
  const navigate = useNavigate()
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [search, setSearch] = useState("");
  const [slipData, setSlipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIncidentReportModal, setShowIncidentReportModal] = useState(false);
  const [incidentReportSlip, setIncidentReportSlip] = useState(null);
  const [absentData, setAbsentData] = useState([]);
  const [incidentData, setIncidentData] = useState([]);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);

    const unsubscribeAbsent = onSnapshot(
      collection(db, "absentSlips"),
      (snapshot) => {
        const newAbsent = snapshot.docs.map((doc) => {
          const data = doc.data();
          const ms = parseToMillis(data.processedDate);
          return {
            id: doc.id,
            collection: "absentSlips",
            ...data,
            processedDateMs: ms,
            processedDateFormatted: ms ? formatDate(ms) : '',
          };
        });
        setAbsentData(newAbsent);
      },
      (error) => {
        console.error("Error fetching absent slips:", error);
      }
    );


    const unsubscribeIncident = onSnapshot(
      collection(db, "incidentReport"),
      (snapshot) => {
        const newIncident = snapshot.docs.map((doc) => {
          const data = doc.data();
          const ms = parseToMillis(data.processedDate);
          return {
            id: doc.id,
            collection: "incidentReport",
            ...data,
            processedDateMs: ms,
            processedDateFormatted: ms ? formatDate(ms) : '',
          };
        });
        setIncidentData(newIncident);
      },
      (error) => {
        console.error("Error fetching incident reports:", error);
      }
    );


    return () => {
      unsubscribeAbsent();
      unsubscribeIncident();
    };
  }, []);

  useEffect(() => {
    const combined = [...absentData, ...incidentData].filter(
      (s) =>
        s.status === "Approved" ||
        s.status === "Denied" ||
        s.status === "Resolved" ||
        s.status === "Cancelled" ||
        s.status === "Inactive"
    );

    combined.sort((a, b) => (b.processedDateMs || 0) - (a.processedDateMs || 0));

    setSlipData(combined);
    setLoading(false);
  }, [absentData, incidentData]);


  // PAGINATION LOGIC
  const filteredSlipData = slipData
    .filter((slip) => {
      const searchLower = search.toLowerCase();
      return (
        slip.name?.toLowerCase().includes(searchLower) ||
        slip.sid?.toLowerCase().includes(searchLower)
      );
    });

  const totalRows = filteredSlipData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pagedSlipData = filteredSlipData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const colorStatusIndicator = (status) => {
    if (status === 'Approved' || status === 'Resolved') {
      return <td className="text-green-600 font-bold px-2 py-2 text-sm lg:text-base">{status}</td>
    } else if (status === "Cancelled" || status === "Denied") {
      return <td className="text-red-600 font-bold px-2 py-2 text-sm lg:text-base">{status}</td>
    } else {
      return <td className="text-gray-600 font-bold px-2 py-2 text-sm lg:text-base">{status}</td>
    }
  }

  const displayRequestSlipForm = () => {
    if (!selectedSlip) return null;

    const { proofUrl, excuseLetterUrl, guardianValidIDUrl, medicalCertificateUrl } = selectedSlip;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
        <div className="relative bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-6xl rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-fadeIn custom-scrollbar border-2 border-[#0172bd]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-extrabold text-[#0172bd]">Absent Slip Details</h2>
              <span className="px-3 py-1 bg-[#0172bd]/10 text-[#0172bd] text-sm font-semibold rounded-md">
                {selectedSlip.typeOfSlip}
              </span>
            </div>
            <button
              onClick={() => setSelectedSlip(null)}
              className="text-[#0172bd] hover:text-blue-500 transition-transform hover:scale-110"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-sm">
                <p><span className="font-bold text-[#0172bd]">Name:</span> {selectedSlip.name}</p>
                <p><span className="font-bold text-[#0172bd]">Student ID:</span> {selectedSlip.sid}</p>
                <p><span className="font-bold text-[#0172bd]">Program:</span> {selectedSlip.program}</p>
                <p><span className="font-bold text-[#0172bd]">Year & Section:</span> {selectedSlip.section}</p>
                <p><span className="font-bold text-[#0172bd]">Email:</span> {selectedSlip.email}</p>
                <p>
                  <span className="font-bold text-[#0172bd]">Status:</span>{" "}
                  <span
                    className={
                      selectedSlip.status === "Approved"
                        ? "text-green-600 font-bold"
                        : selectedSlip.status === "Denied" || selectedSlip.status === "Cancelled" 
                          ? "text-red-600 font-bold"
                          : "text-gray-700 font-bold"
                    }
                  >
                    {selectedSlip.status}
                  </span>
                </p>
                <p><span className="font-bold text-[#0172bd]">Reason:</span> {selectedSlip.reason}</p>
                <p><span className="font-bold text-[#0172bd]">Remarks:</span> {selectedSlip.remarks}</p>
                <p><span className="font-bold text-[#0172bd]">Absent Duration:</span> {selectedSlip.dateAbsent.replaceAll('-', '/')} - {selectedSlip.dateAbsentEnd.replaceAll('-', '/')}</p>
                <p><span className="font-bold text-[#0172bd]">Pickup Date:</span> {selectedSlip.pickUpDate}</p>
                <p><span className="font-bold text-[#0172bd]">Creation Date:</span> {formatDate(selectedSlip.timeCreated)}</p>
                <p><span className="font-bold text-[#0172bd]">Processed Date:</span> {formatDate(selectedSlip.processedDate)}</p>
                <p><span className="font-bold text-[#0172bd]">Processed By:</span> {selectedSlip.processedBy}</p>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0172bd] border-b pb-1">Attachments</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[
                  { label: "Proof of Transaction", url: selectedSlip.proofUrl },
                  { label: "Excuse Letter", url: selectedSlip.excuseLetterUrl },
                  { label: "Medical Certificate", url: selectedSlip.medicalCertificateUrl },
                  { label: "Guardian’s ID", url: selectedSlip.guardianValidIDUrl },
                ]
                  .filter((a) => a.url && a.url !== "Empty")
                  .map((a, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center border border-gray-300 rounded-lg p-3 bg-gray-50 hover:shadow-md transition"
                    >
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={a.url}
                          alt={a.label}
                          className="w-36 h-36 object-cover rounded-md border border-[#0172bd]/30"
                        />
                      </a>
                      <span className="text-xs text-gray-700 mt-2 font-semibold text-center">{a.label}</span>
                    </div>
                  ))}
                {(!selectedSlip.proofUrl && !selectedSlip.excuseLetterUrl && !selectedSlip.medicalCertificateUrl && !selectedSlip.guardianValidIDUrl) && (
                  <p className="text-gray-500 text-sm text-center col-span-full">No attachments available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  }

  // Update table row open logic:
  const displaySlipHistoryTable = pagedSlipData.map((slips, idx) => (
    <tr key={idx} className="hover:bg-gray-100 transition">
      {console.log(slips.status)}
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap font-semibold w-1/4">{slips.name}</td>
      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.sid}</td>
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.typeOfSlip}</td>
      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{formatDate(slips.processedDate)}</td>
      {colorStatusIndicator(slips.status)}
      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
        <button
          onClick={() => {
            if (slips.typeOfSlip === "Incident Report") {
              setIncidentReportSlip(slips);
              setShowIncidentReportModal(true);
            } else {
              setSelectedSlip(slips);
            }
          }}
          className="bg-[#0172bd] text-white font-semibold px-3 sm:px-4 py-1 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto"
        >
          Open
        </button>
      </td>
    </tr>
  ));

  if (loading) {
    return <LoadingDots />
  }

  return (
    <div className="bg-gray-100 h-full p-3">
      <div className="bg-white shadow-md p-4 rounded-lg h-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/guidance/request-slip')}
                  style={{ cursor: 'pointer' }}
                  className='flex items-top justify-top hover:bg-gray-300 transition duration-200 rounded'
                >
                  <ChevronLeft className="w-10 h-10 object-cover rounded text-[#0172bd] " />
                </button>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0172bd] mb-2">Request Slip History</p>
              </div>
              <p className="text-gray-500 text-sm sm:text-base ">View Approved/ Denied Request Slips</p>
            </div>
          </div>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-y-auto custom-scrollbar h-auto relative">
          <table className="w-full text-left">
            <thead>
              <tr className=" text-white">
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Student No.</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Processed Date</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Attachments</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>
              {
                pagedSlipData.length > 0 ?
                  displaySlipHistoryTable :

                  <tr>

                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      No pending request slip forms found.
                    </td>
                  </tr>
              }
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


        <div>{displayRequestSlipForm()}</div>
        {showIncidentReportModal && (
          <IncidentReportHistoryModal
            slip={incidentReportSlip}
            onClose={() => {
              setShowIncidentReportModal(false);
              setIncidentReportSlip(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default RequestSlipHistory;
