import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import back from '../../../assets/back.png'
import closeB from '../../../assets/closeblack.png';

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
        <div className="bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl rounded-lg shadow-lg p-4 sm:p-6 relative overflow-y-auto max-h-[90vh] outline-solid outline-2 outline-gray-300">
          <div className='flex items-center '>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute mb-3 right-5 text-2xl text-gray-700 hover:text-black"
            >
              <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded " />
            </button>
            <h2 className="text-2xl font-bold mb-4">Request Slip Form</h2>
          </div>
          <hr className="mb-4" />

          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {selectedSlip.name}</p>
            <p><span className="font-semibold">Program:</span> {selectedSlip.program}</p>
            <p><span className="font-semibold">Year and Section:</span> {selectedSlip.yearSection}</p>
            <p><span className="font-semibold">Email:</span> {selectedSlip.email}</p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span className={selectedSlip.status === 'Approved' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {selectedSlip.status}
              </span>
            </p>
            <p><span className="font-semibold">Reason:</span> {selectedSlip.reason}</p>
            <p><span className="font-semibold">Days Absent:</span> {selectedSlip.daysAbsent}</p>
            <p><span className="font-semibold">Date:</span> {selectedSlip.timeCreatedFormatted}</p>
          </div>

          {/* Attachments same as in RequestSlip */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {proofUrl && (
              <div className="flex flex-col items-center">
                <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                  <img src={proofUrl} alt="Proof" className="w-24 h-24 object-cover rounded" />
                </a>
                <span className="text-xs text-gray-600 mt-2 text-center">Proof of Transaction</span>
              </div>
            )}
            {excuseLetterUrl && (
              <div className="flex flex-col items-center">
                <a href={excuseLetterUrl} target="_blank" rel="noopener noreferrer">
                  <img src={excuseLetterUrl} alt="Excuse Letter" className="w-24 h-24 object-cover rounded" />
                </a>
                <span className="text-xs text-gray-600 mt-2 text-center">Excuse Letter</span>
              </div>
            )}
            {medicalCertificateUrl && (
              <div className="flex flex-col items-center">
                <a href={medicalCertificateUrl} target="_blank" rel="noopener noreferrer">
                  <img src={medicalCertificateUrl} alt="Medical" className="w-24 h-24 object-cover rounded" />
                </a>
                <span className="text-xs text-gray-600 mt-2 text-center">Medical Certificate</span>
              </div>
            )}
            {guardianValidIDUrl && (
              <div className="flex flex-col items-center">
                <a href={guardianValidIDUrl} target="_blank" rel="noopener noreferrer">
                  <img src={guardianValidIDUrl} alt="Guardian ID" className="w-24 h-24 object-cover rounded" />
                </a>
                <span className="text-xs text-gray-600 mt-2 text-center">Guardian’s ID</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displaySlipHistoryTable = slipData
    .filter((slip) => {
      const searchLower = search.toLowerCase();
      return (
        slip.name?.toLowerCase().includes(searchLower) ||
        slip.sid?.toLowerCase().includes(searchLower)
      );
    })
    .map((slips, idx) => (
      <tr key={idx} className="hover:bg-gray-100 transition">
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">{slips.name}</td>
        <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.sid}</td>
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">{slips.typeOfSlip}</td>
        <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.timeCreatedFormatted}</td>
        {colorStatusIndicator(slips.status)}
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">{slips.reason}</td>
        <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
          <button
            onClick={() => setSelectedSlip(slips)}
            className="bg-gray-900 text-white px-3 sm:px-4 py-1 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/guidance/request-slip')}
              style={{ cursor: 'pointer' }}
              className='flex items-center justify-center p-1 hover:bg-gray-300 transition duration-200 rounded'
            >
              <img src={back} alt="back" className="w-7 h-7 object-cover rounded" />
            </button>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">Request Slip History</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
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
        <div className="bg-white rounded-lg shadow-md overflow-y-auto custom-scrollbar h-180">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-700">
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] lg:text-base w-0 lg:px-4 lg:py-3 lg:font-bold lg:w-auto">Student No.</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] lg:text-base w-0 lg:px-4 lg:py-3 lg:font-bold lg:w-auto">Date</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] lg:text-base w-0 lg:px-4 lg:py-3 lg:font-bold lg:w-auto">Status</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold">Reason</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] lg:text-base w-0 lg:px-4 lg:py-3 lg:font-bold lg:w-auto">Attachments</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>{displaySlipHistoryTable}</tbody>
          </table>
        </div>

        <div>{displayRequestSlipForm()}</div>
      </div>
    </div>
  );
}

export default RequestSlipHistory;
