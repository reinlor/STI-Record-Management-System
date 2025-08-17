import React, { useState } from "react";
import Button from '../../../component/Button.jsx';

const StudentInformation = ({ student, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Basic Information");
  const itemsPerPage = 10;

  const categories = {
    "Basic Information": [
        { label: "Name", value: student.studentProfile.name || "N/A"},
        { label: "ID", value: student.id || "N/A"},
        { label: "Email", value: student.contactInfo.email || "N/A"},
        { label: "Contact No", value: student.contactInfo.contactNo || "N/A"},
        { label: "Academic Level", value: student.studentProfile.academicLevel || "N/A"},
        { label: "Program", value: student.studentProfile.newProgram || "N/A"},
        { label: "Year Level", value: student.studentProfile.newLevel || "N/A"},
        { label: "Section", value: student.studentProfile.newSection || "N/A"},
        { label: "Gender", value: student.studentProfile.gender || "N/A"},
        { label: "Birth Date", value: student.studentProfile.birthday || "N/A"},
        { label: "Address", value: student.contactInfo.address.permanentAddress || "N/A"},
        { label: "Emergency Contact", value: student.familyBackground.emergency.name || "N/A"},
        { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo || "N/A"},
        { label: "Health Condition/s", value: student.health.illness || "N/A"},
    ],
    "Personal Information": [
        { label: "Full Name", value: student.studentProfile.name || "N/A"},
        { label: "Nickname", value: student.studentProfile.nickname || "N/A"},
        { label: "Student No.", value: student.id || "N/A"},
        { label: "Academic Level", value: student.studentProfile.academicLevel || "N/A"},
        { label: "Program", value: student.studentProfile.section || "N/A"},
        { label: "Year Level", value: student.studentProfile.section || "N/A"},
        { label: "Section", value: student.studentProfile.section || "N/A"},
        { label: "Gender", value: student.studentProfile.gender || "N/A"},
        { label: "Birth Date", value: student.studentProfile.birthday || "N/A"},
        { label: "Nationality", value: student.studentProfile.nationality || "N/A"},
        { label: "Religion", value: student.studentProfile.religion || "N/A"},
        { label: "Status", value: student.studentProfile.status || "N/A"},
    ],
    "Contact Information": [
        { label: "Mobile Phone No.", value: student.contactInfo.contactNo || "N/A"},
        { label: "Email Address", value: student.contactInfo.email || "N/A"},
        { label: "Home No.", value: student.contactInfo.homeNo || "N/A"},
        { label: "Present Address", value: student.contactInfo.address.currentAddress || "N/A"},
        { label: "Permanent Address", value: student.contactInfo.address.permanentAddress || "N/A"},
        { label: "Provincial Address", value: student.contactInfo.address.provincialAddress || "N/A"},
        { label: "Work No.", value: student.contactInfo.workNo || "N/A"},
        { label: "Emergency Contact", value: student.familyBackground.emergency.name || "N/A"},
        { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo || "N/A"},
    ],
    // ... (rest of the categories object, using "N/A" as a fallback)
  };
  
  const currentItems = categories[selectedCategory] || [];
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col h-full box-border bg-white p-7 relative">
      <div className="absolute top-4 right-4 flex gap-2.5 z-10">
        <Button className="bg-yellow-400 text-gray-800 py-1.5 px-3.5 rounded-md font-medium cursor-pointer transition-colors hover:bg-yellow-500 hover:text-white">Edit</Button>
        <Button className="bg-gray-500 text-white py-1.5 px-3.5 rounded-md font-medium cursor-pointer transition-colors hover:bg-gray-600">Archive</Button>
        <Button className="bg-red-600 text-white py-1.5 px-3 rounded-md font-medium cursor-pointer transition-colors hover:bg-red-800" onClick={onClose}>X</Button>
      </div>

      <div className="flex items-center gap-5 mb-5 pb-4 border-b border-gray-200">
        <img src={student.image} alt="Student" className="w-[70px] h-[70px] rounded-full object-cover border-2 border-blue-500 shadow-md" />
        <div>
          <h3 className="m-0 text-xl font-semibold text-gray-800">{student.name}</h3>
          <p className="my-1 text-sm text-gray-600">{student.id}</p>
          <p className="my-1 text-sm text-gray-600">{student.program}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <select
          className="flex-1 max-w-xs p-2.5 text-base border border-gray-300 rounded-lg bg-gray-100 appearance-none transition-colors hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:bg-white"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          {Object.keys(categories).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <Button className="bg-blue-500 text-white py-2.5 px-4 text-sm rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap hover:bg-blue-700">
          View Cases
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2.5 mb-2.5 min-h-0">
        <div>
          <div className="flex flex-col gap-3 animate-fadeIn">
            {visibleItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 px-4 rounded-lg text-sm text-gray-800 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-blue-50">
                <span className="font-semibold text-gray-600 flex-1">{item.label}:</span>
                <strong className="flex-grow-[2] text-right text-gray-900">{String(item.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-3 border-t border-gray-200 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            className={`py-2 px-3.5 rounded-md font-medium cursor-pointer transition-colors ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StudentInformation;