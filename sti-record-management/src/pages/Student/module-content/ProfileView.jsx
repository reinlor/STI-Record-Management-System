import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileView() {
  const studentId = "02000288488";

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 7;
  const [selectedCategory, setSelectedCategory] = useState("Basic Information");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState([]);
  const [originalFormData, setOriginalFormData] = useState([]);

  // Locked fields (must match Backend and UI)
  const lockedFields = [
    "Student ID",
    "Full Name",
    "Permanent Address",
    "Emergency Contact",
    "Emergency Contact Number",
    "Birth Date",
    "Gender",
    "Program and Year/Section",
    "Academic Level",
    "Email",
    "Email Address"
  ];

  // Fetch student data
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/student/get/${studentId}`)
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch student data");
        setLoading(false);
      });
  }, [studentId]);

  // Categories (all fields have a `path` property)
  const categories = React.useMemo(() => {
    if (!student) return {};
    return {
      "Basic Information": [
        { label: "Full Name", value: student.studentProfile?.name || "", type: "text", path: "studentProfile.name" },
        { label: "Student ID", value: student.sid || "", type: "text", path: "sid" },
        { label: "Email", value: student.contactInfo?.email || "", type: "email", path: "contactInfo.email" },
        { label: "Contact No", value: student.contactInfo?.contactNo || "", type: "tel", path: "contactInfo.contactNo" },
        { label: "Academic Level", value: student.studentProfile?.academicLevel || "", type: "text", path: "studentProfile.academicLevel" },
        { label: "Program and Year/Section", value: student.studentProfile?.section || "", type: "text", path: "studentProfile.section" },
        { label: "Gender", value: student.studentProfile?.gender || "", type: "text", path: "studentProfile.gender" },
        { label: "Birth Date", value: student.studentProfile?.birthday || "", type: "date", path: "studentProfile.birthday" },
        { label: "Address", value: student.contactInfo?.address?.permanentAddress || "", type: "text", path: "contactInfo.address.permanentAddress" },
        { label: "Emergency Contact", value: student.familyBackground?.emergency?.name || "", type: "text", path: "familyBackground.emergency.name" },
        { label: "Emergency Contact Number", value: student.familyBackground?.emergency?.contactNo || "", type: "tel", path: "familyBackground.emergency.contactNo" },
        { label: "Health Condition/s", value: student.health?.illness || "", type: "text", path: "health.illness" },
      ],
      "Personal Information": [
        { label: "Full Name", value: student.studentProfile?.name || "", type: "text", path: "studentProfile.name" },
        { label: "Nickname", value: student.studentProfile?.nickname || "", type: "text", path: "studentProfile.nickname" },
        { label: "Student ID", value: student.sid || "", type: "text", path: "sid" },
        { label: "Academic Level", value: student.studentProfile?.academicLevel || "", type: "text", path: "studentProfile.academicLevel" },
        { label: "Program and Year/Section", value: student.studentProfile?.section || "", type: "text", path: "studentProfile.section" },
        { label: "Gender", value: student.studentProfile?.gender || "", type: "text", path: "studentProfile.gender" },
        { label: "Birth Date", value: student.studentProfile?.birthday || "", type: "date", path: "studentProfile.birthday" },
        { label: "Nationality", value: student.studentProfile?.nationality || "", type: "text", path: "studentProfile.nationality" },
        { label: "Religion", value: student.studentProfile?.religion || "", type: "text", path: "studentProfile.religion" },
        { label: "Status", value: student.studentProfile?.status || "", type: "text", path: "studentProfile.status" },
      ],
      "Contact Information": [
        { label: "Mobile Phone No.", value: student.contactInfo?.contactNo || "", type: "tel", path: "contactInfo.contactNo" },
        { label: "Email Address", value: student.contactInfo?.email || "", type: "email", path: "contactInfo.email" },
        { label: "Home No.", value: student.contactInfo?.homeNo || "", type: "tel", path: "contactInfo.homeNo" },
        { label: "Present Address", value: student.contactInfo?.address?.currentAddress || "", type: "text", path: "contactInfo.address.currentAddress" },
        { label: "Permanent Address", value: student.contactInfo?.address?.permanentAddress || "", type: "text", path: "contactInfo.address.permanentAddress" },
        { label: "Provincial Address", value: student.contactInfo?.address?.provincialAddress || "", type: "text", path: "contactInfo.address.provincialAddress" },
        { label: "Work No.", value: student.contactInfo?.workNo || "", type: "tel", path: "contactInfo.workNo" },
        { label: "Emergency Contact", value: student.familyBackground?.emergency?.name || "", type: "text", path: "familyBackground.emergency.name" },
        { label: "Emergency Contact Number", value: student.familyBackground?.emergency?.contactNo || "", type: "tel", path: "familyBackground.emergency.contactNo" },
      ],
      "Family Background": [
        { label: "Father's Name", value: student.familyBackground?.fatherInfo?.name || "", type: "text", path: "familyBackground.fatherInfo.name" },
        { label: "Father's Age", value: student.familyBackground?.fatherInfo?.age || "", type: "number", path: "familyBackground.fatherInfo.age" },
        { label: "Father's Birth Date", value: student.familyBackground?.fatherInfo?.birthday || "", type: "date", path: "familyBackground.fatherInfo.birthday" },
        { label: "Father's Nationality", value: student.familyBackground?.fatherInfo?.nationality || "", type: "text", path: "familyBackground.fatherInfo.nationality" },
        { label: "Father's Religion", value: student.familyBackground?.fatherInfo?.religion || "", type: "text", path: "familyBackground.fatherInfo.religion" },
        { label: "Father's Educational Attainment", value: student.familyBackground?.fatherInfo?.educationalAttainment || "", type: "text", path: "familyBackground.fatherInfo.educationalAttainment" },
        { label: "Father's Occupation", value: student.familyBackground?.fatherInfo?.occupation || "", type: "text", path: "familyBackground.fatherInfo.occupation" },
        { label: "Father's Contact No.", value: student.familyBackground?.fatherInfo?.contactNo || "", type: "tel", path: "familyBackground.fatherInfo.contactNo" },
        { label: "Father's Email Address", value: student.familyBackground?.fatherInfo?.email || "", type: "email", path: "familyBackground.fatherInfo.email" },
        { label: "Mother's Name", value: student.familyBackground?.motherInfo?.name || "", type: "text", path: "familyBackground.motherInfo.name" },
        { label: "Mother's Age", value: student.familyBackground?.motherInfo?.age || "", type: "number", path: "familyBackground.motherInfo.age" },
        { label: "Mother's Birth Date", value: student.familyBackground?.motherInfo?.birthday || "", type: "date", path: "familyBackground.motherInfo.birthday" },
        { label: "Mother's Nationality", value: student.familyBackground?.motherInfo?.nationality || "", type: "text", path: "familyBackground.motherInfo.nationality" },
        { label: "Mother's Religion", value: student.familyBackground?.motherInfo?.religion || "", type: "text", path: "familyBackground.motherInfo.religion" },
        { label: "Mother's Educational Attainment", value: student.familyBackground?.motherInfo?.educationalAttainment || "", type: "text", path: "familyBackground.motherInfo.educationalAttainment" },
        { label: "Mother's Occupation", value: student.familyBackground?.motherInfo?.occupation || "", type: "text", path: "familyBackground.motherInfo.occupation" },
        { label: "Mother's Contact No.", value: student.familyBackground?.motherInfo?.contactNo || "", type: "tel", path: "familyBackground.motherInfo.contactNo" },
        { label: "Mother's Email Address", value: student.familyBackground?.motherInfo?.email || "", type: "email", path: "familyBackground.motherInfo.email" },
        { label: "Status of Parents", value: student.familyBackground?.statusOfParent || "", type: "text", path: "familyBackground.statusOfParent" },
        { label: "Name of Guardian", value: student.familyBackground?.guardian?.name || "", type: "text", path: "familyBackground.guardian.name" },
        { label: "Type of Relation with Guardian", value: student.familyBackground?.guardian?.relation || "", type: "text", path: "familyBackground.guardian.relation" },
        { label: "Guardian's Contact No.", value: student.familyBackground?.guardian?.contactNo || "", type: "tel", path: "familyBackground.guardian.contactNo" },
        { label: "Guardian's Email Address", value: student.familyBackground?.guardian?.email || "", type: "email", path: "familyBackground.guardian.email" },
        { label: "Parent/Guardian's Address", value: student.familyBackground?.address || "", type: "text", path: "familyBackground.address" },
        { label: "Siblings", value: (student.familyBackground?.siblings || []).join(", "), type: "text", path: "familyBackground.siblings" },
        { label: "Siblings Count", value: (student.familyBackground?.siblings || []).length || 0, type: "number", path: "familyBackground.siblingsCount" },
        { label: "Birth Order", value: student.familyBackground?.birthOrder || "", type: "text", path: "familyBackground.birthOrder" },
      ],
      "Educational Background": [
        { label: "Name of Grade School", value: student.educationalBackground?.elementary?.schoolName || "", type: "text", path: "educationalBackground.elementary.schoolName" },
        { label: "Years Attended (From-To)", value: student.educationalBackground?.elementary?.dateEnrolled || "", type: "text", path: "educationalBackground.elementary.dateEnrolled" },
        { label: "Name of Junior High School", value: student.educationalBackground?.juniorHighSchool?.schoolName || "", type: "text", path: "educationalBackground.juniorHighSchool.schoolName" },
        { label: "Years Attended (From-To)", value: student.educationalBackground?.juniorHighSchool?.dateEnrolled || "", type: "text", path: "educationalBackground.juniorHighSchool.dateEnrolled" },
        { label: "Name of Senior High School", value: student.educationalBackground?.seniorHighSchool?.schoolName || "", type: "text", path: "educationalBackground.seniorHighSchool.schoolName" },
        { label: "Years Attended (From-To)", value: student.educationalBackground?.seniorHighSchool?.dateEnrolled || "", type: "text", path: "educationalBackground.seniorHighSchool.dateEnrolled" },
        { label: "Name of College (For Transferees)", value: student.educationalBackground?.college?.schoolName || "", type: "text", path: "educationalBackground.college.schoolName" },
        { label: "Years Attended (From-To)", value: student.educationalBackground?.college?.dateEnrolled || "", type: "text", path: "educationalBackground.college.dateEnrolled" },
        { label: "Extra Curricular Activities from Previous School", value: student.educationalBackground?.extraCurricular || "", type: "text", path: "educationalBackground.extraCurricular" },
        { label: "Awards/Citations received", value: student.educationalBackground?.awards || "", type: "text", path: "educationalBackground.awards" },
        { label: "Most liked subject/s in school", value: student.educationalBackground?.likedSubject || "", type: "text", path: "educationalBackground.likedSubject" },
        { label: "Least liked subject/s in school", value: student.educationalBackground?.leastSubject || "", type: "text", path: "educationalBackground.leastSubject" },
      ],
      "Work Experience": [
        { label: "Name of Company/Institution", value: student.workExperience?.name || "", type: "text", path: "workExperience.name" },
        { label: "Duration (From-To)", value: student.workExperience?.duration || "", type: "text", path: "workExperience.duration" },
        { label: "Job Description", value: student.workExperience?.description || "", type: "text", path: "workExperience.description" },
        { label: "Company Contact No.", value: student.workExperience?.contactNo || "", type: "tel", path: "workExperience.contactNo" },
        { label: "Company Email Address", value: student.workExperience?.email || "", type: "email", path: "workExperience.email" },
      ],
      "Interest and Recreational Activities": [
        { label: "Sports", value: student.interests?.sports || "", type: "text", path: "interests.sports" },
        { label: "Hobbies", value: student.interests?.hobbies || "", type: "text", path: "interests.hobbies" },
        { label: "Talents", value: student.interests?.talents || "", type: "text", path: "interests.talents" },
        { label: "Socio-civic", value: student.interests?.socioCivic || "", type: "text", path: "interests.socioCivic" },
        { label: "Organizations Involved", value: student.interests?.organization || "", type: "text", path: "interests.organization" },
      ],
      "Health": [
        { label: "Hospitalized", value: student.health?.hospitalized || "", type: "text", path: "health.hospitalized" },
        { label: "Reason", value: student.health?.reason || "", type: "text", path: "health.reason" },
        { label: "Operation", value: student.health?.operation || "", type: "text", path: "health.operation" },
        { label: "Illness/Condition", value: student.health?.illness || "", type: "text", path: "health.illness" },
        { label: "Medical Certificate", value: student.health?.medicalCert || "", type: "text", path: "health.medicalCert" },
        { label: "Take Prescribed Drugs", value: student.health?.prescribedDrug || "", type: "text", path: "health.prescribedDrug" },
        { label: "Hereditary Illness", value: student.health?.hereditary || "", type: "text", path: "health.hereditary" },
        { label: "Last saw a Doctor", value: student.health?.doctorLastSeen || "", type: "date", path: "health.doctorLastSeen" },
      ],
      "Life Circumstances": [
        { label: "Recent Loss", value: student.lifeCircumstances?.recentLoss || "", type: "text", path: "lifeCircumstances.recentLoss" },
        { label: "Current Concern", value: student.lifeCircumstances?.currentConcern || "", type: "text", path: "lifeCircumstances.currentConcern" },
      ],
    };
  }, [student]);

  // Update formData and originalFormData when student or selectedCategory changes
  useEffect(() => {
    if (categories[selectedCategory]) {
      setFormData(categories[selectedCategory].map(item => ({ ...item })));
      setOriginalFormData(categories[selectedCategory].map(item => ({ ...item })));
    } else {
      setFormData([]);
      setOriginalFormData([]);
    }
    setCurrentPage(1);
  }, [categories, selectedCategory]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!student) return <div>No student data found.</div>;

  const currentItems = formData || [];
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

  const inputClasses =
    "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleChange = (index, value) => {
    const updated = [...formData];
    updated[index].value = value;
    setFormData(updated);
  };

  // Helper to set nested value by path
  function setNested(obj, path, value) {
    const keys = path.split(".");
    let temp = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!temp[keys[i]]) temp[keys[i]] = {};
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;
  }

  // Save handler: only send changed, non-locked fields
  const handleSave = async () => {
    let updateObj = {};
    formData.forEach((item, idx) => {
      if (!lockedFields.includes(item.label)) {
        let original = originalFormData[idx]?.value;
        if (item.value !== original) {
          setNested(updateObj, item.path, item.value);
        }
      }
    });

    if (Object.keys(updateObj).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await axios.put(`/student/update/${studentId}`, updateObj);
      const res = await axios.get(`/student/get/${studentId}`);
      setStudent(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update student.");
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalFormData.map(item => ({ ...item })));
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in min-h-screen flex flex-col items-center pt-4 font-sans">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
          Profile
        </h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {student.studentProfile?.name || student.name || ""}
          </h3>
          <p className="text-sm text-gray-700">{student.sid}</p>
          <p className="text-sm text-gray-700">
            {student.program || student.studentProfile?.section || ""}
          </p>
        </div>

        {/* Category Dropdown */}
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit
            </button>
          )}
        </div>

        {/* Info Fields with Pagination */}
        <div className="space-y-3">
          {visibleItems.map((item, idx) => {
            const isLocked = lockedFields.includes(item.label);
            return (
              <div
                key={idx}
                className="flex flex-col bg-gray-50 p-3 rounded shadow-sm"
              >
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  {item.label}
                </label>
                {isEditing && !isLocked ? (
                  <input
                    type={item.type}
                    value={item.value}
                    onChange={(e) =>
                      handleChange(startIndex + idx, e.target.value)
                    }
                    className={inputClasses}
                  />
                ) : (
                  <p className="text-sm text-gray-800">{item.value}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Save and Cancel Buttons (Edit Mode Only) */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 font-bold text-white px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-red-500 hover:bg-red-600 font-bold text-white px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}