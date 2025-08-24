import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
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
  Home,
  Star,
  BookOpen,
} from "lucide-react";

export default function ProfileView() {
  const studentId = "02000288488";
  const [student, setStudent] = useState(null); // Holds the student data object
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [error, setError] = useState(null); // Error state for data fetch
  const [selectedCategory, setSelectedCategory] = useState("Basic Information"); // Currently selected profile category/tab
  const [isEditing, setIsEditing] = useState(false); // Edit mode toggle
  const [formData, setFormData] = useState([]); // Editable form data for the current category
  const [originalFormData, setOriginalFormData] = useState([]); // Backup of original data for canceling edits

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
    "Email Address",
  ];

  // Fetch student data from the API using axios
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/student/get/${studentId}`);
        setStudent(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
        setError(
          "Failed to load student data. Please check the network connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  // Memoize the categories object to avoid unnecessary recalculations.
  // Each category contains its icon, data fields, and optional subsections.
  const categories = useMemo(() => {
    if (!student) return {};
    const iconClass = "w-5 h-5 mr-3 text-gray-700";
    return {
      "Basic Information": {
        icon: <Info className={iconClass} />,
        data: [
          {
            label: "Full Name",
            value: student.studentProfile?.name || "",
            type: "text",
            path: "studentProfile.name",
          },
          {
            label: "Student ID",
            value: student.sid || "",
            type: "text",
            path: "sid",
          },
          {
            label: "Email",
            value: student.contactInfo?.email || "",
            type: "email",
            path: "contactInfo.email",
          },
          {
            label: "Contact No",
            value: student.contactInfo?.contactNo || "",
            type: "tel",
            path: "contactInfo.contactNo",
          },
          {
            label: "Academic Level",
            value: student.studentProfile?.academicLevel || "",
            type: "text",
            path: "studentProfile.academicLevel",
          },
          {
            label: "Program and Year/Section",
            value:
              `${student.studentProfile?.program} ${student.studentProfile?.section}` ||
              "",
            type: "text",
            path: "studentProfile.section",
          },
          {
            label: "Gender",
            value: student.studentProfile?.gender || "",
            type: "text",
            path: "studentProfile.gender",
          },
          {
            label: "Birth Date",
            value: student.studentProfile?.birthday || "",
            type: "date",
            path: "studentProfile.birthday",
          },
          {
            label: "Address",
            value: student.contactInfo?.address?.permanentAddress || "",
            type: "text",
            path: "contactInfo.address.permanentAddress",
          },
          {
            label: "Emergency Contact",
            value: student.familyBackground?.emergency?.name || "",
            type: "text",
            path: "familyBackground.emergency.name",
          },
          {
            label: "Emergency Contact Number",
            value: student.familyBackground?.emergency?.contactNo || "",
            type: "tel",
            path: "familyBackground.emergency.contactNo",
          },
          {
            label: "Health Condition/s",
            value: student.health?.illness || "",
            type: "text",
            path: "health.illness",
          },
        ],
      },
      "Personal Information": {
        icon: <UserRound className={iconClass} />,
        data: [
          {
            label: "Full Name",
            value: student.studentProfile?.name || "",
            type: "text",
            path: "studentProfile.name",
          },
          {
            label: "Nickname",
            value: student.studentProfile?.nickname || "",
            type: "text",
            path: "studentProfile.nickname",
          },
          {
            label: "Student ID",
            value: student.sid || "",
            type: "text",
            path: "sid",
          },
          {
            label: "Academic Level",
            value: student.studentProfile?.academicLevel || "",
            type: "text",
            path: "studentProfile.academicLevel",
          },
          {
            label: "Program and Year/Section",
            value:
              `${student.studentProfile?.program} ${student.studentProfile?.section}` ||
              "",
            type: "text",
            path: "studentProfile.section",
          },
          {
            label: "Gender",
            value: student.studentProfile?.gender || "",
            type: "text",
            path: "studentProfile.gender",
          },
          {
            label: "Date of Birth",
            value: student.studentProfile?.birthday || "",
            type: "date",
            path: "studentProfile.birthday",
          },
          {
            label: "Nationality",
            value: student.studentProfile?.nationality || "",
            type: "text",
            path: "studentProfile.nationality",
          },
          {
            label: "Religion",
            value: student.studentProfile?.religion || "",
            type: "text",
            path: "studentProfile.religion",
          },
          {
            label: "Status",
            value: student.studentProfile?.status || "",
            type: "text",
            path: "studentProfile.status",
          },
        ],
      },
      "Contact Information": {
        icon: <Phone className={iconClass} />,
        data: [
          {
            label: "Mobile Number",
            value: student.contactInfo?.contactNo || "",
            type: "tel",
            path: "contactInfo.contactNo",
          },
          {
            label: "Email Address",
            value: student.contactInfo?.email || "",
            type: "email",
            path: "contactInfo.email",
          },
          {
            label: "Home Number",
            value: student.contactInfo?.homeNo || "",
            type: "tel",
            path: "contactInfo.homeNo",
          },
          {
            label: "Current Address",
            value: student.contactInfo?.address?.currentAddress || "",
            type: "text",
            path: "contactInfo.address.currentAddress",
          },
          {
            label: "Permanent Address",
            value: student.contactInfo?.address?.permanentAddress || "",
            type: "text",
            path: "contactInfo.address.permanentAddress",
          },
          {
            label: "Provincial Address",
            value: student.contactInfo?.address?.provincialAddress || "",
            type: "text",
            path: "contactInfo.address.provincialAddress",
          },
          {
            label: "Work Number",
            value: student.contactInfo?.workNo || "",
            type: "tel",
            path: "contactInfo.workNo",
          },
          {
            label: "Emergency Contact",
            value: student.familyBackground?.emergency?.name || "",
            type: "text",
            path: "familyBackground.emergency.name",
          },
          {
            label: "Emergency Contact Number",
            value: student.familyBackground?.emergency?.contactNo || "",
            type: "tel",
            path: "familyBackground.emergency.contactNo",
          },
        ],
      },
      "Family Background": {
        icon: <Users className={iconClass} />,
        data: [
          {
            label: "Parents' Status",
            value: student.familyBackground?.statusOfParent || "",
            type: "text",
            path: "familyBackground.statusOfParent",
          },
          {
            label: "Parents'/Guardian's Address",
            value: student.familyBackground?.address || "",
            type: "text",
            path: "familyBackground.address",
          },
          {
            label: "Number of Siblings",
            value: (student.familyBackground?.siblings || []).length || 0,
            type: "number",
            path: "familyBackground.siblingsCount",
          },
          {
            label: "Birth Order",
            value: student.familyBackground?.birthOrder || "",
            type: "text",
            path: "familyBackground.birthOrder",
          },
          {
            label: "Siblings",
            value: (student.familyBackground?.siblings || []).join(", "),
            type: "text",
            path: "familyBackground.siblings",
          },
        ],
        subsections: [
          {
            title: "Father's Information",
            fields: [
              {
                label: "Name",
                value: student.familyBackground?.fatherInfo?.name || "",
                type: "text",
                path: "familyBackground.fatherInfo.name",
              },
              {
                label: "Age",
                value: student.familyBackground?.fatherInfo?.age || "",
                type: "number",
                path: "familyBackground.fatherInfo.age",
              },
              {
                label: "Date of Birth",
                value: student.familyBackground?.fatherInfo?.birthday || "",
                type: "date",
                path: "familyBackground.fatherInfo.birthday",
              },
              {
                label: "Nationality",
                value: student.familyBackground?.fatherInfo?.nationality || "",
                type: "text",
                path: "familyBackground.fatherInfo.nationality",
              },
              {
                label: "Religion",
                value: student.familyBackground?.fatherInfo?.religion || "",
                type: "text",
                path: "familyBackground.fatherInfo.religion",
              },
              {
                label: "Educational Attainment",
                value:
                  student.familyBackground?.fatherInfo?.educationalAttainment ||
                  "",
                type: "text",
                path: "familyBackground.fatherInfo.educationalAttainment",
              },
              {
                label: "Occupation",
                value: student.familyBackground?.fatherInfo?.occupation || "",
                type: "text",
                path: "familyBackground.fatherInfo.occupation",
              },
              {
                label: "Contact No",
                value: student.familyBackground?.fatherInfo?.contactNo || "",
                type: "tel",
                path: "familyBackground.fatherInfo.contactNo",
              },
              {
                label: "Email Address",
                value: student.familyBackground?.fatherInfo?.email || "",
                type: "email",
                path: "familyBackground.fatherInfo.email",
              },
            ],
          },
          {
            title: "Mother's Information",
            fields: [
              {
                label: "Name",
                value: student.familyBackground?.motherInfo?.name || "",
                type: "text",
                path: "familyBackground.motherInfo.name",
              },
              {
                label: "Age",
                value: student.familyBackground?.motherInfo?.age || "",
                type: "number",
                path: "familyBackground.motherInfo.age",
              },
              {
                label: "Date of Birth",
                value: student.familyBackground?.motherInfo?.birthday || "",
                type: "date",
                path: "familyBackground.motherInfo.birthday",
              },
              {
                label: "Nationality",
                value: student.familyBackground?.motherInfo?.nationality || "",
                type: "text",
                path: "familyBackground.motherInfo.nationality",
              },
              {
                label: "Religion",
                value: student.familyBackground?.motherInfo?.religion || "",
                type: "text",
                path: "familyBackground.motherInfo.religion",
              },
              {
                label: "Educational Attainment",
                value:
                  student.familyBackground?.motherInfo?.educationalAttainment ||
                  "",
                type: "text",
                path: "familyBackground.motherInfo.educationalAttainment",
              },
              {
                label: "Occupation",
                value: student.familyBackground?.motherInfo?.occupation || "",
                type: "text",
                path: "familyBackground.motherInfo.occupation",
              },
              {
                label: "Contact No",
                value: student.familyBackground?.motherInfo?.contactNo || "",
                type: "tel",
                path: "familyBackground.motherInfo.contactNo",
              },
              {
                label: "Email Address",
                value: student.familyBackground?.motherInfo?.email || "",
                type: "email",
                path: "familyBackground.motherInfo.email",
              },
            ],
          },
          {
            title: "Guardian's Information",
            fields: [
              {
                label: "Name",
                value: student.familyBackground?.guardian?.name || "",
                type: "text",
                path: "familyBackground.guardian.name",
              },
              {
                label: "Relation",
                value: student.familyBackground?.guardian?.relation || "",
                type: "text",
                path: "familyBackground.guardian.relation",
              },
              {
                label: "Contact No",
                value: student.familyBackground?.guardian?.contactNo || "",
                type: "tel",
                path: "familyBackground.guardian.contactNo",
              },
              {
                label: "Email Address",
                value: student.familyBackground?.guardian?.email || "",
                type: "email",
                path: "familyBackground.guardian.email",
              },
            ],
          },
        ],
      },
      "Educational Background": {
        icon: <School className={iconClass} />,
        data: [
          {
            label: "Extra Curricular Activities",
            value: student.educationalBackground?.extraCurricular || "",
            type: "text",
            path: "educationalBackground.extraCurricular",
          },
          {
            label: "Awards",
            value: student.educationalBackground?.awards || "",
            type: "text",
            path: "educationalBackground.awards",
          },
          {
            label: "Favorite Subject",
            value: student.educationalBackground?.likedSubject || "",
            type: "text",
            path: "educationalBackground.likedSubject",
          },
          {
            label: "Least Favorite Subject",
            value: student.educationalBackground?.leastSubject || "",
            type: "text",
            path: "educationalBackground.leastSubject",
          },
        ],
        subsections: [
          {
            title: "Elementary",
            fields: [
              {
                label: "School Name",
                value:
                  student.educationalBackground?.elementary?.schoolName || "",
                type: "text",
                path: "educationalBackground.elementary.schoolName",
              },
              {
                label: "Date Enrolled",
                value:
                  student.educationalBackground?.elementary?.dateEnrolled || "",
                type: "text",
                path: "educationalBackground.elementary.dateEnrolled",
              },
            ],
          },
          {
            title: "Junior High School",
            fields: [
              {
                label: "School Name",
                value:
                  student.educationalBackground?.juniorHighSchool?.schoolName ||
                  "",
                type: "text",
                path: "educationalBackground.juniorHighSchool.schoolName",
              },
              {
                label: "Date Enrolled",
                value:
                  student.educationalBackground?.juniorHighSchool
                    ?.dateEnrolled || "",
                type: "text",
                path: "educationalBackground.juniorHighSchool.dateEnrolled",
              },
            ],
          },
          {
            title: "Senior High School",
            fields: [
              {
                label: "School Name",
                value:
                  student.educationalBackground?.seniorHighSchool?.schoolName ||
                  "",
                type: "text",
                path: "educationalBackground.seniorHighSchool.schoolName",
              },
              {
                label: "Date Enrolled",
                value:
                  student.educationalBackground?.seniorHighSchool
                    ?.dateEnrolled || "",
                type: "text",
                path: "educationalBackground.seniorHighSchool.dateEnrolled",
              },
            ],
          },
          {
            title: "College (for Transferees)",
            fields: [
              {
                label: "School Name",
                value: student.educationalBackground?.college?.schoolName || "",
                type: "text",
                path: "educationalBackground.college.schoolName",
              },
              {
                label: "Date Enrolled",
                value:
                  student.educationalBackground?.college?.dateEnrolled || "",
                type: "text",
                path: "educationalBackground.college.dateEnrolled",
              },
            ],
          },
        ],
      },
      "Work Experience": {
        icon: <Briefcase className={iconClass} />,
        data: [
          {
            label: "Company/Institution",
            value: student.workExperience?.name || "",
            type: "text",
            path: "workExperience.name",
          },
          {
            label: "Duration",
            value: student.workExperience?.duration || "",
            type: "text",
            path: "workExperience.duration",
          },
          {
            label: "Job Description",
            value: student.workExperience?.description || "",
            type: "text",
            path: "workExperience.description",
          },
          {
            label: "Company Contact No",
            value: student.workExperience?.contactNo || "",
            type: "tel",
            path: "workExperience.contactNo",
          },
          {
            label: "Company Email",
            value: student.workExperience?.email || "",
            type: "email",
            path: "workExperience.email",
          },
        ],
      },
      "Interests and Hobbies": {
        icon: <Lightbulb className="w-5 h-5 mr-3 text-gray-700" />,
        data: [
          {
            label: "Sports",
            value: student.interests?.sports || "",
            type: "text",
            path: "interests.sports",
          },
          {
            label: "Hobbies",
            value: student.interests?.hobbies || "",
            type: "text",
            path: "interests.hobbies",
          },
          {
            label: "Talents",
            value: student.interests?.talents || "",
            type: "text",
            path: "interests.talents",
          },
          {
            label: "Socio-civic",
            value: student.interests?.socioCivic || "",
            type: "text",
            path: "interests.socioCivic",
          },
          {
            label: "Organizations",
            value: student.interests?.organization || "",
            type: "text",
            path: "interests.organization",
          },
        ],
      },
      Health: {
        icon: <HeartPulse className={iconClass} />,
        data: [
          {
            label: "Hospitalized",
            value: student.health?.hospitalized || "",
            type: "text",
            path: "health.hospitalized",
          },
          {
            label: "Reason",
            value: student.health?.reason || "",
            type: "text",
            path: "health.reason",
          },
          {
            label: "Operation",
            value: student.health?.operation || "",
            type: "text",
            path: "health.operation",
          },
          {
            label: "Illness/Condition",
            value: student.health?.illness || "",
            type: "text",
            path: "health.illness",
          },
          {
            label: "Medical Certificate",
            value: student.health?.medicalCert || "",
            type: "text",
            path: "health.medicalCert",
          },
          {
            label: "Prescribed Drugs",
            value: student.health?.prescribedDrug || "",
            type: "text",
            path: "health.prescribedDrug",
          },
          {
            label: "Hereditary Illness",
            value: student.health?.hereditary || "",
            type: "text",
            path: "health.hereditary",
          },
          {
            label: "Last Doctor's Visit",
            value: student.health?.doctorLastSeen || "",
            type: "date",
            path: "health.doctorLastSeen",
          },
        ],
      },
      "Current Circumstances": {
        icon: <Leaf className={iconClass} />,
        data: [
          {
            label: "Recent Loss",
            value: student.lifeCircumstances?.recentLoss || "",
            type: "text",
            path: "lifeCircumstances.recentLoss",
          },
          {
            label: "Current Concern",
            value: student.lifeCircumstances?.currentConcern || "",
            type: "text",
            path: "lifeCircumstances.currentConcern",
          },
        ],
      },
    };
  }, [student]);

  // When the selected category changes, update formData and originalFormData
  useEffect(() => {
    if (categories[selectedCategory]) {
      const category = categories[selectedCategory];
      let dataToSet = [...(category.data || [])];
      // If the category has subsections, concatenate their fields
      if (category.subsections) {
        category.subsections.forEach((section) => {
          dataToSet = dataToSet.concat(section.fields);
        });
      }
      // Store a copy for editing and for canceling edits
      setFormData(dataToSet.map((item) => ({ ...item })));
      setOriginalFormData(dataToSet.map((item) => ({ ...item })));
    } else {
      setFormData([]);
      setOriginalFormData([]);
    }
  }, [categories, selectedCategory]);

  // Helper to set a value at a nested path in an object (e.g., "profile.name")
  const setNested = (obj, path, value) => {
    const keys = path.split(".");
    let temp = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!temp[keys[i]]) temp[keys[i]] = {};
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;
  };

  // Deep merge helper: merges source object into target, preserving existing data
  function deepMerge(target, source) {
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  // Save handler: builds an update object with only changed fields,
  // sends it to the server, and updates local student state
  const handleSave = async () => {
    let updateObj = {};
    formData.forEach((item, idx) => {
      const original = originalFormData[idx]?.value;
      if (item.value !== original) {
        setNested(updateObj, item.path, item.value);
      }
    });

    // If nothing changed, just exit edit mode
    if (Object.keys(updateObj).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await axios.put(`/student/update/${studentId}`, updateObj);
      console.log("Saving changes:", updateObj);
      // Deep merge the update into the current student object
      setStudent((prevStudent) => deepMerge({ ...prevStudent }, updateObj));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update student.", err);
    }
  };

  // Cancel handler: restores formData to its original state and exits edit mode
  const handleCancelEdit = () => {
    setFormData(originalFormData.map((item) => ({ ...item })));
    setIsEditing(false);
  };

  // Renders a single field (input if editing, text otherwise)
  const renderField = (item, idx) => {
    const isLocked = lockedFields.includes(item.label);
    return (
      <div key={item.label + idx} className="space-y-1">
        <p className="text-gray-500 text-sm flex items-center font-medium">
          {item.label}
          {isLocked && <Lock className="w-3 h-3 text-gray-400 ml-1" />}
        </p>
        {isEditing && !isLocked ? (
          <input
            type={item.type}
            value={item.value ?? ""}
            onChange={(e) => {
              setFormData((prevFormData) =>
                prevFormData.map((f, i) =>
                  i === idx ? { ...f, value: e.target.value } : f
                )
              );
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
          />
        ) : (
          <p
            className={`font-semibold text-gray-900 text-base whitespace-pre-wrap ${
              isLocked ? "text-gray-500" : ""
            }`}
          >
            {item.value !== undefined &&
            item.value !== null &&
            item.value !== ""
              ? item.value
              : "N/A"}
          </p>
        )}
      </div>
    );
  };

  // Helper to get the correct slice of formData for each section in a category with subsections
  const getSectionFields = (section, offset) => {
    return formData.slice(offset, offset + section.fields.length);
  };

  // Renders the fields for the selected category, handling subsections if present
  const renderCategoryContent = (category) => {
    if (category.subsections) {
      // For categories with subsections, calculate offsets for each section
      let offset = category.data.length;
      return (
        <div className="space-y-6">
          {category.subsections.map((section, sectionIndex) => {
            const fields = getSectionFields(section, offset);
            const startOffset = offset;
            offset += section.fields.length;
            return (
              <div
                key={sectionIndex}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {fields.map((item, idx) =>
                    renderField(item, startOffset + idx)
                  )}
                </div>
              </div>
            );
          })}
          {category.data.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Other Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {formData
                  .slice(0, category.data.length)
                  .map((item, idx) => renderField(item, idx))}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // For simple categories, just render all fields
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {formData.map((item, idx) => renderField(item, idx))}
        </div>
      );
    }
  };

  // Main content rendering logic based on loading/error/data state
  let content;
  if (loading) {
    content = (
      <div className="p-8 text-center text-gray-700 text-lg">Loading...</div>
    );
  } else if (error) {
    content = (
      <div className="p-8 text-center text-red-500 text-lg">{error}</div>
    );
  } else if (!student) {
    content = (
      <div className="p-8 text-center text-gray-500 text-lg">
        No student data found.
      </div>
    );
  } else {
    const category = categories[selectedCategory];
    content = (
      <div className="flex-1 p-6 bg-white rounded-2xl shadow-xl overflow-y-auto transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            {selectedCategory}
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-black font-semibold px-5 py-2 rounded-xl border-none bg-yellow-400 shadow-md hover:bg-yellow-500 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 text-sm"
            >
              <Pencil className="w-4 h-4 mr-2" />
              <span>Edit</span>
            </button>
          )}
        </div>
        {renderCategoryContent(category)}
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
              className="bg-yellow-400 font-semibold text-black px-6 py-2 rounded-xl text-sm shadow-md hover:bg-yellow-500 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Save
            </button>
          </div>
        )}
      </div>
    );
  }

  // Main layout: sidebar for categories, main area for content
  return (
    <div className="flex w-full min-h-screen font-sans p-6 bg-gray-100 antialiased text-gray-900">
      <div className="w-64 min-w-[256px] p-6 bg-white rounded-2xl shadow-xl flex-shrink-0 mr-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          Profile
        </h2>
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
                      ? "bg-yellow-400 text-black shadow-lg"
                      : "text-gray-700 hover:bg-gray-200 hover:text-black"
                  }`}
                >
                  {React.cloneElement(categories[categoryName].icon, {
                    className: `w-5 h-5 mr-3 transition-colors duration-200 ${
                      selectedCategory === categoryName
                        ? "text-black"
                        : "text-gray-600"
                    }`,
                  })}
                  {categoryName}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex-1">{content}</div>
    </div>
  );
}
