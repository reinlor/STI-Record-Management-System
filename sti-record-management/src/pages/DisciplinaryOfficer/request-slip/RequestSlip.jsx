import react, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import RequestSlipHistory from "./RequestSlipHistory.jsx";
import axios from "axios";
import historyW from "../../../assets/history.png";

// palagyan ng CSS
function RequestSlip() {
  const [display, setDisplay] = useState(false);
  const [allSlipData, setAllSlipData] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

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

  const displaySlipForm = (id) => {
    if (display) {
      return (
        <>
          {/* Palagyan ng data */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Request Slip Form</h2>
            <div className="space-y-2">
              <label>Name: </label> <br />
              <label>Program: </label> <br />
              <label>Year and Section: </label> <br />
              <label>Email: </label> <br />
              <label>Status: </label> <br />
              <label>Reason: </label> <br />
              <label>Days Absent: </label> <br />
              <b>Excuse Letter/Medical Certificate</b> <br />
              <b>Photo of Parent's/Guardian ID</b> <br />
            </div>
            <div className="mt-4 space-y-2">
              <label className="block">
                Send Email to
                <input type="text" className="ml-2 border rounded px-2 py-1" />
              </label>
              <label className="block">
                Subject
                <input type="text" className="ml-2 border rounded px-2 py-1" />
              </label>
              <label className="block">
                Body
                <input type="text" className="ml-2 border rounded px-2 py-1" />
              </label>
              <div className="flex gap-2 mt-2">
                <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">Deny</button>
                <button className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">Approve</button>
              </div>
            </div>
          </div>
        </>
      );
    }
    return;
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
          onClick={() => setDisplay(!display)}
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
            <div>{displaySlipForm()}</div>

        </div>
    </div>
  );
}

export default RequestSlip;