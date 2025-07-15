import React, { useState } from "react";
import StudentRecords from "./StudentRecords.jsx";
import StudentInformation from "./StudentInformation.jsx";
import "./student-module-css/StudentLayout.css";

const StudentLayout = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseInfo = () => {
    setSelectedStudent(null);
  };

  return (
    <div className={`layout-container ${selectedStudent ? "split" : ""}`}>
      <div className="student-records-section">
        <StudentRecords onStudentSelect={handleStudentSelect} />
      </div>

      {selectedStudent && (
        <div className="student-info-section">
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
