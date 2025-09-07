import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import RequestSlipHistory from "./RequestSlipHistory.jsx";
import axios from "axios";
import historyW from "../../../assets/history.png";
import closeB from "../../../assets/closeblack.png";
import closeW from "../../../assets/close.png";
import checkW from "../../../assets/check.png";
import { AuthContext } from '../../../AuthProvider.jsx';

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
  const [selectedSlip, setSelectedSlip] = useState(null); // This was missing
  const { authData } = useContext(AuthContext);

  const navigate = useNavigate();

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

  const openSlip = (id) => {
    const foundSlip = allSlipData.find((slip) => slip._id === id);
    if (foundSlip) {
      setSelectedSlip(foundSlip);
      setDisplay(true);
    } else {
      console.error("Slip not found in local data");
    }
  };

  const closeModal = () => {
    setDisplay(false);
    setSelectedSlip(null);
  };

  const displaySlipForm = () => {
    if (!display || !selectedSlip) return null;

    // Destructure URLs here, where selectedSlip is guaranteed to exist
    const { proofUrl, excuseLetterUrl, guardianValidUrl, medicalCertificateUrl } = selectedSlip;

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999] " >
        <div className="relative bg-white w-250 rounded-lg shadow-xl p-6 overflow-y-auto max-h-[90vh] animate-fadeIn custom-scrollbar outline-solid outline-2 outline-gray-300 " >

          {/* header with title, slip type badge, close */}
          <div className="flex items-center justify-between mb-2">
            {/* Title + Slip Type Badge */}
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Request Slip Form</h2>
              <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
                {selectedSlip.typeOfSlip}
              </span>
            </div>
            {/* Close button */}
            <button
              onClick={closeModal}
              className="text-2xl text-gray-700 hover:text-black"
            >
              <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded " />
            </button>
          </div>

          <hr className="mb-4" />

          <div className="grid grid-cols-2 gap-8">
            {/* LEFT PANEL: Info + Attachments */}
            <div className="space-y-6">
              {/* Info Section */}
              <div className="space-y-2">
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
                  { label: "Reason: ", value: selectedSlip.reason },
                  { label: "Days Absent: ", value: selectedSlip.daysAbsent },
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <p className="font-bold text-gray-600 mr-2">{item.label}</p>
                    <p className={`font-semibold ${item.className || "text-black"}`}>
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
                    <span className="text-xs text-gray-600 mt-2 text-center">
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
                    <span className="text-xs text-gray-600 mt-2 text-center">
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
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      Medical Certificate
                    </span>
                  </div>
                )}

                {/* Guardian’s ID */}
                {guardianValidUrl && (
                  <div className="flex flex-col items-center">
                    <a href={guardianValidUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={guardianValidUrl}
                        alt="Guardian’s ID"
                        className="w-24 h-24 object-cover rounded"
                      />
                    </a>
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      Guardian’s ID
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT PANEL: Email + Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Send Email To</label>
                <input
                  type="text"
                  value={selectedSlip.email}
                  className="border rounded px-3 py-2 w-full"
                  readOnly // Added readOnly since this is for display
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue="Requested Slip Form Status"
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Body</label>
                <textarea
                  defaultValue="Please proceed to the Guidance and Counseling Office"
                  className="border rounded px-3 py-2 w-full h-24 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex absolute bottom-6 right-6 gap-4 pt-4">
                <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                  Deny
                  <img src={closeW} alt="closeW" className="w-4 h-4 object-cover rounded " />
                </button>
                <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                  Approve
                  <img src={checkW} alt="checkW" className="w-4 h-4 object-cover rounded " />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filtered + sorted data for search (latest -> oldest)
  const filteredSlipData = allSlipData
    .filter((slip) => {
      const nameMatch = String(slip.name || '').toLowerCase().includes(search.toLowerCase());
      const sidMatch = String(slip.sid || '').toLowerCase().includes(search.toLowerCase());
      return nameMatch || sidMatch;
    })
    .sort((a, b) => (b.timeCreatedMs || 0) - (a.timeCreatedMs || 0));

  // data na iloload sa table
  const requestTable = filteredSlipData.map((slips) => (
    <tr key={slips._id} className="hover:bg-gray-100 transition">
      <td className="px-4 py-3">{slips.name}</td>
      <td className="px-4 py-3">{slips.sid}</td>
      <td className="px-4 py-3">{slips.typeOfSlip}</td>
      <td className="px-4 py-3">{slips.timeCreatedFormatted || formatDate(slips.timeCreated)}</td>
      {/* STATUS with conditional styling */}
      <td
        className={`px-4 py-3 font-semibold ${slips.status === "Approved"
          ? "text-green-600"
          : slips.status === "Rejected"
            ? "text-red-600"
            : "text-gray-600"
          }`}
      >
        {slips.status}
      </td>
      <td className="px-4 py-3">{slips.reason}</td>
      <td className="px-4 py-3">{slips.attachmentCount}</td>
      {authData?.user?.access?.requestSlip?.canEdit ? <td className="px-4 py-3">
        <button
          className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
          onClick={() => openSlip(slips._id)}>
          Open
        </button>
      </td> : null}
    </tr>
  ));

  if (!authData?.user?.access?.requestSlip?.canView) {
    const error401 = () => {
      navigate('/error401')
    }
    return error401()
  }

  return (
    <div className="bg-gray-100 h-full p-3">
      <div className="bg-white shadow-md p-4 rounded-lg overflow-y-auto">

        <div className="flex text-left mb-2">
          <p className="text-4xl font-bold">Request Slip Processing</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500">Approve/ Deny Request Slips.</p>
          <div className="flex gap-2">

            {/* History button */}
            {authData?.user?.access?.requestSlip?.canEdit ? <button
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
              onClick={() => navigate("/guidance/request-slip-history")}
            >
              History
              <img src={historyW} alt="history" className="w-5 h-5 object-cover rounded" />
            </button> : null}

            {/* Search Bar */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </span>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-y-auto custom-scrollbar h-175">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-700">
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Name</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Student No.</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Type of Slip</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Date</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Status</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Reason</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3 font-semibold">Attachments</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>{requestTable}</tbody>
          </table>
        </div>

      </div>
      {displaySlipForm()}
    </div>
  );
}

export default RequestSlip;