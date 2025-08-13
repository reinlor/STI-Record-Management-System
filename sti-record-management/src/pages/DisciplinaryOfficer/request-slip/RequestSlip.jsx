import react, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import RequestSlipHistory from "./RequestSlipHistory.jsx";
import axios from "axios";
import historyW from "../../../assets/history.png";
import closeB from "../../../assets/closeblack.png";
import closeW from "../../../assets/close.png";
import checkW from "../../../assets/check.png";

// palagyan ng CSS
function RequestSlip() {
  const [display, setDisplay] = useState(false);
  const [allSlipData, setAllSlipData] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // holds the slip details when “Open” is clicked
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/slip/allSlips");

        const allSlips = res.data.map((slip) => ({
          ...slip,
        }));

        setAllSlipData(allSlips);
      } catch (error) {
        console.error("Error fetching slip data:", error.message);
      }
    };

    fetchData();
  }, []);

    // open modal and fetch single slip details
    const openSlip = (id) => {
      const foundSlip = allSlipData.find((slip) => slip._id === id);
      if (foundSlip) {
        setSelectedSlip(foundSlip);
        setDisplay(true);
      } else {
        console.error("Slip not found in local data");
      }
    };

    // close modal & clear selected data
    const closeModal = () => {
      setDisplay(false);
      setSelectedSlip(null);
    };


  const displaySlipForm = () => {
    if (!display || !selectedSlip) return null;

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
                  { label: "Year & Section: ", value: selectedSlip.yearSection || "4A" },
                  { label: "Email: ", value: selectedSlip.email },
                  {
                    label: "Status: ",
                    value: selectedSlip.status,
                    className:
                      selectedSlip.status === "Approved"
                        ? "text-green-600"
                        : selectedSlip.status === "Rejected"
                        ? "text-red-600"
                        : "text-gray-600",
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
                {[
                  "Excuse Letter / Medical Certificate",
                  "Guardian’s ID Front",
                  "Guardian’s ID Back",
                ].map((label, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center hover:shadow-md transition">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 7l9 6 9-6-9-6-9 6zm0 7l9 6 9-6"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      {label}
                    </span>
                  </div>
                ))}
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

  // Filtered data for search
  const filteredSlipData = allSlipData.filter(
    (slip) =>
      slip.name?.toLowerCase().includes(search.toLowerCase()) ||
      slip.sid?.toLowerCase().includes(search.toLowerCase())
  );

  // data na iloload sa table
  const requestTable = filteredSlipData.map((slips) => (
    <tr key={slips._id} className="hover:bg-gray-100">
      <td className="px-4 py-3">{slips.name}</td>
      <td className="px-4 py-3">{slips.sid}</td>
      <td className="px-4 py-3">{slips.typeOfSlip}</td>
      <td className="px-4 py-3">{slips.Date}</td>
      <td className="px-4 py-3">{slips.status}</td>
      <td className="px-4 py-3">{slips.reason}</td>
      <td className="px-4 py-3">{slips.attachmentCount}</td>
      <td className="px-4 py-3">
        <button
          className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
          onClick={() => openSlip(slips._id)}
        >
          Open
        </button>
      </td>
    </tr>
  ));

  // Palagyan ng CSS papalit din ng html kung kinakailangan
  return (
    <div className="bg-gray-100 h-220 p-3">
        <div className="bg-white shadow-md p-4 rounded-lg">
          
            <div className="flex text-left mb-2">
              <p className="text-4xl font-bold">Request Slip Processing</p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500">Approve/ Deny Request Slips.</p>
              <div className="flex gap-2">

                {/* History button */}
                <button
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
                  onClick={() => navigate("/disciplinary/request-slip-history")}
                >
                  History
                  <img src={historyW} alt="history" className="w-5 h-5 object-cover rounded" />
                </button>
                
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

            <div className="bg-white rounded-lg shadow-md">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Student No.</th>
                    <th className="px-4 py-3 font-semibold">Type of Slip</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 font-semibold">Attachments</th>
                    <th className="px-4 py-3"></th>
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