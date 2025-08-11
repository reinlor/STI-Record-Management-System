import react, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import back from '../../../assets/back.png'
import closeB from '../../../assets/closeblack.png';


function requestSlipHistory() {
    const navigate = useNavigate()
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [search, setSearch] = useState("");

    // Papalit pag may axios requet na
    const sampleData = [{
        name: 'Lor, Rehneil',
        studentNo: '02000000000',
        typeOfSlip: 'Absent Slip',
        date: '07/31/2025',
        status: 'Denied',
        reason: 'LBM',
        daysAbsent: '2'
    }, {
        name: 'Tugna, Sean',
        studentNo: '02000000000',
        typeOfSlip: 'Late Slip',
        date: '07/31/2025',
        status: 'Approved',
        reason: 'Traffic',
        daysAbsent: '0'
    }]

    // Papalit ng logic kung may maisip na maayos
    const colorStatusIndicator = (status) => {
        if (status === 'Approved') {
            return <td className="px-4 py-3 text-green-600 font-bold">{status}</td>
        }
        else {
            return <td className="px-4 py-3 text-red-600 font-bold">{status}</td>
        }
    }

    const displayRequestSlipForm = () => {
      return (
        selectedSlip && (
          <div className="fixed inset-0 flex items-center justify-center z-50 ">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh] outline-solid outline-2 outline-gray-300">

            <div className='flex items-center '>

              {/* Close button */}
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
                <p><span className="font-semibold">Program:</span> BSIT</p>
                <p><span className="font-semibold">Year and Section:</span> 4A</p>
                <p><span className="font-semibold">Email:</span> depedrodionne@gmail.com</p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span className={selectedSlip.status === 'Approved' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {selectedSlip.status}
                  </span>
                </p>
                <p><span className="font-semibold">Reason:</span> {selectedSlip.reason}</p>
                <p><span className="font-semibold">Days Absent:</span> {selectedSlip.daysAbsent}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Excuse Letter/ Medical Certificate</h3>

                <div className="flex gap-2">

                  <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    {/* Placeholder SVG */}
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7l9 6 9-6-9-6-9 6zm0 7l9 6 9-6"/>
                    </svg>
                  </div>

                  <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7l9 6 9-6-9-6-9 6zm0 7l9 6 9-6"/>
                    </svg>
                  </div>

                </div>

                <h3 className="font-semibold mt-4 mb-2">Photo of Parent’s/Guardian’s ID</h3>
                <div className="flex gap-2">
                  <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7l9 6 9-6-9-6-9 6zm0 7l9 6 9-6"/>
                    </svg>
                  </div>
                  <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 7l9 6 9-6-9-6-9 6zm0 7l9 6 9-6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )
    }


    const displaySlipHistoryTable = sampleData.map(
        (slips, idx) =>
            <tr key={idx} className="hover:bg-gray-100 transition">
                <td className="px-4 py-3">{slips.name}</td>
                <td className="px-4 py-3">{slips.studentNo}</td>
                <td className="px-4 py-3">{slips.typeOfSlip}</td>
                <td className="px-4 py-3">{slips.date}</td>
                {colorStatusIndicator(slips.status)}
                <td className="px-4 py-3">{slips.reason}</td>
                <td className="px-4 py-3">{slips.daysAbsent}</td>
                <td className="px-4 py-3">

                    <button
                      onClick={() => setSelectedSlip(slips)}
                      className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
                    >
                      Open
                    </button>

                </td>
            </tr>
    )

    return (
        
        <div className="bg-gray-100 h-220 p-3">
                <div className="bg-white shadow-md p-4 rounded-lg">

                    <div className="flex text-left mb-2">

                        <button onClick={() =>
                        navigate('/disciplinary/request-slip')}
                        style={{cursor:'pointer'}}
                        className='flex items-center justify-center mr-2 p-1 hover:bg-gray-300 transition duration-200'
                        >
                        
                        <img src={back} alt="back" className="w-7 h-7 object-cover rounded" />
                        </button>

                        <p className="text-4xl font-bold">Request Slip Processing</p>
                    </div>
        
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500">View Request Slip History</p>
                      <div className="flex gap-2">
                        
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
                        <tbody>{displaySlipHistoryTable}</tbody>
                      </table>
                    </div>
                    <div>{displayRequestSlipForm()}</div>
        
                </div>
            </div>
        
    );
}

export default requestSlipHistory;