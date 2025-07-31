import { useState } from "react";
import user from '../../../assets/user.png';
import back from '../../../assets/back.png';

const students = [
  { id: 1, name: "Name, Student", studentNo: "02000293896" },
  { id: 2, name: "Name, Student", studentNo: "02000293896" },
  { id: 3, name: "Name, Student", studentNo: "02000293896" },
  { id: 4, name: "Name, Student", studentNo: "02000293896" },
  { id: 5, name: "Name, Student", studentNo: "02000293896" },
  { id: 6, name: "Name, Student", studentNo: "02000293896" },
  { id: 7, name: "Name, Student", studentNo: "02000293896" },
  { id: 8, name: "Name, Student", studentNo: "02000293896" },
];

export default function StudentCases() {
        const [selected, setSelected] = useState(null);
        const [tab, setTab] = useState("On-going");

        

            return (
                <div className="flex h-[90vh] gap-4 p-4 bg-gray-100">

                {/* Left Panel */}
                <div className="w-1/2 bg-white rounded-lg p-4 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                    <p className="text-5xl font-bold">Student Case</p>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Name/ ID"
                                className="rounded-full border px-3 py-1 text-sm w-50"
                            />
                       </div> 

                    </div>

                    <div className="flex gap-2 mb-4">
                        <button
                            className={`p-2 rounded-md font-semibold border border-[#0B1320] transition ${
                            tab === "Resolved"
                                ? "bg-[#0B1320] text-white"
                                : "bg-white text-[#0B1320]"
                            }`}
                            onClick={() => setTab("Resolved")}
                        >
                            Resolved
                        </button>
                        <button
                            className={`p-2 rounded-md font-semibold border border-[#0B1320] transition ${
                            tab === "On-going"
                                ? "bg-[#0B1320] text-white"
                                : "bg-white text-[#0B1320]"
                            }`}
                            onClick={() => setTab("On-going")}
                        >
                            On-going
                        </button>

                    <button className="bg-[#0B1320] text-white p-2 rounded-md font-semibold ml-auto flex items-center gap-2">
                        Add Case 
                    </button>
                </div>

        {/* Student List */}
                <div className="flex-1 overflow-y-auto">
                {students.map((student) => (
                    <div
                    key={student.id}
                    className="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 rounded-lg p-4 mb-2 cursor-pointer border"
                    onClick={() => setSelected(student)}
                    >
                    <img src={user} alt="User" className="w-12 h-12 object-cover" />
                    <div className="flex-1">
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-gray-600">{student.studentNo}</div>
                    </div>
                    <span className="material-icons text-gray-400">chevron_right</span>
                    </div>
                ))}
                </div>
            </div>

            {/* Right Panel */}
            {selected && (
                <div className="w-1/2 bg-white rounded-lg p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <button
                    className="material-icons text-2xl text-gray-700"
                    onClick={() => setSelected(null)}
                    title="Back"
                    > <img src={back} alt="back" className="w-10 h-10 object-cover rounded" /> 
                    </button>
                    <div className="flex gap-2">
                    <button className="bg-gray-900 text-white px-4 py-1 rounded-full font-semibold">Edit Case</button>
                    <button className="bg-red-500 text-white px-4 py-1 rounded-full font-semibold">Archive Case</button>
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-4">Case Detail</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="font-semibold">Name</div>
                    <div>{selected.name}</div>
                    <div className="font-semibold">Student No.</div>
                    <div>{selected.studentNo}</div>
                    <div className="font-semibold">Date of Incident</div>
                    <div>July 1, 2025</div>
                    <div className="font-semibold">Time of Incident</div>
                    <div>1:10 pm</div>
                    <div className="font-semibold">Violation Type/ Category</div>
                    <div>Misconduct</div>
                    <div className="font-semibold">Detailed Description</div>
                    <div>Caught during time of class</div>
                    <div className="font-semibold">Proof</div>
                    <div>
                    <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-100">
                        <span className="material-icons text-3xl text-gray-400">image</span>
                    </div>
                    </div>
                    <div className="font-semibold">Actions Taken/ Disciplinary Measures</div>
                    <div>Reasoned with</div>
                    <div className="font-semibold">Case Status</div>
                    <div>
                    <select className="border rounded px-2 py-1">
                        <option>On Going</option>
                        <option>Resolved</option>
                    </select>
                    </div>
                </div>
                </div>
            )}
            </div>
        );
}