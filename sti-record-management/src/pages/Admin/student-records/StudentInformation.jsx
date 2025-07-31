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
      { label: "Name", value: student.studentProfile.name || "Can't Load"},
      { label: "ID", value: student.id || "Can't Load"},
      { label: "Email", value: student.contactInfo.email || "Can't Load"},
      { label: "Contact No", value: student.contactInfo.contactNo || "Can't Load"},
      { label: "Academic Level", value: student.studentProfile.academicLevel || "Can't Load"},
      { label: "Program", value: student.studentProfile.newProgram || "Can't Load"},
      { label: "Year Level", value: student.studentProfile.newLevel || "Can't Load"},
      { label: "Section", value: student.studentProfile.newSection || "Can't Load"},
      { label: "Gender", value: student.studentProfile.gender || "Can't Load"},
      { label: "Birth Date", value: student.studentProfile.birthday || "Can't Load"},
      { label: "Address", value: student.contactInfo.address.permanentAddress || "Can't Load"},
      { label: "Emergency Contact", value: student.familyBackground.emergency.name || "Can't Load"},
      { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo || "Can't Load"},
      { label: "Health Condition/s", value: student.health.illness || "Can't Load"},
    ],
    "Personal Information": [
      { label: "Full Name", value: student.studentProfile.name || "Can't Load"},
      { label: "Nickname", value: student.studentProfile.nickname || "Can't Load"},
      { label: "Student No.", value: student.id || "Can't Load"},
      { label: "Academic Level", value: student.studentProfile.academicLevel || "Can't Load"},
      { label: "Program", value: student.studentProfile.section || "Can't Load"},
      { label: "Year Level", value: student.studentProfile.section || "Can't Load"},
      { label: "Section", value: student.studentProfile.section || "Can't Load"},
      { label: "Gender", value: student.studentProfile.gender || "Can't Load"},
      { label: "Birth Date", value: student.studentProfile.birthday || "Can't Load"},
      { label: "Nationality", value: student.studentProfile.nationality || "Can't Load"},
      { label: "Religion", value: student.studentProfile.religion || "Can't Load"},
      { label: "Status", value: student.studentProfile.status || "Can't Load"},
    ],

    "Contact Information": [
      { label: "Mobile Phone No.", value: student.contactInfo.contactNo || "Can't Load"},
      { label: "Email Address", value: student.contactInfo.email || "Can't Load"},
      { label: "Home No.", value: student.contactInfo.homeNo || "Can't Load"},
      { label: "Present Address", value: student.contactInfo.address.currentAddress || "Can't Load"},
      { label: "Permanent Address", value: student.contactInfo.address.permanentAddress || "Can't Load"},
      { label: "Provincial Address", value: student.contactInfo.address.provincialAddress || "Can't Load"},
      { label: "Work No.", value: student.contactInfo.workNo || "Can't Load"},
      { label: "Emergency Contact", value: student.familyBackground.emergency.name || "Can't Load"},
      { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo || "Can't Load"},
    ],

    "Family Background": [
      { label: "Father's Name", value: student.familyBackground.fatherInfo.name || "Can't Load"},
      { label: "Father's Age", value: student.familyBackground.fatherInfo.age || "Can't Load"},
      { label: "Father's Birth Date", value: student.familyBackground.fatherInfo.birthday || "Can't Load"}, 
      { label: "Father's Nationality", value: student.familyBackground.fatherInfo.nationality || "Can't Load"},
      { label: "Father's Religion", value: student.familyBackground.fatherInfo.religion || "Can't Load"},
      { label: "Father's Educational Attainment", value: student.familyBackground.fatherInfo.educationalAttainment || "Can't Load"},
      { label: "Father's Occupation", value: student.familyBackground.fatherInfo.occupation || "Can't Load"},
      { label: "Father's Contact No.", value: student.familyBackground.fatherInfo.contactNo || "Can't Load"}, 
      { label: "Father's Email Address", value: student.familyBackground.fatherInfo.email || "Can't Load"}, 

      
      { label: "Mother's Name", value: student.familyBackground.motherInfo.name || "Can't Load"},
      { label: "Mother's Age", value: student.familyBackground.motherInfo.age || "Can't Load"},
      { label: "Mother's Birth Date", value: student.familyBackground.motherInfo.birthday || "Can't Load"}, 
      { label: "Mother's Nationality", value: student.familyBackground.motherInfo.nationality || "Can't Load"},
      { label: "Mother's Religion", value: student.familyBackground.motherInfo.religion || "Can't Load"},
      { label: "Mother's Educational Attainment", value: student.familyBackground.motherInfo.educationalAttainment || "Can't Load"},
      { label: "Mother's Occupation", value: student.familyBackground.motherInfo.occupation || "Can't Load"},
      { label: "Mother's Contact No.", value: student.familyBackground.motherInfo.contactNo || "Can't Load"},
      { label: "Mother's Email Address", value: student.familyBackground.motherInfo.email || "Can't Load"}, 
      
      { label: "Status of Parents", value: student.familyBackground.statusOfParent || "Can't Load"},
      { label: "Name of Guardian", value: student.familyBackground.guardian.name || "Can't Load"}, 
      { label: "Type of Relation with Guardian", value: student.familyBackground.guardian.relation || "Can't Load"}, 
      { label: "Guardian's Contact No.", value: student.familyBackground.guardian.contactNo || "Can't Load"}, 
      { label: "Guardian's Email Address", value: student.familyBackground.guardian.email || "Can't Load"}, 
      { label: "Parent/Guardian's Address", value: student.familyBackground.address || "Can't Load"},
      { label: "Siblings", value: student.familyBackground.siblings || "Can't Load"},
      { label: "Siblings Count", value: student.familyBackground.siblings.length || "Can't Load"},
      { label: "Birth Order", value: student.familyBackground.birthOrder || "Can't Load"}, 
    ],

    "Educational Background": [
      { label: "Name of Grade School", value: student.educationalBackground.elementary.schoolName || "Can't Load"},
      { label: "Years Attended (From-To)", value: student.educationalBackground.elementary.dateEnrolled || "Can't Load"},
      { label: "Name of Junior High School", value: student.educationalBackground.juniorHighSchool.schoolName || "Can't Load"},
      { label: "Years Attended (From-To)", value: student.educationalBackground.juniorHighSchool.dateEnrolled || "Can't Load"},
      { label: "Name of Senior High School", value: student.educationalBackground.seniorHighSchool.schoolName || "Can't Load"},
      { label: "Years Attended (From-To)", value: student.educationalBackground.juniorHighSchool.dateEnrolled || "Can't Load"},
      { label: "Name of College (For Transferees", value: student.educationalBackground.college.schoolName || "Can't Load"}, 
      { label: "Years Attended (From-To)", value: student.educationalBackground.college.dateEnrolled || "Can't Load"}, 
      { label: "Extra Curricular Activities from Previous School", value: student.educationalBackground.extraCurricular || "Can't Load"}, 
      { label: "Awards/Citations received", value: student.educationalBackground.awards || "Can't Load"}, 
      { label: "Most liked subject/s in school", value: student.educationalBackground.likedSubject || "Can't Load"}, 
      { label: "Least liked subject/s in school", value: student.educationalBackground.leastSubject || "Can't Load"}, 


    ],
    
    "Work Experience": [
      { label: "Name of Company/Institution", value: student.workExperience.name || "Can't Load"}, 
      { label: "Duration (From-To)", value: student.workExperience.duration || "Can't Load"}, 
      { label: "Job Description", value: student.workExperience.description || "Can't Load"},
      { label: "Company Contact No.", value: student.workExperience.contactNo || "Can't Load"},
      { label: "Company Email Address", value: student.workExperience.email || "Can't Load"}, 
      
    ],

    "Interest and Recreational Activities": [
      { label: "Sports", value: student.interests.sports || "Can't Load"},
      { label: "Hobbies", value: student.interests.hobbies || "Can't Load"}, 
      { label: "Talents", value: student.interests.talents || "Can't Load"}, 
      { label: "Socio-civic", value: student.interests.socioCivic || "Can't Load"},
      { label: "Oragnizations Involved", value: student.interests.organization || "Can't Load"},
    ],

    "Health": [
      { label: "Hospitalized", value: student.health.hospitalized || "Can't Load"},
      { label: "Reason", value: student.health.reason || "Can't Load"}, 
      { label: "Operation", value: student.health.operation || "Can't Load"},
      { label: "Illness/Condition", value: student.health.illness || "Can't Load"},
      { label: "Medical Certificate", value: student.health.medicalCert || "Can't Load"},
      { label: "Take Prescribed Drugs", value: student.health.prescribedDrug || "Can't Load"},
      { label: "Hereditary Illness", value: student.health.hereditary || "Can't Load"},
      { label: "Last saw a Doctor", value: student.health.doctorLastSeen || "Can't Load"},
    ],

    "Life Circumstances": [
      { label: "Recent Loss", value: student.lifeCircumstances.recentLoss || "Can't Load"},
      { label: "Current Concern", value: student.lifeCircumstances.currentConcern || "Can't Load"}, 
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
