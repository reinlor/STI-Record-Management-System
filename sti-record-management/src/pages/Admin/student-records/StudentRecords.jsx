import React, { use, useState, useEffect } from "react";
import defaultProfile from "../../../assets/karomi.jpg";
import userStyle from "./student-module-css/s-records.module.css";
import Button from "../../../component/Button.jsx";
import axios from "axios";

const StudentRecords = ({ onStudentSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Naka store dito ung student data from firebase     -Renlor
  const [studentData, setStudentData] = useState([]);
  // loading ulit                   -Renlor
  const [visible, setVisibility] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/student/");
        const processedStudentData = response.data.map(student => {
          const { program, section, level } = studentProgramAndSection(student.studentProfile.section);
          return {
            ...student,
            studentProfile: {
              ...student.studentProfile,
              newProgram: program,
              newSection: section,
              newLevel: level
            }
          };
        });
        setStudentData(processedStudentData);
      } catch (error) {
        console.log("Error while fetching data", error);
      }
    };
    fetchData();
    setVisibility(true);
  }, []);

  // Patangal kung may mas maayos na logic na niisip   -Renlor
  const studentProgramAndSection = (fullSectionString) => {
    if (!fullSectionString || fullSectionString === 'None') {
      return { program: 'N/A', section: 'N/A' };
    }

    const parts = fullSectionString.split(' ');
    let program = 'N/A';
    let section = 'N/A';
    let level = "N/A";

    if (parts.length === 2) {
      program = parts[0];
      section = parts[1];
    }
    else {
      const lastPart = parts[parts.length - 1];
      if (lastPart.match(/^\d+\.\d+$/)) {
        section = lastPart;
        program = parts.slice(0, parts.length - 1).join(' ');
      } else {
        program = fullSectionString;
        section = 'N/A';
      }
    }

    if(section === "4.1" || section === "4.2"){
      level = "4th Year"
    }
    else if(section === "3.1" || section === "3.2"){
      level = "3rd Year"
    }
    else if(section === "2.1" || section === "2.2"){
      level = "2nd Year"
    }
    else if(section === "1.1" || section === "1.2"){
      level = "1st Year"
    }
    return { program, section, level };
  };

  const filteredStudents = studentData.filter((student) =>
    student.id.includes(searchQuery)
  );

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
    <div className={`${userStyle.recordsContainer} ${visible ? 'visible' : 'hidden'}`}>
      <h2 className={userStyle.recordsTitle}>Student Records</h2>

      <input
        type="text"
        className={userStyle.searchInput}
        placeholder="Search by Student ID"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // Reset page on new search
        }}
      />

      {/*CONTROL BUTTONS*/}
      <div className={userStyle.controlButtons}>
        <div className={userStyle.leftButtons}>
          <Button className={userStyle.filterButton}>Enrolled</Button>
          <Button className={userStyle.filterButton}>Archived</Button>
        </div>
        <div className={userStyle.rightButtons}>
          <Button className={userStyle.addStudentBTN}>Add Student</Button>
        </div>
      </div>

      {/*STUDENT LIST*/}
      {visibleStudents.map((student) => (
        <div
          key={student.sid}
          className={userStyle.studentItem}
          onClick={() => onStudentSelect(student)}
        >
          <img src={defaultProfile} alt="Student" />
          <div>
            <strong>{student.studentProfile.name}</strong>
            <p className={userStyle.studentId}>{student.id}</p>
            <p>Program: {student.studentProfile.section}</p>
            <p>Year Level: {student.studentProfile.section}</p>
          </div>
        </div>
      ))}

      {filteredStudents.length === 0 && (
        <p className={userStyle.noResults}>No student found.</p>
      )}

      {totalPages > 1 && (
        <div className={userStyle.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              className={`${userStyle.pageButton} ${currentPage === i + 1 ? userStyle.activePage : ""
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
