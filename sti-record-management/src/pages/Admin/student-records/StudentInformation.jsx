import React, { useState } from "react";
import studentInfoStyle from "./student-module-css/info.module.css";
import Button from '../../../component/Button.jsx';

const StudentInformation = ({ student, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Basic Information");
  const itemsPerPage = 10;

  {/* COMBO BOX CATEGORIES */}
  const categories = {
    "Basic Information": [
      { label: "Name", value: student.name },
      { label: "ID", value: student.id },
      { label: "Email", value: student.email },
      { label: "Contact No", value: student.contactNo },
      { label: "Academic Level", value: student.acadLevel },
      { label: "Program", value: student.program },
      { label: "Year Level", value: student.yearLevel },
      { label: "Section", value: student.section },
      { label: "Gender", value: student.gender },
      { label: "Birth Date", value: student.birthDate },
      { label: "Address", value: student.perAddress },
      { label: "Emergency Contact", value: student.emergencyContact },
      { label: "Emergency Contact Number", value: student.emergencyContactNo },
      { label: "Health Condition/s", value: student.healthConditions },
    ],
    "Personal Information": [
      { label: "Full Name", value: student.fullName },
      { label: "Nickname", value: student.nickname },
      { label: "Student No.", value: student.id },
      { label: "Academic Level", value: student.acadLevel },
      { label: "Program", value: student.program },
      { label: "Year Level", value: student.yearLevel },
      { label: "Section", value: student.section },
      { label: "Gender", value: student.gender },
      { label: "Birth Date", value: student.birthDate },
      { label: "Nationality", value: student.nationality },
      { label: "Religion", value: student.religion },
      { label: "Status", value: student.status },
    ],

    "Contact Information": [
      { label: "Mobile Phone No.", value: student.mobileNum },
      { label: "Email Address", value: student.email },
      { label: "Home No.", value: student.homeNum },
      { label: "Present Address", value: student.preAddress },
      { label: "Permanent Address", value: student.perAddress },
      { label: "Work No.", value: student.workContactNum },
      { label: "Emergency Contact", value: student.emergencyContact },
      { label: "Emergency Contact Number", value: student.emergencyContactNo },
    ],

    "Family Background": [
      { label: "Father's Name", value: student.fatherName },
      { label: "Father's Age", value: student.fatherAge },
      { label: "Father's Birth Date", value: student.fatherBirthDate },
      { label: "Father's Nationality", value: student.fatherNationality },
      { label: "Father's Religion", value: student.fatherReligion },
      { label: "Father's Educational Attainment", value: student.fatherEducation },
      { label: "Father's Occupation", value: student.fatherOccupation },
      { label: "Father's Contact No.", value: student.fatherContactNum },
      { label: "Father's Email Address", value: student.fatherEmail },

      
      { label: "Mother's Name", value: student.motherName },
      { label: "Mother's Age", value: student.motherAge },
      { label: "Mother's Birth Date", value: student.motherBirthDate },
      { label: "Mother's Nationality", value: student.motherNationality },
      { label: "Mother's Religion", value: student.motherReligion },
      { label: "Mother's Educational Attainment", value: student.motherEducation },
      { label: "Mother's Occupation", value: student.motherOccupation },
      { label: "Mother's Contact No.", value: student.motherContactNum },
      { label: "Mother's Email Address", value: student.motherEmail },

      { label: "Stats of Parents", value: student.parentStatus },
      { label: "Name of Guardian", value: student.guardianName },
      { label: "Type of Relation with Guardian", value: student.guardianRelation },
      { label: "Guardian's Contact No.", value: student.guardianContactNum },
      { label: "Guardian's Email Address", value: student.guardianEmail },
      { label: "Parent/Guardian's Address", value: student.guardianAddress },
      { label: "Siblings", value: student.siblings },
      { label: "Siblings Count", value: student.siblingsCount },
      { label: "Birth Order", value: student.birthOrder },
    ],

    "Educational Background": [
      { label: "Name of Grade School", value: student.gradeSchool },
      { label: "Years Attended (From-To)", value: student.gradeYears },
      { label: "Name of Junior High School", value: student.highSchool },
      { label: "Years Attended (From-To)", value: student.highYears },
      { label: "Name of Senior High School", value: student.seniorHighSchool },
      { label: "Years Attended (From-To)", value: student.seniorHighYears },
      { label: "Name of College (For Transferees", value: student.collegeSchool },
      { label: "Years Attended (From-To)", value: student.collegeYears },
      { label: "Extra Curricular Activities from Previous School", value: student.extraCur },
      { label: "Awards/Citations received", value: student.awards },
      { label: "Most liked subject/s in school", value: student.mostLikedSubjects },
      { label: "Least liked subject/s in school", value: student.leastLikedSubjects },


    ],
    
    "Work Experience": [
      { label: "Name of Company/Institution", value: student.workCompanyName },
      { label: "Duration (From-To)", value: student.workDuration },
      { label: "Job Description", value: student.workDescription },
      { label: "Company Contact No.", value: student.companyContactNum },
      { label: "Company Email Address", value: student.companyEmail },
      
    ],

    "Interest and Recreational Activities": [
      { label: "Sports", value: student.sports },
      { label: "Hobbies", value: student.hobbies },
      { label: "Talents", value: student.talents },
      { label: "Socio-civic", value: student.socioCivic },
      { label: "Oragnizations Involved", value: student.orgInvolved },
    ],

    "Health": [
      { label: "Hospitalized", value: student.hospitalized },
      { label: "Reason", value: student.healthReason },
      { label: "Operation", value: student.healthOperation },
      { label: "Illness/Condition", value: student.healthConditions },
      { label: "Medical Certificate", value: student.medicalCertificate },
      { label: "Take Prescribed Drugs", value: student.prescribedDrugs },
      { label: "Hereditary Illness", value: student.hereditaryIllness },
      { label: "Last saw a Doctor", value: student.lastDoctor },
    ],

    "Life Circumstances": [
      { label: "Recent Loss", value: student.recentLoss },
      { label: "Current Concern", value: student.currentConcern },
    ],
  };

  const currentItems = categories[selectedCategory] || [];
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={studentInfoStyle.infoContainer}>
      {/* Top Right Action Buttons */}
      <div className={studentInfoStyle.actionBar}>
        <Button className={studentInfoStyle.editBTN}>Edit</Button>
        <Button className={studentInfoStyle.archiveBTN}>Archive</Button>
        <Button className={studentInfoStyle.closeBTN} onClick={onClose}>X</Button>
      </div>

      {/* Profile Header */}
      <div className={studentInfoStyle.profileHeader}>
        <img src={student.image} alt="Student" className={studentInfoStyle.profileImage} />
        <div className={studentInfoStyle.profileText}>
          <h3>{student.name}</h3>
          <p>{student.id}</p>
          <p>{student.program}</p>
        </div>
      </div>

      {/* Category Dropdown + View Cases */}
      <div className={studentInfoStyle.headerControls}>
        <select
          className={studentInfoStyle.headerDropdown}
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

        <Button className={studentInfoStyle.caseBTN}>View Cases</Button>
      </div>

      {/* Scrollable Area for Info */}
      <div className={studentInfoStyle.scrollableArea}>
        <div className={studentInfoStyle.studentInfoBlock}>
          <div className={`${studentInfoStyle.basicInfo} ${studentInfoStyle.fadeIn}`}>
            {visibleItems.map((item, idx) => (
              <div key={idx}>
                <span>{item.label}:</span> <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className={studentInfoStyle.paginationContainer}>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            className={`${studentInfoStyle.pageButton} ${
              currentPage === i + 1 ? studentInfoStyle.activePage : ""
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
