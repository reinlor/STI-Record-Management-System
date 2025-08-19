import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  User,
  Info,
  School,
  Users,
  Briefcase,
  Lightbulb,
  HeartPulse,
  Pencil,
  Lock,
  Phone,
  UserRound,
  Leaf,
} from 'lucide-react';

export default function ProfileView() {
  const studentId = "02000288488";
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Basic Information");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState([]);
  const [originalFormData, setOriginalFormData] = useState([]);

  // List of fields that should not be editable by the user.
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

  const categories = useMemo(() => {
    if (!student) return {};
    const iconClass = "w-5 h-5 mr-3 text-gray-700";
    return {
      "Basic Information": {
        icon: <Info className={iconClass} />,
        data: [
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
      },
      "Personal Information": {
        icon: <UserRound className={iconClass} />,
        data: [
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
      },
      "Contact Information": {
        icon: <Phone className={iconClass} />,
        data: [
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
      },
      "Family Background": {
        icon: <Users className={iconClass} />,
        data: [
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
      },
      "Educational Background": {
        icon: <School className={iconClass} />,
        data: [
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
      },
      "Work Experience": {
        icon: <Briefcase className={iconClass} />,
        data: [
          { label: "Name of Company/Institution", value: student.workExperience?.name || "", type: "text", path: "workExperience.name" },
          { label: "Duration (From-To)", value: student.workExperience?.duration || "", type: "text", path: "workExperience.duration" },
          { label: "Job Description", value: student.workExperience?.description || "", type: "text", path: "workExperience.description" },
          { label: "Company Contact No.", value: student.workExperience?.contactNo || "", type: "tel", path: "workExperience.contactNo" },
          { label: "Company Email Address", value: student.workExperience?.email || "", type: "email", path: "workExperience.email" },
        ],
      },
      "Interests and Recreational Activities": {
        icon: <Lightbulb className="w-5 h-5 mr-3 text-gray-700" />,
        data: [
          { label: "Sports", value: student.interests?.sports || "", type: "text", path: "interests.sports" },
          { label: "Hobbies", value: student.interests?.hobbies || "", type: "text", path: "interests.hobbies" },
          { label: "Talents", value: student.interests?.talents || "", type: "text", path: "interests.talents" },
          { label: "Socio-civic", value: student.interests?.socioCivic || "", type: "text", path: "interests.socioCivic" },
          { label: "Organizations Involved", value: student.interests?.organization || "", type: "text", path: "interests.organization" },
        ],
      },
      "Health": {
        icon: <HeartPulse className={iconClass} />,
        data: [
          { label: "Hospitalized", value: student.health?.hospitalized || "", type: "text", path: "health.hospitalized" },
          { label: "Reason", value: student.health?.reason || "", type: "text", path: "health.reason" },
          { label: "Operation", value: student.health?.operation || "", type: "text", path: "health.operation" },
          { label: "Illness/Condition", value: student.health?.illness || "", type: "text", path: "health.illness" },
          { label: "Medical Certificate", value: student.health?.medicalCert || "", type: "text", path: "health.medicalCert" },
          { label: "Take Prescribed Drugs", value: student.health?.prescribedDrug || "", type: "text", path: "health.prescribedDrug" },
          { label: "Hereditary Illness", value: student.health?.hereditary || "", type: "text", path: "health.hereditary" },
          { label: "Last saw a Doctor", value: student.health?.doctorLastSeen || "", type: "date", path: "health.doctorLastSeen" },
        ],
      },
      "Life Circumstances": {
        icon: <Leaf className={iconClass} />,
        data: [
          { label: "Recent Loss", value: student.lifeCircumstances?.recentLoss || "", type: "text", path: "lifeCircumstances.recentLoss" },
          { label: "Current Concern", value: student.lifeCircumstances?.currentConcern || "", type: "text", path: "lifeCircumstances.currentConcern" },
        ],
      },
    };
  }, [student]);

  useEffect(() => {
    if (categories[selectedCategory]) {
      setFormData(categories[selectedCategory].data.map(item => ({ ...item })));
      setOriginalFormData(categories[selectedCategory].data.map(item => ({ ...item })));
    } else {
      setFormData([]);
      setOriginalFormData([]);
    }
  }, [categories, selectedCategory]);

  const setNested = (obj, path, value) => {
    const keys = path.split(".");
    let temp = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!temp[keys[i]]) temp[keys[i]] = {};
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;
  };

  const handleSave = async () => {
    let updateObj = {};
    formData.forEach((item, idx) => {
      if (!lockedFields.includes(item.label)) {
        const original = originalFormData[idx]?.value;
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
      console.error("Failed to update student.", err);
    }
  };


  const handleCancelEdit = () => {
    setFormData(originalFormData.map(item => ({ ...item })));
    setIsEditing(false);
  };

  let content;
  if (loading) {
    content = <div className="p-6 text-center text-gray-700 text-lg">Loading...</div>;
  } else if (error) {
    content = <div className="p-6 text-center text-red-500 text-lg">{error}</div>;
  } else if (!student) {
    content = <div className="p-6 text-center text-gray-500 text-lg">No student data found.</div>;
  } else {
    const categoryData = categories[selectedCategory];
    const dataList = categoryData?.data || [];

    content = (
      <div className="flex-1 p-8 bg-white rounded-2xl shadow-lg overflow-y-auto transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{selectedCategory}</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-black font-semibold px-5 py-2 rounded-xl border border-[#FFCF3F] bg-[#FFCF3F] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 text-sm"
            >
              <Pencil className="w-4 h-4 mr-2" />
              <span>Edit</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {dataList.map((item, index) => {
            const isLocked = lockedFields.includes(item.label);
            return (
              <div key={index} className="space-y-1">
                <p className="text-gray-500 text-sm flex items-center font-medium">
                  {item.label}
                  {isLocked && <Lock className="w-3 h-3 text-gray-400 ml-1" />}
                </p>
                {isEditing && !isLocked ? (
                  <input
                    type={item.type}
                    value={formData.find(f => f.label === item.label)?.value || ''}
                    onChange={(e) => {
                      setFormData(prevFormData =>
                        prevFormData.map(f =>
                          f.label === item.label ? { ...f, value: e.target.value } : f
                        )
                      );
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFCF3F] text-base text-gray-800 transition-colors duration-200"
                  />
                ) : (
                  <p className={`font-semibold text-gray-900 text-base whitespace-pre-wrap ${isLocked ? 'text-gray-500' : ''}`}>
                    {item.value || 'N/A'}</p>
                )}
              </div>
            );
          })}
        </div>
        {isEditing && (
          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 px-6 py-2 rounded-xl text-sm shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#FFCF3F] font-semibold text-black px-6 py-2 rounded-xl text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFCF3F] focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen font-sans p-6 bg-gray-100 antialiased text-gray-900">
      <div className="w-64 min-w-[256px] p-6 bg-white rounded-2xl shadow-xl flex-shrink-0 mr-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Profile</h2>
        <hr className="my-4 border-gray-200" />
        <nav className="-mt-1">
          <ul className="space-y-2">
            {Object.keys(categories).map((categoryName) => (
              <li key={categoryName}>
                <button
                  onClick={() => {
                    setSelectedCategory(categoryName);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-medium flex items-center text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 ${
                    selectedCategory === categoryName
                      ? "bg-[#FFCF3F] text-black shadow-lg"
                      : "text-gray-700 hover:bg-gray-200 hover:text-black"
                  }`}
                >
                  {React.cloneElement(categories[categoryName].icon, {
                    className: `w-5 h-5 mr-3 transition-colors duration-200 ${
                      selectedCategory === categoryName ? "text-black" : "text-gray-600"
                    }`
                  })}
                  {categoryName}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex-1">
        {content}
      </div>
    </div>
  );
}