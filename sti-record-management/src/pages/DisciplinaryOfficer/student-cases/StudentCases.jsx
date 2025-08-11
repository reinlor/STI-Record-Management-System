import { useState } from "react";
import AddCaseModal from "./AddCaseModal";
import user from '../../../assets/user.png';
import back from '../../../assets/back.png';
import Button from "../../../component/Button"; 
import forward from '../../../assets/right-arrow.png';

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

function StudentCases(){

    const [selected, setSelected] = useState(null);
    const [tab, setTab] = useState("On-going");
    const [showAddModal, setShowAddModal] = useState(false);

    return(
        <div className="flex h-[92.5vh] gap-3 p-4 bg-gray-100">

            {/* Left Panel */}
            <div className="w-1/2 bg-white rounded-lg p-4 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                <p className="text-5xl font-bold">Student Case</p>

                    {/* Search Bar */}
                    <div className="flex gap-1">
                        <input
                            type="text"
                            placeholder="Name/ ID"
                            className="rounded-full border px-3 py-1 text-sm w-80"
                        />
                    </div> 

                </div>

                    {/* Resolved and Ongoing Buttons */}
                    <div className="flex gap-2 mb-4">
                        <button
                            className={`p-2 rounded-md font-semibold border border-[#0B1320] cursor-pointer border transition ${
                            tab === "Resolved"
                                ? "bg-[#0B1320] text-white hover:bg-[#0E2148]"
                                : "bg-white text-[#0B1320] hover:bg-gray-200"
                            }`}
                            onClick={() => setTab("Resolved")}
                        >
                            Resolved
                        </button>
                        <button
                            className={`p-2 rounded-md font-semibold border border-[#0B1320] cursor-pointer border transition ${
                            tab === "On-going"
                                ? "bg-[#0B1320] text-white hover:bg-[#0E2148]"
                                : "bg-white text-[#0B1320] hover:bg-gray-200"
                            }`}
                            onClick={() => setTab("On-going")}
                        >
                            On-going
                        </button>

                    {/* Add Case Button */}
                    <Button
                        className="bg-[#0B1320] text-white p-2 rounded-md font-semibold ml-auto flex items-center gap-2"
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Case
                    </Button>

                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar ">

                {students.map((student) => (
                    <div
                    key={student.id}
                    className="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 rounded-lg p-4 mb-2 cursor-pointer border"
                    onClick={() => setSelected(student)}
                    >
                    <img src={user} alt="User" className="w-12 h-12 object-cover" />

                    <div className="flex-1">
                        <div className="font-semibold text-xl">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.studentNo}</div>
                    </div>
                    <span>
                        <img src={forward} alt="forward" className="w-8 h-8 object-cover rounded" /> 
                    </span>
                    </div>
                    
                ))}
                </div>
            </div>

            {/* Right Panel */}
            {selected && (
                <div className="w-1/2 bg-white rounded-lg p-4 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        {/* Back Button */}
                        <button
                        onClick={() => setSelected(null)}
                        title="Back"
                        > <img src={back} alt="back" className="w-7 h-7 object-cover rounded" /> 
                        </button>

                        <div className="flex gap-2">
                        <button className="bg-gray-900 text-white px-4 py-1 rounded-full font-semibold">Edit Case</button>
                        <button className="bg-red-500 text-white px-4 py-1 rounded-full font-semibold">Archive Case</button>
                        </div>

                    </div>

                <hr class="border-t border-gray-300 my-2"></hr>     

                <h2 className="text-3xl font-bold mb-4">Case Detail</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-md">
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

            <AddCaseModal open={showAddModal} onClose={() => setShowAddModal(false)} />

            </div>
            
        );
        
}

export default StudentCases;