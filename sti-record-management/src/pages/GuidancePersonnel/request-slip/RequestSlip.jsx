import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import closeW from "../../../assets/close.png";
import checkW from "../../../assets/check.png";
import { AuthContext } from '../../../AuthProvider.jsx';
import LoadingDots from "../../../component/Loading.jsx";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";

import {
  Search,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Calendar
} from 'lucide-react';

import { toast } from 'react-toastify';

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

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
];

// Helper for date filtering, parse, format functions (kept same as original)
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

/**
 * formatDate
 * Accepts a Date, ms number, Firestore timestamp-like object, or date string.
 * Returns: "MonthName D, YYYY at H:MM:SS AM/PM" (e.g. "October 18, 2025 at 6:50:01 PM")
 * Uses Asia/Manila timezone to produce consistent output (change if you want local timezone).
 */
function formatDate(dateInput) {
  const ms = typeof dateInput === 'number' ? dateInput : parseToMillis(dateInput);
  if (!ms) return '';
  const d = new Date(ms);

  // Use Intl to format parts consistently; then replace the comma before time with ' at '
  // Example result from toLocaleString: "October 18, 2025, 6:50:01 PM"
  const opts = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  };
  const localeStr = d.toLocaleString('en-US', opts);

  return localeStr
}

function StudentReportModal({ slip, onClose, remarks, setRemarks, pickupDate, setPickupDate, body, setBody, handleStatusChange }) {
  if (!slip) return null;

  // destructure from prop 'slip' (was incorrectly using selectedSlip)
  const { proofUrl, excuseLetterUrl, guardianValidIDUrl, medicalCertificateUrl } = slip;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10]">
      <div className="bg-white w-full sm:max-w-350 lg:max-w-400 rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">

        {/* header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#0172bd]">Request Slip Form</h2>
            <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
              {slip.typeOfSlip}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[#0172bd] hover:scale-110 hover:text-blue-500 cursor-pointer"
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
                { label: "Name: ", value: slip.name },
                { label: "Program: ", value: slip.program },
                { label: "Date: ", value: slip.timeCreatedFormatted || formatDate(slip.timeCreated) },
                { label: "Year & Section: ", value: slip.yearSection || "4A" },
                { label: "Email: ", value: slip.email },
                {
                  label: "Status: ",
                  value: slip.status,
                  className:
                    slip.status === "Approved"
                      ? "text-green-600 font-bold"
                      : slip.status === "Rejected"
                        ? "text-red-600 font-bold"
                        : "text-gray-600 font-bold",
                },
                { label: "Reason: ", value: slip.reason },
                { label: "Absent Day: ", value: `${slip.dateAbsent.replaceAll('-', '/')} - ${slip.dateAbsentEnd.replaceAll('-', '/')}` },
                { label: "Attachments: " },
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
              {!excuseLetterUrl || excuseLetterUrl !== 'Empty' ? (
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
              ): null}

              {/* Medical Certificate */}
              {!medicalCertificateUrl || medicalCertificateUrl !== 'Empty' ? (
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
              ): null}

              {/* Guardian’s ID */}
              {!guardianValidIDUrl || guardianValidIDUrl !== 'Empty' ? (
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
              ): null}
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Remarks<span className='text-red-600'>*</span></label>
              <textarea
                className="border rounded px-3 py-2 w-full h-16 sm:h-20 resize-none text-xs sm:text-sm"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter remarks here..."
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Pickup Date <span className='text-gray-500 text-[10px] font-semibold'>Required only on approval</span></label>
              <input
                type="date"
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                id="pickupDate" name="pickupDate"
                className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer" onClick={() => document.getElementById("pickupDate")?.showPicker?.()} tabIndex={-1}>
                <Calendar className="w-5 h-5 mt-6" />
              </span>
            </div><hr />
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Send Email To</label>
              <input
                type="text"
                value={slip.email}
                className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Subject</label>
              <input
                type="text"
                defaultValue="Requested Slip Form Status"
                className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Body</label>
              <textarea
                className="border rounded px-3 py-2 w-full h-20 sm:h-24 resize-none text-xs sm:text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* Action Buttons: always at the bottom, full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 pt-6">
              <button
                onClick={() => handleStatusChange(slip.typeOfSlip, slip._id, "Denied", slip)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#dc3545] hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Deny
                <img src={closeW} alt="closeW" className="w-4 h-4 object-cover rounded " />
              </button>

              <button
                onClick={() => handleStatusChange(slip.typeOfSlip, slip._id, "Approved", slip)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#28a745] hover:bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Approve
                <img src={checkW} alt="checkW" className="w-4 h-4 object-cover rounded " />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function IncidentReportModal({ slip, onClose, remarks, setRemarks, body, setBody, handleStatusChange }) {
  if (!slip) return null;

  const { attachmentUrl = [] } = slip;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full sm:max-w-350 lg:max-w-400 rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">
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
            className="text-2xl text-[#0172bd] hover:scale-110 hover:text-blue-500 cursor-pointer"
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
                  <p className={`font-semibold break-all ${slip.status === "Approved"
                    ? "text-green-600"
                    : slip.status === "Rejected"
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
                <div></div>
              </div>

              {/* Narrative Report (full width) */}
              <div className="md:col-span-2">
                <p className="font-bold text-[#0172bd]">Narrative Report:</p>
                <p className="font-semibold text-black break-all">{slip.narrativeReport}</p>
              </div>

              {/* Action Taken (handle either actionTaken or actionsTaken) */}
              <div className="md:col-span-2">
                <p className="font-bold text-[#0172bd]">Action Taken:</p>
                <p className="font-semibold text-black break-all">{slip.actionTaken || slip.actionsTaken}</p>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6 mt-2">
              {attachmentUrl.length === 0 && (
                <span className="text-gray-400">No attachments.</span>
              )}
              {attachmentUrl.map((url, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Attachment ${idx + 1}`}
                      className="w-30 h-30 object-cover rounded"
                    />
                  </a>
                  <span className="text-xs text-[#0172bd] mt-2 text-center">
                    Attachment {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Remarks</label>
              <textarea
                className="border rounded px-3 py-2 w-full h-16 sm:h-20 resize-none text-xs sm:text-sm"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter remarks here..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Send Email To</label>
              <input
                type="text"
                value={slip.email}
                className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Subject</label>
              <input
                type="text"
                defaultValue="Incident Report Status"
                className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-[#0172bd]">Email Body</label>
              <textarea
                className="border rounded px-3 py-2 w-full h-20 sm:h-24 resize-none text-xs sm:text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-6">
              <button
                onClick={() => handleStatusChange(slip.typeOfSlip, slip._id, "In Progress", slip)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#0172bd] hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Update
                <X className="w-4 h-4 object-cover rounded " />
              </button>
              <button
                onClick={() => handleStatusChange(slip.typeOfSlip, slip._id, "Resolved", slip)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#28a745] hover:bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Solved
                <Check className="w-4 h-4 object-cover rounded " />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [filterStatus, setFilterStatus] = useState("");
  const [body, setBody] = useState("Please proceed to the Guidance and Counseling Office");
  const [sortBy, setSortBy] = useState("oldest");
  const [loading, setLoading] = useState(true);

  const [remarks, setRemarks] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  const ROW_COLOR_CLASSES = {
    RED: "bg-red-100",
    YELLOW: "bg-yellow-100",
    BLUE: "bg-blue-100",
    WHITE: "bg-white",
  };

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  if (!authData?.user?.access?.requestSlip) {
    const error401 = () => {
      navigate('/error401')
    }
    return error401()
  }

  const handleStatusChange = async (slipType, slipId, status, slip) => {
    try {
      if (remarks === '' || remarks === null) {
        toast.error("Remarks should not be empty!");
        return;
      }

      if (status === "Approved" && (!pickupDate || pickupDate.trim() === "")) {
        toast.error("Pickup date is required when approving a request slip.");
        return;
      }


      const updatePayload = {
        status,
        remarks,
        pickUpDate: pickupDate,
        name: authData?.user?.displayName ?? 'Admin',
        uid: slip.sid,
        studentName: slip.name
      };

      if (!(slipType === 'Absent Slip')) {
        delete updatePayload.pickUpDate;
      }

      await axios.put(`/slip/update/${slipType}/${slipId}`, updatePayload);

      const emailData = {
        to: slip.email,
        subject: `Your ${slipType} Request has been ${status}`,
        text: `Hello ${slip.name},\n\nYour ${slipType} submitted on ${slip.timeCreatedFormatted} has been ${status}.\n\n ${body} \n\n- Admin`
      };

      await axios.post("/email/send", emailData);

      setAllSlipData((prev) =>
        prev.map((s) =>
          (s._id === slipId || s.id === slipId)
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
    setLoading(true);

    const mapSnapshot = (snapshot, collectionName) => {
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        const ms = parseToMillis(data.timeCreated);

        let attachmentCount =
          typeof data.attachmentCount === "number" ? data.attachmentCount : null;

        if (attachmentCount === null) {
          if (Array.isArray(data.attachmentUrl)) {
            attachmentCount = data.attachmentUrl.length;
          } else if (data.typeOfSlip === "Absent Slip") {
            const possibleAttachments = [
              data.proofUrl,
              data.excuseLetterUrl,
              data.guardianValidIDUrl,
              data.medicalCertificateUrl,
            ].filter(Boolean);
            attachmentCount = possibleAttachments.length;
          } else {
            attachmentCount = 0;
          }
        }

        return {
          id: doc.id,
          _id: doc.id,
          ...data,
          collection: collectionName,
          attachmentCount,
          timeCreatedMs: ms,
          timeCreatedFormatted: ms ? formatDate(ms) : "",
        };
      });
    };


    const unsubscribeAbsent = onSnapshot(
      collection(db, "absentSlips"),
      (snapshot) => {
        const absentData = mapSnapshot(snapshot, "absentSlips");
        setAllSlipData((prev = []) => {
          const incidentPrev = prev.filter((i) => i.collection === "incidentReport");
          return [...absentData, ...incidentPrev].sort(
            (a, b) => (b.timeCreatedMs || 0) - (a.timeCreatedMs || 0)
          );
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching absent slips:", error);
        setLoading(false);
      }
    );

    const unsubscribeIncident = onSnapshot(
      collection(db, "incidentReport"),
      (snapshot) => {
        const incidentData = mapSnapshot(snapshot, "incidentReport");
        setAllSlipData((prev = []) => {
          const absentPrev = prev.filter((i) => i.collection === "absentSlips");
          return [...incidentData, ...absentPrev].sort(
            (a, b) => (b.timeCreatedMs || 0) - (a.timeCreatedMs || 0)
          );
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching incident reports:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAbsent();
      unsubscribeIncident();
    };
  }, []);


  // --- Add sortBy state and logic ---
  const filteredSlipData = allSlipData
    .filter((slip) => slip.status === "Pending" || slip.status === "In Progress")
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
    .filter((slip) => {
      if (!filterStatus) return true;
      return slip.status === filterStatus;
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

  // --- Modal logic ---
  const [showStudentReportModal, setShowStudentReportModal] = useState(false);
  const [studentReportSlip, setStudentReportSlip] = useState(null);

  const closeStudentReportModal = () => {
    setShowStudentReportModal(false);
    setStudentReportSlip(null);
  };

  const openSlip = (id) => {
    const foundSlip = allSlipData.find((slip) => slip._id === id || slip.id === id);
    if (foundSlip) {
      if (foundSlip.typeOfSlip === "Absent Slip") {
        setSelectedSlip(foundSlip);
        setDisplay(true);
        setRemarks(foundSlip.remarks || "");
        setPickupDate(foundSlip.pickupDate || "")
      } else if (foundSlip.typeOfSlip === "Incident Report") {
        setSelectedSlip(foundSlip);
        setDisplay(true);
        setRemarks(foundSlip.remarks || "");
      } else if (foundSlip.typeOfSlip === "Student Report") {
        setStudentReportSlip(foundSlip);
        setShowStudentReportModal(true);
      }
    } else {
      console.error("Slip not found in local data for id:", id);
    }
  };

  const closeModal = () => {
    setDisplay(false);
    setSelectedSlip(null);
    setRemarks("");
    setPickupDate("")
  };

  const displaySlipForm = () => {
    if (!display || !selectedSlip) return null;
    if (selectedSlip.typeOfSlip === "Incident Report") {
      return (
        <IncidentReportModal
          slip={selectedSlip}
          onClose={closeModal}
          remarks={remarks}
          setRemarks={setRemarks}
          body={body}
          setBody={setBody}
          handleStatusChange={handleStatusChange}
        />
      );
    }

    else if (selectedSlip.typeOfSlip === "Absent Slip") {
      return (
        <StudentReportModal
          slip={selectedSlip}
          onClose={closeModal}
          remarks={remarks}
          setRemarks={setRemarks}
          pickupDate={pickupDate}
          setPickupDate={setPickupDate}
          body={body}
          setBody={setBody}
          handleStatusChange={handleStatusChange}
        />
      );
    }
    return null;
  };

  // Date Color Indication
  const toMillisSafe = (input) => {
    if (input == null) return null;

    if (typeof input === "number") {
      return input > 1e12 ? input : input * 1000;
    }

    if (input instanceof Date) return input.getTime();

    if (typeof input === "object" && typeof input.toDate === "function") {
      try {
        return input.toDate().getTime();
      } catch (e) { /* fallthrough */ }
    }

    if (typeof input === "object" && (input.seconds !== undefined || input._seconds !== undefined)) {
      const seconds = Number(input.seconds ?? input._seconds ?? 0);
      const nanos = Number(input.nanoseconds ?? input._nanoseconds ?? 0);
      return seconds * 1000 + Math.floor(nanos / 1e6);
    }

    if (typeof input === "string") {
      const parsed = Date.parse(input);
      if (!isNaN(parsed)) return parsed;
      const cleaned = input.replace(/\s+at\s+/i, " ").replace(/\s*UTC.*$/i, "").trim();
      const parsed2 = Date.parse(cleaned);
      if (!isNaN(parsed2)) return parsed2;
      return null;
    }

    return null;
  };


  const getDateDifference = (dateInput) => {
    const ms = typeof dateInput === 'object' && dateInput?.timeCreatedMs
      ? dateInput.timeCreatedMs
      : toMillisSafe(dateInput);

    if (!ms || isNaN(ms)) return 0;
    const diff = Date.now() - Number(ms);
    if (diff <= 0) return 0;
    return Math.floor(diff / MS_PER_DAY);
  };

  const getRowColor = (days) => {
    if (typeof days !== "number" || days <= 0) return ROW_COLOR_CLASSES.WHITE;
    if (days >= 8) return ROW_COLOR_CLASSES.RED;
    if (days >= 4) return ROW_COLOR_CLASSES.YELLOW;
    if (days >= 1) return ROW_COLOR_CLASSES.BLUE;
    return ROW_COLOR_CLASSES.WHITE;
  };

  if (loading) {
    return <LoadingDots />
  }

  return (
    <div className="bg-gray-100 h-full p-3">
      <div className="bg-white shadow-md p-4 rounded-lg overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-10 w-10 text-[#0172bd]" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0172bd] mb-2">Request Slip Processing</p>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">Approve/ Deny Request Slips.</p>
          </div>

          {/* Color Legend */}
          <div className="flex gap-4 items-center mb-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border border-gray-400"></div>
              <span className="text-sm text-gray-600">More than 7 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100 border border-gray-400"></div>
              <span className="text-sm text-gray-600">4 - 7 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-100 border border-gray-400"></div>
              <span className="text-sm text-gray-600">1 - 3 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white border border-gray-400"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* History button */}
            {authData?.user?.access?.requestSlip && (
              <button
                className="flex items-center justify-center gap-2 bg-[#0172bd] text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto shadow-lg font-semibold cursor-pointer"
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
                placeholder="Student Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <Search className="w-4 h-4 object-cover rounded " />
              </span>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Type of Slip</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd] cursor-pointer"
              value={filterSlipType}
              onChange={e => setFilterSlipType(e.target.value)}
            >
              {SLIP_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd] cursor-pointer"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              {STATUS_FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd] cursor-pointer"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd] cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar h-[62vh] relative">
          <table className="w-full text-left">
            <thead>
              <tr className=" text-white">
                <th className="sticky bg-[#0172bd] top-0 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Student Name</th>
                <th className="sticky bg-[#0172bd] top-0 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Student No.</th>
                <th className="sticky bg-[#0172bd] top-0 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky bg-[#0172bd] top-0 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky bg-[#0172bd] top-0 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky bg-[#0172bd] top-0 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Attachments</th>
                <th className="sticky bg-[#0172bd] top-0 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            {/* Table Rows */}
            <tbody>
              {pagedSlipData.length > 0 ? (
                pagedSlipData.map((slips) => {
                  const days = getDateDifference(slips.timeCreatedMs ?? slips.timeCreated);
                  const rowBgClass = getRowColor(days);

                  return (
                    <tr
                      key={slips.id}
                      className={`hover:bg-gray-50 transition border-b ${rowBgClass} cursor-pointer`}
                      onClick={() => openSlip(slips._id)} // Optional: Add row click functionality
                    >
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap font-semibold w-1/4">{slips.name}</td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.sid}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.typeOfSlip}</td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">
                        {slips.timeCreatedFormatted || formatDate(slips.timeCreated)}
                      </td>
                      <td className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${slips.status === "Approved"
                        ? "text-green-600"
                        : slips.status === "Rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                        }`}
                      >
                        {slips.status}
                      </td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>
                      {authData?.user?.access?.requestSlip && (
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                          <button
                            className="bg-[#0172bd] text-white font-bold px-3 sm:px-4 py-1 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto cursor-pointer"
                            onClick={() => openSlip(slips._id)}
                          >
                            Open
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })) :
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
              className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 object-cover rounded" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0172bd] text-white' : 'hover:bg-gray-200 text-[#0172bd] cursor-pointer'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold cursor-pointer"
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
        <StudentReportModal
          slip={studentReportSlip}
          onClose={closeStudentReportModal}
          remarks={remarks}
          setRemarks={setRemarks}
          pickupDate={pickupDate}
          setPickupDate={setPickupDate}
          body={body}
          setBody={setBody}
          handleStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

export default RequestSlip;