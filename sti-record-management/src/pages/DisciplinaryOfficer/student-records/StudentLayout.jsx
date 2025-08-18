import React, { useState } from "react";
import StudentRecords from "./StudentRecords.jsx";
import StudentInformation from "./StudentInformation.jsx";

const StudentLayout = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  // This is the function that should be passed to StudentRecords.
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseInfo = () => {
    setSelectedStudent(null);
  };

  return (
    <div
      className={`flex w-full h-full bg-gray-50 overflow-hidden ${
        selectedStudent ? "justify-start" : "justify-center"
      }`}
    >
      <div
        className={`overflow-y-auto ${
          selectedStudent ? "w-[35%] max-w-none" : "w-full max-w-4xl"
        }`}
      >
        {/*
          This is the line to fix.
          Ensure onStudentSelect={handleStudentSelect} is present.
        */}
        <StudentRecords onStudentSelect={handleStudentSelect} />
      </div>

      {selectedStudent && (
        <div className="w-[65%] h-full overflow-y-auto bg-white border-l border-gray-200">
          <StudentInformation
            student={selectedStudent}
            onClose={handleCloseInfo}
          />
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
