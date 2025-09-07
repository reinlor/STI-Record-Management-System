import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import RequestSlipHistory from "./RequestSlipHistory.jsx";
import axios from "axios";
import historyW from "../../../assets/history.png";
import closeB from "../../../assets/closeblack.png";
import closeW from "../../../assets/close.png";
import checkW from "../../../assets/check.png";
import { AuthContext } from '../../../AuthProvider.jsx';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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

  if (!authData?.user?.access?.requestSlip) {
    const error401 = () => {
      navigate('/error401')
    }
    return error401()
  }


  const [body, setBody] = useState("Please proceed to the Guidance and Counseling Office");


  const handleStatusChange = async (slipType, slipId, status, slip) => {
    try {
      await axios.put(`/slip/update/${slipType}/${slipId}`, { status });

      const emailData = {
        to: slip.email,
        subject: `Your ${slipType} Request has been ${status}`,
        text: `Hello ${slip.name},\n\nYour ${slipType} submitted on ${slip.timeCreatedFormatted} has been ${status}.\n\n ${body} \n\n- Admin`
      };

      await axios.post("/email/send", emailData);

      setAllSlipData((prev) =>
        prev.map((s) =>
          s.id === slipId ? { ...s, status } : s
        )
      );

      alert(`Slip updated to ${status} and email sent!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update slip or send email");
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
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="relative bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl rounded-lg shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] animate-fadeIn custom-scrollbar outline-solid outline-2 outline-gray-300">
          {/* header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Request Slip Form</h2>
              <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
                {selectedSlip.typeOfSlip}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="text-2xl text-gray-700 hover:text-black"
            >
              <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded " />
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
                  { label: "Reason: ", value: selectedSlip.reason },
                  { label: "Days Absent: ", value: selectedSlip.daysAbsent },
                ].map((item, i) => (
                  <div key={i} className="flex items-center flex-wrap">
                    <p className="font-bold text-gray-600 mr-5">{item.label}</p>
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

            {/* RIGHT PANEL */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Send Email To</label>
                <input
                  type="text"
                  value={selectedSlip.email}
                  className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                  readOnly
                />
              </div>
              {/* <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue="Requested Slip Form Status"
                  className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                />
              </div> */}
              <div>
                <label className="block text-sm font-semibold mb-1">Body</label>
                <textarea
                  className="border rounded px-3 py-2 w-full h-20 sm:h-24 resize-none text-xs sm:text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: always at the bottom, full width on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 pt-6">
            <button
              onClick={() => handleStatusChange(selectedSlip.typeOfSlip, selectedSlip._id, "Denied", selectedSlip)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Deny
              <img src={closeW} alt="closeW" className="w-4 h-4 object-cover rounded " />
            </button>

            <button
              onClick={() => handleStatusChange(selectedSlip.typeOfSlip, selectedSlip._id, "Approved", selectedSlip)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
              <img src={checkW} alt="checkW" className="w-4 h-4 object-cover rounded " />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filtered + sorted data for search (latest -> oldest)
  const filteredSlipData = allSlipData
    .filter((slip) => slip.status === "Pending")   // ✅ show only pending slips
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
      {authData?.user?.access?.requestSlip ? <td className="px-4 py-3">
        <button
          className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
          onClick={() => openSlip(slips._id)}>
          Open
        </button>
      </td> : null}
    </tr>
  ));



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
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">Request Slip Processing</p>
            <p className="text-gray-500 text-sm sm:text-base ">Approve/ Deny Request Slips.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* History button */}
            {authData?.user?.access?.requestSlip && (
              <button
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
                onClick={() => navigate("/guidance/request-slip-history")}
              >
                History
                <img src={historyW} alt="history" className="w-5 h-5 object-cover rounded" />
              </button>
            )}

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar h-[70vh]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-700">
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Student No.</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Reason</th>

                {/* Shrunk columns for small/tablet */}
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Attachments</th>

                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSlipData.map((slips) => (
                <tr key={slips._id} className="hover:bg-gray-100 transition">
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.name}</td>
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
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 whitespace-normal break-words max-w-[150px]">{slips.reason}</td>

                  {/* Shrunk columns */}


                  <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>

                  {authData?.user?.access?.requestSlip && (
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                      <button
                        className="bg-gray-900 text-white px-3 sm:px-4 py-1 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
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
      </div>

      {displaySlipForm()}
    </div>

  );
}

export default RequestSlip;