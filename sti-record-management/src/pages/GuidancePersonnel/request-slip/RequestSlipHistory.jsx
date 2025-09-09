import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import back from '../../../assets/back.png'
import closeB from '../../../assets/closeblack.png';

import {
    Search,
    User,
    Clipboard,
    Plus,
    Check,
    X,
    Clock,
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

function formatDate(dateInput) {
  const ms = typeof dateInput === 'number' ? dateInput : parseToMillis(dateInput);
  if (!ms) return '';
  const d = new Date(ms);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function RequestSlipHistory() {
  const navigate = useNavigate()
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [search, setSearch] = useState("");
  const [slipData, setSlipData] = useState([]);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

        // Only Approved or Rejected
        const filtered = allSlips.filter(
          (s) => s.status === "Approved" || s.status === "Rejected"
        );

        // Sort latest → oldest
        filtered.sort((a, b) => (b.timeCreatedMs || 0) - (a.timeCreatedMs || 0));

        setSlipData(filtered);
      } catch (error) {
        console.error("Error fetching slip history:", error.message);
      }
    };
    fetchData();
  }, []);

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
    if (status === 'Approved') {
      return <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-green-600 lg:font-bold">{status}</td>
    } else {
      return <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-red-600 lg:font-bold">{status}</td>
    }
  }

  const displayRequestSlipForm = () => {
    if (!selectedSlip) return null;

    const { proofUrl, excuseLetterUrl, guardianValidIDUrl, medicalCertificateUrl } = selectedSlip;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="relative bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-7xl rounded-lg shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] animate-fadeIn custom-scrollbar outline-solid outline-2 outline-gray-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-[#0172bd]">Request Slip Form</h2>
              <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
                {selectedSlip.typeOfSlip}
              </span>
            </div>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute right-5 top-5 text-2xl text-[#0172bd] hover:text-blue-500"
            >
              <X className="w-10 h-10 object-cover rounded" />
            </button>
          </div>
          <hr className="mb-4" />

          {/* Main content: Info left, Attachments right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Info Left */}
            <div className="space-y-2">
              <p><span className="font-bold text-[#0172bd]">Name:</span> {selectedSlip.name}</p>
              <p><span className="font-bold text-[#0172bd]">Program:</span> {selectedSlip.program}</p>
              <p><span className="font-bold text-[#0172bd]">Year and Section:</span> {selectedSlip.yearSection}</p>
              <p><span className="font-bold text-[#0172bd]">Email:</span> {selectedSlip.email}</p>
              <p>
                <span className="font-bold text-[#0172bd]">Status:</span>{" "}
                <span className={selectedSlip.status === 'Approved' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {selectedSlip.status}
                </span>
              </p>
              <p><span className="font-bold text-[#0172bd]">Reason:</span> {selectedSlip.reason}</p>
              <p><span className="font-bold text-[#0172bd]">Days Absent:</span> {selectedSlip.daysAbsent}</p>
              <p><span className="font-bold text-[#0172bd]">Date:</span> {selectedSlip.timeCreatedFormatted}</p>
            </div>

            {/* Attachments Right */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                {proofUrl && (
                  <div className="flex flex-col items-center">
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                      <img src={proofUrl} alt="Proof" className="w-40 h-40 object-cover rounded" />
                    </a>
                    <span className="text-xs text-gray-600 mt-2 text-center">Proof of Transaction</span>
                  </div>
                )}
                {excuseLetterUrl && (
                  <div className="flex flex-col items-center">
                    <a href={excuseLetterUrl} target="_blank" rel="noopener noreferrer">
                      <img src={excuseLetterUrl} alt="Excuse Letter" className="w-40 h-40 object-cover rounded" />
                    </a>
                    <span className="text-xs text-gray-600 mt-2 text-center">Excuse Letter</span>
                  </div>
                )}
                {medicalCertificateUrl && (
                  <div className="flex flex-col items-center">
                    <a href={medicalCertificateUrl} target="_blank" rel="noopener noreferrer">
                      <img src={medicalCertificateUrl} alt="Medical" className="w-40 h-40 object-cover rounded" />
                    </a>
                    <span className="text-xs text-gray-600 mt-2 text-center">Medical Certificate</span>
                  </div>
                )}
                {guardianValidIDUrl && (
                  <div className="flex flex-col items-center">
                    <a href={guardianValidIDUrl} target="_blank" rel="noopener noreferrer">
                      <img src={guardianValidIDUrl} alt="Guardian ID" className="w-40 h-40 object-cover rounded" />
                    </a>
                    <span className="text-xs text-gray-600 mt-2 text-center">Guardian’s ID</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displaySlipHistoryTable = pagedSlipData.map((slips, idx) => (
    <tr key={idx} className="hover:bg-gray-100 transition">
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap font-bold w-1/4">{slips.name}</td>
      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.sid}</td>
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.typeOfSlip}</td>
      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.timeCreatedFormatted}</td>
      {colorStatusIndicator(slips.status)}
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 break-words max-w-[120px] truncate align-middle" title={slips.reason}>
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[140px]">
          {slips.reason}
        </span>
      </td>
      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>
      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
        <button
          onClick={() => setSelectedSlip(slips)}
          className="bg-[#0172bd] text-[#fef201] font-semibold px-3 sm:px-4 py-1 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto"
        >
          Open
        </button>
      </td>
    </tr>
  ));

  return (
    <div className="bg-gray-100 h-220 p-3">
      <div className="bg-white shadow-md p-4 rounded-lg">
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
        <div className="bg-white rounded-lg shadow-md overflow-y-auto custom-scrollbar h-180 relative pb-12">
          <table className="w-full text-left">
            <thead>
              <tr className=" text-[#fef201]">
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Student No.</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Reason</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Attachments</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>{displaySlipHistoryTable}</tbody>
          </table>
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
                className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0172bd] text-[#fef201]' : 'hover:bg-gray-200 text-[#0172bd]'}`}
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

        

        <div>{displayRequestSlipForm()}</div>
      </div>
    </div>
  );
}

export default RequestSlipHistory;
