import React, { use, useState } from "react";
import defaultProfile from "../../../assets/karomi.jpg";
import userStyle from "./student-module-css/s-records.module.css";
import Button from "../../../component/Button.jsx";

const studentData = [
  {
    id: "02000289482",
    name: "Colinco, Jordan Vincent Bulfa",
    email: "jordancolinco@gmail.com",
    contactNo: "09950411879",
    acadLevel: "College",
    program: "BSIT",
    yearLevel: "3rd Year",
    section: "A",
    gender: "Male",
    birthDate: "April 14, 2003",
    perAddress: "Blk 7 L 28 Vivace Subdivision Buhay na Tubig",
    emergencyContact: "Jose Jovy Colinco",
    emergencyContactNo: "09950411879",
    healthConditions: "None",
    image: defaultProfile,
  },
  {
    id: "02000289483",
    name: "Lor, Rehneil Bulfa",
    email: "rehneillor@gmail.com",
    contactNo: "09950411879",
    acadLevel: "College",
    program: "BSIT",
    yearLevel: "3rd Year",
    section: "C",
    gender: "Male",
    birthDate: "April 14, 2003",
    perAddress: "Blk 7 L 28 Vivace Subdivision Buhay na Tubig",
    emergencyContact: "Jose Jovy Colinco",
    emergencyContactNo: "09950411879",
    healthConditions: "None",
    image: defaultProfile,
  },
  {
    id: "02000289484",
    name: "Colinco, Jordan Vincent Bulfa",
    email: "jordancolinco@gmail.com",
    contactNo: "09950411879",
    acadLevel: "College",
    program: "BSIT",
    yearLevel: "3rd Year",
    section: "A",
    gender: "Male",
    birthDate: "April 14, 2003",
    perAddress: "Blk 7 L 28 Vivace Subdivision Buhay na Tubig",
    emergencyContact: "Jose Jovy Colinco",
    emergencyContactNo: "09950411879",
    healthConditions: "None",
    image: defaultProfile,
  },
  {
    id: "02000289485",
    name: "Colinco, Jordan Vincent Bulfa",
    email: "jordancolinco@gmail.com",
    contactNo: "09950411879",
    acadLevel: "College",
    program: "BSIT",
    yearLevel: "3rd Year",
    section: "A",
    gender: "Male",
    birthDate: "April 14, 2003",
    perAddress: "Blk 7 L 28 Vivace Subdivision Buhay na Tubig",
    emergencyContact: "Jose Jovy Colinco",
    emergencyContactNo: "09950411879",
    healthConditions: "None",
    image: defaultProfile,
  },
  {
    id: "02000289486",
    name: "Colinco, Jordan Vincent Bulfa",
    email: "jordancolinco@gmail.com",
    contactNo: "09950411879",
    acadLevel: "College",
    program: "BSIT",
    yearLevel: "3rd Year",
    section: "A",
    gender: "Male",
    birthDate: "April 14, 2003",
    perAddress: "Blk 7 L 28 Vivace Subdivision Buhay na Tubig",
    emergencyContact: "Jose Jovy Colinco",
    emergencyContactNo: "09950411879",
    healthConditions: "None",
    image: defaultProfile,
  },
  {
    id: "02000289487",
    name: "Colinco, Jordan Vincent Bulfa",
    email: "jordancolinco@gmail.com",
    contactNo: "09950411879",
    acadLevel: "College",
    program: "BSIT",
    yearLevel: "3rd Year",
    section: "A",
    gender: "Male",
    birthDate: "April 14, 2003",
    perAddress: "Blk 7 L 28 Vivace Subdivision Buhay na Tubig",
    emergencyContact: "Jose Jovy Colinco",
    emergencyContactNo: "09950411879",
    healthConditions: "None",
    image: defaultProfile,
  },
  // Add more students here to test pagination
];

const StudentRecords = ({ onStudentSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    <div className={userStyle.recordsContainer}>
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
          key={student.id}
          className={userStyle.studentItem}
          onClick={() => onStudentSelect(student)}
        >
          <img src={student.image} alt="Student" />
          <div>
            <strong>{student.name}</strong>
            <p className={userStyle.studentId}>{student.id}</p>
            <p>Program: {student.program}</p>
            <p>Year Level: {student.yearLevel}</p>
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
              className={`${userStyle.pageButton} ${
                currentPage === i + 1 ? userStyle.activePage : ""
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
