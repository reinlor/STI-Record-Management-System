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
      { label: "Name", value: student.studentProfile.name },
      { label: "ID", value: student.id },
      { label: "Email", value: student.contactInfo.email },
      { label: "Contact No", value: student.contactInfo.contactNo },
      { label: "Academic Level", value: student.studentProfile.academicLevel },
      { label: "Program", value: student.studentProfile.section },
      { label: "Year Level", value: student.studentProfile.section },
      { label: "Section", value: student.studentProfile.section },
      { label: "Gender", value: student.studentProfile.gender },
      { label: "Birth Date", value: student.studentProfile.birthday },
      { label: "Address", value: student.contactInfo.address.permanentAddress },
      { label: "Emergency Contact", value: student.familyBackground.emergency.name },
      { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo },
      { label: "Health Condition/s", value: student.health.illness },
    ],
    "Personal Information": [
      { label: "Full Name", value: student.studentProfile.name },
      { label: "Nickname", value: student.studentProfile.nickname },
      { label: "Student No.", value: student.id },
      { label: "Academic Level", value: student.studentProfile.academicLevel },
      { label: "Program", value: student.studentProfile.section },
      { label: "Year Level", value: student.studentProfile.section },
      { label: "Section", value: student.studentProfile.section },
      { label: "Gender", value: student.studentProfile.gender },
      { label: "Birth Date", value: student.studentProfile.birthday },
      { label: "Nationality", value: student.studentProfile.nationality },
      { label: "Religion", value: student.studentProfile.religion },
      { label: "Status", value: student.studentProfile.status },
    ],

    "Contact Information": [
      { label: "Mobile Phone No.", value: student.contactInfo.contactNo },
      { label: "Email Address", value: student.contactInfo.email },
      { label: "Home No.", value: student.contactInfo.homeNo },
      { label: "Present Address", value: student.contactInfo.address.currentAddress },
      { label: "Permanent Address", value: student.contactInfo.address.permanentAddress },
      { label: "Provincial Address", value: student.contactInfo.address.provincialAddress },
      { label: "Work No.", value: student.contactInfo.workNo },
      { label: "Emergency Contact", value: student.familyBackground.emergency.name },
      { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo },
    ],

    "Family Background": [
      { label: "Father's Name", value: student.familyBackground.fatherInfo.name },
      { label: "Father's Age", value: student.familyBackground.fatherInfo.age },
      { label: "Father's Birth Date", value: student.familyBackground.fatherInfo.birthday }, 
      { label: "Father's Nationality", value: student.familyBackground.fatherInfo.nationality },
      { label: "Father's Religion", value: student.familyBackground.fatherInfo.religion },
      { label: "Father's Educational Attainment", value: student.familyBackground.fatherInfo.educationalAttainment },
      { label: "Father's Occupation", value: student.familyBackground.fatherInfo.occupation },
      { label: "Father's Contact No.", value: student.familyBackground.fatherInfo.contactNo }, 
      { label: "Father's Email Address", value: student.familyBackground.fatherInfo.email }, 

      
      { label: "Mother's Name", value: student.familyBackground.motherInfo.name },
      { label: "Mother's Age", value: student.familyBackground.motherInfo.age },
      { label: "Mother's Birth Date", value: student.familyBackground.motherInfo.birthday }, 
      { label: "Mother's Nationality", value: student.familyBackground.motherInfo.nationality },
      { label: "Mother's Religion", value: student.familyBackground.motherInfo.religion },
      { label: "Mother's Educational Attainment", value: student.familyBackground.motherInfo.educationalAttainment },
      { label: "Mother's Occupation", value: student.familyBackground.motherInfo.occupation },
      { label: "Mother's Contact No.", value: student.familyBackground.motherInfo.contactNo },
      { label: "Mother's Email Address", value: student.familyBackground.motherInfo.email }, 
      
      { label: "Status of Parents", value: student.familyBackground.statusOfParent },
      { label: "Name of Guardian", value: student.familyBackground.guardian.name || ''}, 
      { label: "Type of Relation with Guardian", value: student.familyBackground.guardian.relation }, 
      { label: "Guardian's Contact No.", value: student.familyBackground.guardian.contactNo }, 
      { label: "Guardian's Email Address", value: student.familyBackground.guardian.email }, 
      { label: "Parent/Guardian's Address", value: student.familyBackground.address },
      { label: "Siblings", value: student.familyBackground.siblings },
      { label: "Siblings Count", value: student.familyBackground.siblings.length },
      { label: "Birth Order", value: student.familyBackground.birthOrder}, 
    ],

    "Educational Background": [
      { label: "Name of Grade School", value: student.educationalBackground.elementary.schoolName },
      { label: "Years Attended (From-To)", value: student.educationalBackground.elementary.dateEnrolled },
      { label: "Name of Junior High School", value: student.educationalBackground.juniorHighSchool.schoolName },
      { label: "Years Attended (From-To)", value: student.educationalBackground.juniorHighSchool.dateEnrolled },
      { label: "Name of Senior High School", value: student.educationalBackground.seniorHighSchool.schoolName },
      { label: "Years Attended (From-To)", value: student.educationalBackground.juniorHighSchool.dateEnrolled },
      { label: "Name of College (For Transferees", value: student.educationalBackground.college.schoolName }, 
      { label: "Years Attended (From-To)", value: student.educationalBackground.college.dateEnrolled }, 
      { label: "Extra Curricular Activities from Previous School", value: student.educationalBackground.extraCurricular }, 
      { label: "Awards/Citations received", value: student.educationalBackground.awards }, 
      { label: "Most liked subject/s in school", value: student.educationalBackground.likedSubject }, 
      { label: "Least liked subject/s in school", value: student.educationalBackground.leastSubject }, 


    ],
    
    "Work Experience": [
      { label: "Name of Company/Institution", value: student.workExperience.name }, 
      { label: "Duration (From-To)", value: student.workExperience.duration }, 
      { label: "Job Description", value: student.workExperience.description },
      { label: "Company Contact No.", value: student.workExperience.contactNo },
      { label: "Company Email Address", value: student.workExperience.email }, 
      
    ],

    "Interest and Recreational Activities": [
      { label: "Sports", value: student.interests.sports },
      { label: "Hobbies", value: student.interests.hobbies }, 
      { label: "Talents", value: student.interests.talents }, 
      { label: "Socio-civic", value: student.interests.socioCivic },
      { label: "Oragnizations Involved", value: student.interests.organization },
    ],

    "Health": [
      { label: "Hospitalized", value: student.health.hospitalized },
      { label: "Reason", value: student.health.reason }, 
      { label: "Operation", value: student.health.operation },
      { label: "Illness/Condition", value: student.health.illness },
      { label: "Medical Certificate", value: student.health.medicalCert },
      { label: "Take Prescribed Drugs", value: student.health.prescribedDrug },
      { label: "Hereditary Illness", value: student.health.hereditary },
      { label: "Last saw a Doctor", value: student.health.doctorLastSeen },
    ],

    "Life Circumstances": [
      { label: "Recent Loss", value: student.lifeCircumstances.recentLoss },
      { label: "Current Concern", value: student.lifeCircumstances.currentConcern }, 
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
