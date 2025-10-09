import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { Info, School, Users, Briefcase, Lightbulb, HeartPulse, Pencil, Lock, Phone, UserRound, Leaf, PlusCircle, Trash2} from "lucide-react";
import { AuthContext } from "../../../AuthProvider.jsx";
import LoadingDots from "../../../component/Loading.jsx";

export default function ProfileView() {
  const [studentId, setStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Basic Information");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState([]);
  const [originalFormData, setOriginalFormData] = useState([]);
  const { authData } = useContext(AuthContext);

  const lockedFields = [
    "Student Number",
    "Full Name",
    "Birth Date",
    "Gender",
    "Program and Year/Section",
    "Academic Level",
    "Email",
  ];

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/student/get/${authData.user.uid}`);
      setStudent(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load student data. Please check the network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authData) return;
    setStudentId(authData.user?.uid);
    fetchStudentData();
  }, [authData]);

  // Health fields for array-based editing
  const healthFields = [
    {
      key: "hospitalized",
      label: "Hospitalization Records",
      description: "List all hospitalization events in the last 5 years.",
      placeholders: [
        "Event/Condition (e.g., Broken Leg)",
        "Reason (e.g., Bike Accident)",
      ],
      addLabel: "Add Hospitalization Entry",
    },
    {
      key: "operation",
      label: "Operation Records",
      description: "List all operations or major surgeries you have undergone.",
      placeholder: "Type and Date (e.g., Tonsillectomy - 2022)",
      addLabel: "Add Operation Entry",
    },
    {
      key: "illness",
      label: "Current Illnesses, Allergies, or Conditions",
      description:
        "Include chronic diseases, known allergies, or any other ongoing health issues.",
      placeholder: "Enter detail here",
      addLabel: "Add Condition",
    },
    {
      key: "prescribedDrug",
      label: "Regular Prescribed Drugs",
      description:
        "List the drug name, dosage, and reason for taking it regularly (e.g., 'Drug X, 10mg daily for condition Y').",
      placeholder: "Enter detail here",
      addLabel: "Add Drug",
    },
    {
      key: "hereditary",
      label: "Hereditary Illness in Family",
      description:
        "List conditions present in immediate family (e.g., 'Diabetes - Grandfather', 'Hypertension - Mother').",
      placeholder: "Enter detail here",
      addLabel: "Add Hereditary Condition",
    },
    {
      key: "doctorLastSeen",
      label: "Last Doctor's Visit Details",
      addLabel: "",
    },
    {
      key: "medicalCert",
      label: "Medical Certificates",
      description: "You may upload or link documents here.",
      placeholder: "Enter link to document or a short description.",
      addLabel: "Add Medical Certificate",
    },
  ];

  // Categories, but Health is handled separately for custom UI
  const categories = useMemo(() => {
    if (!student) return {};
    const iconClass = "w-5 h-5 mr-3 text-gray-700";
    return {
      "Basic Information": {
        icon: <Info className={iconClass} />,
        data: [],
        subsections: [
          {
            title: "Student Information",
            fields: [
              {
                label: "Full Name",
                value: student.studentProfile?.name || "",
                type: "text",
                path: "studentProfile.name",
              },
              {
                label: "Student Number",
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
                label: "Contact Number",
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
                  `${student.studentProfile?.program} ${student.studentProfile?.section}`.trim() || "",
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
            ],
          },
          {
            title: "Guardian Information",
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
                label: "Contact Number",
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
          {
            title: "Emergency Contact",
            fields: [
              {
                label: "Name",
                value: student.familyBackground?.emergency?.name || "",
                type: "text",
                path: "familyBackground.emergency.name",
              },
              {
                label: "Contact Number",
                value: student.familyBackground?.emergency?.contactNo || "",
                type: "tel",
                path: "familyBackground.emergency.contactNo",
              },
            ],
          },
          {
            title: "Health Conditions",
            fields: [], // This will be rendered with a custom component
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
            label: "Student Number",
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
            label: "Emergency Contact Name",
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
            label: "Siblings",
            value: (student.familyBackground?.siblings || []).join(", "),
            type: "array",
            path: "familyBackground.siblings",
          },
          {
            label: "Birth Order",
            value: student.familyBackground?.birthOrder || "",
            type: "text",
            path: "familyBackground.birthOrder",
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
                label: "Contact Number",
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
                label: "Contact Number",
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
                label: "Contact Number",
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
          {
            label: "Extra Curricular Activities",
            value: student.educationalBackground?.extraCurricular || "",
            type: "array",
            path: "educationalBackground.extraCurricular",
          },
          {
            label: "Awards",
            value: student.educationalBackground?.awards || "",
            type: "array",
            path: "educationalBackground.awards",
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
                label: "Year Enrolled",
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
                label: "Year Enrolled",
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
                label: "Year Enrolled",
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
                label: "Year Enrolled",
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
            label: "Company Contact Number",
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
        data: [], // Handled separately
      },
      Health: {
        icon: <HeartPulse className={iconClass} />,
        data: [], // handled separately
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

  // Health section state for editing
  const [healthEdit, setHealthEdit] = useState({});
  const [healthOriginal, setHealthOriginal] = useState({});

  // Interests section state for editing
  const [interestsEdit, setInterestsEdit] = useState({});
  const [interestsOriginal, setInterestsOriginal] = useState({});

  // State for other array-like fields (Siblings, Awards, etc.)
  const [arrayFieldsEdit, setArrayFieldsEdit] = useState({});
  const [arrayFieldsOriginal, setArrayFieldsOriginal] = useState({});

  // When switching to a category with health data, sync healthEdit state
  useEffect(() => {
    if (["Health", "Basic Information"].includes(selectedCategory) && student) {
      const healthData = student.health || {};
      let initial = {};
      // Hospitalized: array of { event, reason }
      initial.hospitalized = Array.isArray(healthData.hospitalized)
        ? healthData.hospitalized.map((event, idx) => ({
            event: event || "",
            reason:
              Array.isArray(healthData.reason) && healthData.reason[idx]
                ? healthData.reason[idx]
                : "",
          }))
        : [];
      // Operation: array of strings
      initial.operation = Array.isArray(healthData.operation)
        ? [...healthData.operation]
        : [];
      initial.illness = Array.isArray(healthData.illness)
        ? [...healthData.illness]
        : [];
      initial.prescribedDrug = Array.isArray(healthData.prescribedDrug)
        ? [...healthData.prescribedDrug]
        : [];
      initial.hereditary = Array.isArray(healthData.hereditary)
        ? [...healthData.hereditary]
        : [];
      // Only one entry for doctorLastSeen
      initial.doctorLastSeen =
        Array.isArray(healthData.doctorLastSeen) && healthData.doctorLastSeen.length > 0
          ? healthData.doctorLastSeen[0]
          : "";
      initial.medicalCert = Array.isArray(healthData.medicalCert)
        ? [...healthData.medicalCert]
        : [];
      setHealthEdit(initial);
      setHealthOriginal(JSON.parse(JSON.stringify(initial)));
    }
  }, [selectedCategory, student]);

  // When switching to Interests, sync interestsEdit state
  useEffect(() => {
    if (selectedCategory === "Interests and Hobbies" && student) {
      const interestsData = student.interests || {};
      const initial = {
        sports: Array.isArray(interestsData.sports) ? [...interestsData.sports] : [],
        hobbies: Array.isArray(interestsData.hobbies) ? [...interestsData.hobbies] : [],
        talents: Array.isArray(interestsData.talents) ? [...interestsData.talents] : [],
        socioCivic: Array.isArray(interestsData.socioCivic) ? [...interestsData.socioCivic] : [],
        organization: Array.isArray(interestsData.organization) ? [...interestsData.organization] : [],
      };
      setInterestsEdit(initial);
      setInterestsOriginal(JSON.parse(JSON.stringify(initial)));
    }
  }, [selectedCategory, student]);

  // Sync state for other array fields
  useEffect(() => {
    if (student) {
      const initial = {};
      if (selectedCategory === "Family Background") {
        initial.siblings = Array.isArray(student.familyBackground?.siblings) ? [...student.familyBackground.siblings] : [];
      }
      if (selectedCategory === "Educational Background") {
        initial.extraCurricular = Array.isArray(student.educationalBackground?.extraCurricular) ? [...student.educationalBackground.extraCurricular] : [];
        initial.awards = Array.isArray(student.educationalBackground?.awards) ? [...student.educationalBackground.awards] : [];
      }
      setArrayFieldsEdit(initial);
      setArrayFieldsOriginal(JSON.parse(JSON.stringify(initial)));
    }
  }, [selectedCategory, student]);

  // Helper for nested set
  const setNested = (obj, path, value) => {
    const keys = path.split(".");
    let temp = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!temp[keys[i]]) temp[keys[i]] = {};
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;
  };

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

  // Save handler for Health section
  const handleHealthSave = async () => {
    let updateObj = { health: {} };
    // Hospitalized and reason
    if (
      JSON.stringify(healthEdit.hospitalized) !==
      JSON.stringify(healthOriginal.hospitalized)
    ) {
      updateObj.health.hospitalized = healthEdit.hospitalized.map((h) => h.event).filter((v) => v !== "");
      updateObj.health.reason = healthEdit.hospitalized.map((h) => h.reason).filter((v) => v !== "");
    }
    // Operation
    if (
      JSON.stringify(healthEdit.operation) !==
      JSON.stringify(healthOriginal.operation)
    ) {
      updateObj.health.operation = healthEdit.operation.filter((v) => v !== "");
    }
    // Illness
    if (
      JSON.stringify(healthEdit.illness) !==
      JSON.stringify(healthOriginal.illness)
    ) {
      updateObj.health.illness = healthEdit.illness.filter((v) => v !== "");
    }
    // Prescribed Drug
    if (
      JSON.stringify(healthEdit.prescribedDrug) !==
      JSON.stringify(healthOriginal.prescribedDrug)
    ) {
      updateObj.health.prescribedDrug = healthEdit.prescribedDrug.filter((v) => v !== "");
    }
    // Hereditary
    if (
      JSON.stringify(healthEdit.hereditary) !==
      JSON.stringify(healthOriginal.hereditary)
    ) {
      updateObj.health.hereditary = healthEdit.hereditary.filter((v) => v !== "");
    }
    // Doctor Last Seen (single entry)
    if (
      healthEdit.doctorLastSeen !== healthOriginal.doctorLastSeen
    ) {
      updateObj.health.doctorLastSeen = healthEdit.doctorLastSeen ? [healthEdit.doctorLastSeen] : [];
    }
    // Medical Cert
    if (
      JSON.stringify(healthEdit.medicalCert) !==
      JSON.stringify(healthOriginal.medicalCert)
    ) {
      updateObj.health.medicalCert = healthEdit.medicalCert.filter((v) => v !== "");
    }

    // If nothing changed, just exit edit mode
    if (Object.keys(updateObj.health).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await axios.put(`/student/update/${studentId}`, updateObj);
      setStudent((prevStudent) =>
        deepMerge({ ...prevStudent }, updateObj)
      );
      setIsEditing(false);
      setHealthOriginal(healthEdit);
    } catch (err) {
      console.error("Failed to update health info.", err);
    }
  };

  // Cancel handler for Health section
  const handleHealthCancel = () => {
    setHealthEdit(healthOriginal);
    setIsEditing(false);
  };

  // Add entry to health field
  const handleHealthAdd = (key) => {
    if (key === "hospitalized") {
      setHealthEdit((prev) => ({
        ...prev,
        hospitalized: [...(prev.hospitalized || []), { event: "", reason: "" }],
      }));
    } else {
      setHealthEdit((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ""],
      }));
    }
  };

  // Remove entry from health field
  const handleHealthRemove = (key, idx) => {
    setHealthEdit((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }));
  };

  // Change entry in health field
  const handleHealthChange = (key, idx, value, subkey) => {
    if (key === "hospitalized" && subkey) {
      setHealthEdit((prev) => ({
        ...prev,
        hospitalized: prev.hospitalized.map((entry, i) =>
          i === idx ? { ...entry, [subkey]: value } : entry
        ),
      }));
    } else {
      setHealthEdit((prev) => ({
        ...prev,
        [key]: prev[key].map((v, i) => (i === idx ? value : v)),
      }));
    }
  };

  // Change doctorLastSeen (single entry)
  const handleDoctorLastSeenChange = (value) => {
    setHealthEdit((prev) => ({
      ...prev,
      doctorLastSeen: value,
    }));
  };

  // Handlers for Interests section
  const handleInterestsSave = async () => {
    let updateObj = { interests: {} };
    for (const key of Object.keys(interestsEdit)) {
      if (JSON.stringify(interestsEdit[key]) !== JSON.stringify(interestsOriginal[key])) {
        updateObj.interests[key] = interestsEdit[key].filter(v => v !== "");
      }
    }

    if (Object.keys(updateObj.interests).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await axios.put(`/student/update/${studentId}`, updateObj);
      setStudent((prevStudent) => deepMerge({ ...prevStudent }, updateObj));
      setIsEditing(false);
      setInterestsOriginal(interestsEdit);
    } catch (err) {
      console.error("Failed to update interests.", err);
    }
  };

  const handleInterestsCancel = () => {
    setInterestsEdit(interestsOriginal);
    setIsEditing(false);
  };

  const handleInterestsAdd = (key) => {
    setInterestsEdit((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ""],
    }));
  };

  const handleInterestsRemove = (key, idx) => {
    setInterestsEdit((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }));
  };

  const handleInterestsChange = (key, idx, value) => {
    setInterestsEdit((prev) => ({
      ...prev,
      [key]: prev[key].map((v, i) => (i === idx ? value : v)),
    }));
  };

  // Handlers for other array fields (Siblings, Awards, etc.)
  const handleArrayFieldAdd = (key) => {
    setArrayFieldsEdit((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ""],
    }));
  };

  const handleArrayFieldRemove = (key, idx) => {
    setArrayFieldsEdit((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }));
  };

  const handleArrayFieldChange = (key, idx, value) => {
    setArrayFieldsEdit((prev) => ({
      ...prev,
      [key]: prev[key].map((v, i) => (i === idx ? value : v)),
    }));
  };

  // Render Health section (edit & view mode)
  const renderHealthSection = () => {
    return (
      <div className="space-y-8">
        {/* Major Health Events */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            I. Major Health Events (Hospitalization & Operation)
          </h3>
          <div className="space-y-6">
            {/* Hospitalized */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  Hospitalization Records
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleHealthAdd("hospitalized")}
                    className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Entry
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-700 mb-2">
                List all hospitalization events in the last 5 years.
              </p>
              <div className="space-y-4">
                {(isEditing ? healthEdit.hospitalized : (Array.isArray(student.health?.hospitalized) ? student.health.hospitalized.map((event, idx) => ({
                  event,
                  reason: Array.isArray(student.health?.reason) && student.health.reason[idx]
                    ? student.health.reason[idx]
                    : "",
                })) : [])).length === 0 && !isEditing && (
                  <div className="text-gray-400 italic">No records.</div>
                )}
                {(isEditing ? healthEdit.hospitalized : (Array.isArray(student.health?.hospitalized) ? student.health.hospitalized.map((event, idx) => ({
                  event,
                  reason: Array.isArray(student.health?.reason) && student.health.reason[idx]
                    ? student.health.reason[idx]
                    : "",
                })) : [])).map((entry, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 shadow-sm">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={entry.event}
                          onChange={(e) =>
                            handleHealthChange("hospitalized", idx, e.target.value, "event")
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
                          placeholder="Event/Condition (e.g., Broken Leg)"
                        />
                        <input
                          type="text"
                          value={entry.reason}
                          onChange={(e) =>
                            handleHealthChange("hospitalized", idx, e.target.value, "reason")
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
                          placeholder="Reason (e.g., Bike Accident)"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleHealthRemove("hospitalized", idx)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center"
                            title="Remove Entry"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="font-semibold text-gray-900">
                          {entry.event || "N/A"}
                        </div>
                        <div className="text-gray-700 text-sm">
                          {entry.reason || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                 {isEditing && healthEdit.hospitalized?.length === 0 && (
                  <div className="text-gray-400 italic p-4 text-center">Click 'Add Entry' to begin.</div>
                )}
              </div>
            </div>
            {/* Operation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  Operation Records
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleHealthAdd("operation")}
                    className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Entry
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-700 mb-2">
                List all operations or major surgeries you have undergone.
              </p>
              <div className="space-y-2">
                {(isEditing ? healthEdit.operation : student.health?.operation || []).length === 0 && !isEditing && (
                  <div className="text-gray-400 italic">No records.</div>
                )}
                {(isEditing ? healthEdit.operation : student.health?.operation || []).map((entry, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={entry}
                          onChange={(e) =>
                            handleHealthChange("operation", idx, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
                          placeholder="Type and Date (e.g., Tonsillectomy - 2022)"
                        />
                        <button
                          type="button"
                          onClick={() => handleHealthRemove("operation", idx)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                          title="Remove Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-900 font-semibold">{entry || "N/A"}</span>
                    )}
                  </div>
                ))}
                {isEditing && healthEdit.operation?.length === 0 && (
                  <div className="text-gray-400 italic p-4 text-center">Click 'Add Entry' to begin.</div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Chronic and Current Conditions */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            II. Chronic and Current Conditions
          </h3>
          <div className="space-y-6">
            {["illness", "prescribedDrug", "hereditary"].map((key) => {
              const field = healthFields.find((f) => f.key === key);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {field.label}
                    </span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleHealthAdd(key)}
                        className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                      >
                        <PlusCircle className="w-4 h-4 mr-1" />
                        {field.addLabel}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{field.description}</p>
                  <div className="space-y-2">
                    {(isEditing ? healthEdit[key] : student.health?.[key] || []).length === 0 && !isEditing && (
                      <div className="text-gray-400 italic">No records.</div>
                    )}
                    {(isEditing ? healthEdit[key] : student.health?.[key] || []).map((entry, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={entry}
                              onChange={(e) =>
                                handleHealthChange(key, idx, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
                              placeholder={field.placeholder}
                            />
                            <button
                              type="button"
                              onClick={() => handleHealthRemove(key, idx)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                              title="Remove Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-semibold">{entry || "N/A"}</span>
                        )}
                      </div>
                    ))}
                    {isEditing && healthEdit[key]?.length === 0 && (
                      <div className="text-gray-400 italic p-4 text-center">Click '{field.addLabel}' to begin.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Check-up and Documents */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            III. Check-up and Documents
          </h3>
          <div className="space-y-6">
            {/* Last Doctor's Visit (single entry, date input + purpose) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  Last Doctor's Visit Details
                </span>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Enter the date and brief purpose of your last professional medical visit.
              </p>
              <div className="space-y-2">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="date"
                        value={healthEdit.doctorLastSeen?.split(" - ")[0] || ""}
                        onChange={(e) => {
                          const purpose = healthEdit.doctorLastSeen?.split(" - ")[1] || "";
                          handleDoctorLastSeenChange(
                            e.target.value ? `${e.target.value}${purpose ? " - " + purpose : ""}` : purpose
                          );
                        }}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800"
                      />
                      <input
                        type="text"
                        value={healthEdit.doctorLastSeen?.split(" - ")[1] || ""}
                        onChange={(e) => {
                          const date = healthEdit.doctorLastSeen?.split(" - ")[0] || "";
                          handleDoctorLastSeenChange(
                            e.target.value ? `${date ? date + " - " : ""}${e.target.value}` : date
                          );
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800"
                        placeholder="Purpose of visit"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-900 font-semibold">
                      {(Array.isArray(student.health?.doctorLastSeen) && student.health.doctorLastSeen.length > 0
                        ? student.health.doctorLastSeen[0]
                        : "N/A")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Medical Certificates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  Medical Certificates
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleHealthAdd("medicalCert")}
                    className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Medical Certificate
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-700 mb-2">
                You may upload or link documents here.
              </p>
              <div className="space-y-2">
                {(isEditing ? healthEdit.medicalCert : student.health?.medicalCert || []).length === 0 && !isEditing && (
                  <div className="text-gray-400 italic">No records.</div>
                )}
                {(isEditing ? healthEdit.medicalCert : student.health?.medicalCert || []).map((entry, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={entry}
                          onChange={(e) =>
                            handleHealthChange("medicalCert", idx, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
                          placeholder="Enter link to document or a short description."
                        />
                        <button
                          type="button"
                          onClick={() => handleHealthRemove("medicalCert", idx)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                          title="Remove Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-900 font-semibold">{entry || "N/A"}</span>
                    )}
                  </div>
                ))}
                {isEditing && healthEdit.medicalCert?.length === 0 && (
                  <div className="text-gray-400 italic p-4 text-center">Click 'Add Medical Certificate' to begin.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInterestsSection = () => {
    const interestFields = [
      { key: 'sports', label: 'Sports', placeholder: 'e.g., Basketball, Chess' },
      { key: 'hobbies', label: 'Hobbies', placeholder: 'e.g., Reading, Digital art' },
      { key: 'talents', label: 'Talents', placeholder: 'e.g., Playing guitar, Writing' },
      { key: 'socioCivic', label: 'Socio-civic Involvement', placeholder: 'e.g., Volunteer work' },
      { key: 'organization', label: 'Organizations (Affiliations)', placeholder: 'e.g., Student Council' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {interestFields.map(({ key, label, placeholder }) => (
          <div key={key} className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">{label}</h3>
            <div className="space-y-3">
              {(isEditing ? interestsEdit[key] : student.interests?.[key] || []).length === 0 && !isEditing && (
                <div className="text-gray-400 italic">No entries.</div>
              )}
              {(isEditing ? interestsEdit[key] : student.interests?.[key] || []).map((entry, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={entry}
                        onChange={(e) => handleInterestsChange(key, idx, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800"
                        placeholder={placeholder}
                      />
                      <button
                        type="button"
                        onClick={() => handleInterestsRemove(key, idx)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                        title="Remove Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900">{entry || "N/A"}</span>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleInterestsAdd(key)}
                  className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium mt-2"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Add Entry
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // When the selected category changes, update formData and originalFormData
  useEffect(() => {
    if (categories[selectedCategory] && !["Health", "Interests and Hobbies"].includes(selectedCategory)) {
      const category = categories[selectedCategory];
      let dataToSet = [...(category.data || [])];
      if (category.subsections) {
        category.subsections.forEach((section) => {
          dataToSet = dataToSet.concat(section.fields);
        });
      }
      setFormData(dataToSet.map((item) => ({ ...item })));
      setOriginalFormData(dataToSet.map((item) => ({ ...item })));
    } else if (!["Health", "Interests and Hobbies"].includes(selectedCategory)) {
      setFormData([]);
      setOriginalFormData([]);
    }
  }, [categories, selectedCategory]);

  // Save handler for non-health sections
  const handleSave = async () => {
    let updateObj = {};
    formData.forEach((item, idx) => {
      const original = originalFormData[idx]?.value;
      // Exclude array fields from this generic save handler
      if (item.type !== 'array' && item.value !== original) {
        setNested(updateObj, item.path, item.value);
      }
    });

    // Handle array fields (siblings, awards, etc.)
    for (const key of Object.keys(arrayFieldsEdit)) {
      if (JSON.stringify(arrayFieldsEdit[key]) !== JSON.stringify(arrayFieldsOriginal[key])) {
        const path = {
          siblings: "familyBackground.siblings",
          extraCurricular: "educationalBackground.extraCurricular",
          awards: "educationalBackground.awards",
        }[key];
        if (path) {
          setNested(updateObj, path, arrayFieldsEdit[key].filter(v => v !== ""));
        }
      }
    }

    // Handle illness changes from Basic Info
    if (JSON.stringify(healthEdit.illness) !== JSON.stringify(healthOriginal.illness)) {
      if (!updateObj.health) updateObj.health = {};
      updateObj.health.illness = healthEdit.illness.filter((v) => v !== "");
    }

    if (Object.keys(updateObj).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await axios.put(`/student/update/${studentId}`, updateObj);
      setStudent((prevStudent) => deepMerge({ ...prevStudent }, updateObj));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update student.", err);
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalFormData.map((item) => ({ ...item })));
    setHealthEdit(healthOriginal); // Also reset health changes
    setArrayFieldsEdit(arrayFieldsOriginal); // Reset other array fields
    setIsEditing(false);
  };

  const renderArrayField = (item) => {
    const key = item.path.split('.').pop();
    const data = isEditing ? arrayFieldsEdit[key] : student[item.path.split('.')[0]]?.[key] || [];
    const placeholder = `e.g., ${item.label === 'Siblings' ? 'John Doe' : 'Award Name'}`;

    return (
      <div key={item.path} className="space-y-1 col-span-1 md:col-span-2">
        <p className="text-gray-500 text-sm flex items-center font-medium">
          {item.label}
        </p>
        <div className="space-y-3">
          {data.length === 0 && !isEditing && (
            <div className="text-gray-400 italic">No entries.</div>
          )}
          {data.map((entry, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={entry}
                    onChange={(e) => handleArrayFieldChange(key, idx, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800"
                    placeholder={placeholder}
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayFieldRemove(key, idx)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                    title="Remove Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="font-semibold text-gray-900">{entry || "N/A"}</span>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              type="button"
              onClick={() => handleArrayFieldAdd(key)}
              className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium mt-2"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Entry
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderField = (item, idx) => {
    if (item.type === 'array') {
      return renderArrayField(item);
    }
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
            className={`font-semibold text-gray-900 text-base whitespace-pre-wrap ${isLocked ? "text-gray-500" : ""
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

  const renderIllnessField = () => {
    const key = "illness";
    const field = healthFields.find((f) => f.key === key);
    if (!field) return null;

    return (
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">
            {field.label}
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={() => handleHealthAdd(key)}
              className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              {field.addLabel}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-700 mb-2">{field.description}</p>
        <div className="space-y-2">
          {(isEditing ? healthEdit[key] : student.health?.[key] || []).length === 0 && !isEditing && (
            <div className="text-gray-400 italic">No records.</div>
          )}
          {(isEditing ? healthEdit[key] : student.health?.[key] || []).map((entry, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={entry}
                    onChange={(e) =>
                      handleHealthChange(key, idx, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base text-gray-800 transition-colors duration-200"
                    placeholder={field.placeholder}
                  />
                  <button
                    type="button"
                    onClick={() => handleHealthRemove(key, idx)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                    title="Remove Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="text-gray-900 font-semibold">{entry || "N/A"}</span>
              )}
            </div>
          ))}
          {isEditing && healthEdit[key]?.length === 0 && (
            <div className="text-gray-400 italic p-4 text-center">Click '{field.addLabel}' to begin.</div>
          )}
        </div>
      </div>
    );
  };

  const getSectionFields = (section, offset) => {
    return formData.slice(offset, offset + section.fields.length);
  };

  const renderCategoryContent = (category) => {
    if (selectedCategory === "Health") {
      return renderHealthSection();
    }
    if (selectedCategory === "Interests and Hobbies") {
      return renderInterestsSection();
    }
    if (category.subsections) {
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
                className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {section.title === "Health Conditions"
                    ? renderIllnessField()
                    : fields.map((item, idx) =>
                        renderField(item, startOffset + idx)
                      )}
                </div>
              </div>
            );
          })}
          {category.data.length > 0 && (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
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
    content = <LoadingDots />;
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
      <div className="flex-1 p-4 sm:p-6 bg-white rounded-2xl shadow-xl overflow-y-auto transition-all duration-300 ease-in-out">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            {selectedCategory}
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center text-black font-semibold px-5 py-2 rounded-xl border-none bg-yellow-400 shadow-md hover:bg-yellow-500 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 text-sm self-start sm:self-center"
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
              onClick={
                selectedCategory === "Health" ? handleHealthCancel :
                selectedCategory === "Interests and Hobbies" ? handleInterestsCancel :
                handleCancelEdit
              }
              className="bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 px-6 py-2 rounded-xl text-sm shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={
                selectedCategory === "Health" ? handleHealthSave :
                selectedCategory === "Interests and Hobbies" ? handleInterestsSave :
                handleSave
              }
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
    <div className="flex flex-col lg:flex-row w-full min-h-screen font-sans p-4 sm:p-6 bg-gray-100 antialiased text-gray-900 gap-8">
      <div className="w-full lg:w-64 lg:min-w-[256px] p-4 sm:p-6 bg-white rounded-2xl shadow-xl flex-shrink-0">
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
                  className={`w-full text-left py-3 px-4 rounded-xl font-medium flex items-center text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 ${selectedCategory === categoryName
                      ? "bg-yellow-400 text-black shadow-lg"
                      : "text-gray-700 hover:bg-gray-200 hover:text-black"
                    }`}
                >
                  {React.cloneElement(categories[categoryName].icon, {
                    className: `w-5 h-5 mr-3 transition-colors duration-200 ${selectedCategory === categoryName
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
      <div className="flex-1 min-w-0">{content}</div>
    </div>
  );
}