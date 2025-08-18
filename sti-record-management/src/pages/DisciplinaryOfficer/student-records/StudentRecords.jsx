import React, { useState, useEffect } from "react";
import Button from "../../../component/Button.jsx";
import { mockStudentData } from "./mockData.js"; // corrected filename

const StudentRecords = ({ onStudentSelect = () => {} }) => {
  console.log("onStudentSelect prop:", onStudentSelect);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (typeof onStudentSelect !== "function") {
      console.log("not a function!", onStudentSelect);
    }
  }, [onStudentSelect]);

  // Use the mock data directly
  const [studentData, setStudentData] = useState(mockStudentData);
  const [visible, setVisibility] = useState(true);

  const filteredStudents = studentData.filter((student) => {
    const idToCheck = String(student.id ?? student.sid ?? "").toLowerCase();
    return idToCheck.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={`max-w-5xl mx-auto p-5 bg-white rounded-lg shadow-lg transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
      <h2 className="text-2xl font-bold mb-4 text-left text-gray-800">Student Records</h2>
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded-md text-base mb-6 focus:outline-none focus:border-blue-500 transition-colors"
        placeholder="Search by Student ID"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
      />
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-3">
          <Button className="bg-gray-100 border border-gray-300 text-gray-800 py-1 px-4 rounded-md font-medium cursor-pointer transition-all hover:bg-blue-500 hover:text-white hover:border-blue-500">
            Enrolled
          </Button>
          <Button className="bg-gray-100 border border-gray-300 text-gray-800 py-1 px-4 rounded-md font-medium cursor-pointer transition-all hover:bg-blue-500 hover:text-white hover:border-blue-500">
            Archived
          </Button>
        </div>
        <div>
          <Button className="bg-green-600 text-white py-1 px-4 rounded-md font-medium cursor-pointer transition-colors hover:bg-green-800">
            Add Student
          </Button>
        </div>
      </div>
      <div>
        {visibleStudents.map((student) => (
          <div
            key={student.sid ?? student.id}
            className="flex items-center gap-3 bg-gray-50 p-3 mb-3 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out hover:bg-blue-100"
            onClick={() => {
              // guard the call to avoid TypeError if not a function
              if (typeof onStudentSelect === "function") {
                onStudentSelect(student);
              }
            }}
          >
            <img src={student.image} alt="Student" className="w-[50px] h-[50px] rounded-full object-cover border-2 border-blue-500" />
            <div className="flex-1">
              <strong className="text-base text-gray-800">{student.name}</strong>
              <p className="text-blue-600 font-medium text-sm my-1">{student.id ?? student.sid}</p>
              <p className="text-xs text-gray-600">Program: {student.program}</p>
              <p className="text-xs text-gray-600">Year Level: {student.studentProfile?.newLevel}</p>
            </div>
          </div>
        ))}
      </div>
      {filteredStudents.length === 0 && (
        <p className="text-center text-base text-gray-500 mt-8">No student found.</p>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              className={`py-2 px-4 rounded-md font-medium cursor-pointer transition-colors ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
              onClick={() => handlePageClick(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRecords;