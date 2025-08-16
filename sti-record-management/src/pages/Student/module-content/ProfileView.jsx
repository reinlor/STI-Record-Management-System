import React, { useState } from "react";

export default function ProfileView() {
    // MOCK DATA: Replace with actual data
    const student = {
        studentName: "Juan Dela Cruz",
        studentID: "02000389463",
        program: "BSIT 4.1A",
        studentProfile: {
            studentName: "Juan Dela Cruz",
            gender: "Male",
            birthday: "2003-05-10",
            academicLevel: "College",
            programAndSection: "BSIT 4.1A", 
            nickname: "JD",
            nationality: "Filipino",
            religion: "Catholic",
            status: "Single",
            section: "A"
        },
        contactInfo: {
            email: "juan@example.com",
            contactNo: "09123456789",
            homeNo: "02-1234567",
            workNo: "02-7654321",
            address: {
                currentAddress: "Manila",
                permanentAddress: "Quezon City",
                provincialAddress: "Bulacan"
            }
        },
        familyBackground: {
            emergency: { name: "Maria Dela Cruz", contactNo: "09129876543" },
            fatherInfo: {
                name: "Jose Dela Cruz",
                age: "50",
                birthday: "1975-01-01",
                nationality: "Filipino",
                religion: "Catholic",
                educationalAttainment: "College Graduate",
                occupation: "Engineer",
                contactNo: "09121234567",
                email: "jose@example.com"
            },
            motherInfo: {
                name: "Ana Dela Cruz",
                age: "48",
                birthday: "1977-02-02",
                nationality: "Filipino",
                religion: "Catholic",
                educationalAttainment: "College Graduate",
                occupation: "Teacher",
                contactNo: "09129876543",
                email: "ana@example.com"
            },
            statusOfParent: "Married",
            guardian: {
                name: "Maria Dela Cruz",
                relation: "Mother",
                contactNo: "09129876543",
                email: "maria@example.com"
            },
            address: "Quezon City",
            siblings: ["Pedro", "Luisa"],
            birthOrder: "1st Born"
        },
        educationalBackground: {
            elementary: { schoolName: "STI Elementary", dateEnrolled: "2010-2016" },
            juniorHighSchool: { schoolName: "STI JHS", dateEnrolled: "2016-2020" },
            seniorHighSchool: { schoolName: "STI SHS", dateEnrolled: "2020-2022" },
            college: { schoolName: "STI College", dateEnrolled: "2022-2025" },
            extraCurricular: "Basketball",
            awards: "Best in Math",
            likedSubject: "Math",
            leastSubject: "History"
        },
        workExperience: {
            name: "ABC Corp",
            duration: "2024-2025",
            description: "Intern",
            contactNo: "09120000000",
            email: "hr@abccorp.com"
        },
        interests: {
            sports: "Basketball",
            hobbies: "Reading",
            talents: "Singing",
            socioCivic: "Volunteer",
            organization: "Red Cross"
        },
        health: {
            hospitalized: "No",
            reason: "",
            operation: "None",
            illness: "None",
            medicalCert: "N/A",
            prescribedDrug: "None",
            hereditary: "None",
            doctorLastSeen: "2025-01-01"
        },
        lifeCircumstances: {
            recentLoss: "None",
            currentConcern: "Graduation"
        }
    };

    // CATEGORIES: Each category contains fields with label, value, and input type.
    const categories = {
        "Basic Information": [
            { label: "Full Name", value: student.studentProfile.studentName, type: "text" },
            { label: "Student ID", value: student.studentID, type: "text" },
            { label: "Email", value: student.contactInfo.email, type: "email" },
            { label: "Contact No", value: student.contactInfo.contactNo, type: "tel" },
            { label: "Academic Level", value: student.studentProfile.academicLevel, type: "text" },
            { label: "Program and Year/Section", value: student.studentProfile.programAndSection, type: "text" },
            { label: "Gender", value: student.studentProfile.gender, type: "text" },
            { label: "Birth Date", value: student.studentProfile.birthday, type: "date" },
            { label: "Address", value: student.contactInfo.address.permanentAddress, type: "text" },
            { label: "Emergency Contact", value: student.familyBackground.emergency.name, type: "text" },
            { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo, type: "tel" },
            { label: "Health Condition/s", value: student.health.illness, type: "text" },
        ],
        "Personal Information": [
            { label: "Full Name", value: student.studentProfile.studentName, type: "text" },
            { label: "Nickname", value: student.studentProfile.nickname, type: "text" },
            { label: "Student ID", value: student.studentID, type: "text" },
            { label: "Academic Level", value: student.studentProfile.academicLevel, type: "text" },
            { label: "Program and Year/Section", value: student.studentProfile.programAndSection, type: "text" },
            { label: "Gender", value: student.studentProfile.gender, type: "text" },
            { label: "Birth Date", value: student.studentProfile.birthday, type: "date" },
            { label: "Nationality", value: student.studentProfile.nationality, type: "text" },
            { label: "Religion", value: student.studentProfile.religion, type: "text" },
            { label: "Status", value: student.studentProfile.status, type: "text" },
        ],
        "Contact Information": [
            { label: "Mobile Phone No.", value: student.contactInfo.contactNo, type: "tel" },
            { label: "Email Address", value: student.contactInfo.email, type: "email" },
            { label: "Home No.", value: student.contactInfo.homeNo, type: "tel" },
            { label: "Present Address", value: student.contactInfo.address.currentAddress, type: "text" },
            { label: "Permanent Address", value: student.contactInfo.address.permanentAddress, type: "text" },
            { label: "Provincial Address", value: student.contactInfo.address.provincialAddress, type: "text" },
            { label: "Work No.", value: student.contactInfo.workNo, type: "tel" },
            { label: "Emergency Contact", value: student.familyBackground.emergency.name, type: "text" },
            { label: "Emergency Contact Number", value: student.familyBackground.emergency.contactNo, type: "tel" },
        ],
        "Family Background": [
            { label: "Father's Name", value: student.familyBackground.fatherInfo.name, type: "text" },
            { label: "Father's Age", value: student.familyBackground.fatherInfo.age, type: "number" },
            { label: "Father's Birth Date", value: student.familyBackground.fatherInfo.birthday, type: "date" },
            { label: "Father's Nationality", value: student.familyBackground.fatherInfo.nationality, type: "text" },
            { label: "Father's Religion", value: student.familyBackground.fatherInfo.religion, type: "text" },
            { label: "Father's Educational Attainment", value: student.familyBackground.fatherInfo.educationalAttainment, type: "text" },
            { label: "Father's Occupation", value: student.familyBackground.fatherInfo.occupation, type: "text" },
            { label: "Father's Contact No.", value: student.familyBackground.fatherInfo.contactNo, type: "tel" },
            { label: "Father's Email Address", value: student.familyBackground.fatherInfo.email, type: "email" },
            { label: "Mother's Name", value: student.familyBackground.motherInfo.name, type: "text" },
            { label: "Mother's Age", value: student.familyBackground.motherInfo.age, type: "number" },
            { label: "Mother's Birth Date", value: student.familyBackground.motherInfo.birthday, type: "date" },
            { label: "Mother's Nationality", value: student.familyBackground.motherInfo.nationality, type: "text" },
            { label: "Mother's Religion", value: student.familyBackground.motherInfo.religion, type: "text" },
            { label: "Mother's Educational Attainment", value: student.familyBackground.motherInfo.educationalAttainment, type: "text" },
            { label: "Mother's Occupation", value: student.familyBackground.motherInfo.occupation, type: "text" },
            { label: "Mother's Contact No.", value: student.familyBackground.motherInfo.contactNo, type: "tel" },
            { label: "Mother's Email Address", value: student.familyBackground.motherInfo.email, type: "email" },
            { label: "Status of Parents", value: student.familyBackground.statusOfParent, type: "text" },
            { label: "Name of Guardian", value: student.familyBackground.guardian.name, type: "text" },
            { label: "Type of Relation with Guardian", value: student.familyBackground.guardian.relation, type: "text" },
            { label: "Guardian's Contact No.", value: student.familyBackground.guardian.contactNo, type: "tel" },
            { label: "Guardian's Email Address", value: student.familyBackground.guardian.email, type: "email" },
            { label: "Parent/Guardian's Address", value: student.familyBackground.address, type: "text" },
            { label: "Siblings", value: student.familyBackground.siblings.join(", "), type: "text" },
            { label: "Siblings Count", value: student.familyBackground.siblings.length, type: "number" },
            { label: "Birth Order", value: student.familyBackground.birthOrder, type: "text" },
        ],
        "Educational Background": [
            { label: "Name of Grade School", value: student.educationalBackground.elementary.schoolName, type: "text" },
            { label: "Years Attended (From-To)", value: student.educationalBackground.elementary.dateEnrolled, type: "text" },
            { label: "Name of Junior High School", value: student.educationalBackground.juniorHighSchool.schoolName, type: "text" },
            { label: "Years Attended (From-To)", value: student.educationalBackground.juniorHighSchool.dateEnrolled, type: "text" },
            { label: "Name of Senior High School", value: student.educationalBackground.seniorHighSchool.schoolName, type: "text" },
            { label: "Years Attended (From-To)", value: student.educationalBackground.seniorHighSchool.dateEnrolled, type: "text" },
            { label: "Name of College (For Transferees)", value: student.educationalBackground.college.schoolName, type: "text" },
            { label: "Years Attended (From-To)", value: student.educationalBackground.college.dateEnrolled, type: "text" },
            { label: "Extra Curricular Activities from Previous School", value: student.educationalBackground.extraCurricular, type: "text" },
            { label: "Awards/Citations received", value: student.educationalBackground.awards, type: "text" },
            { label: "Most liked subject/s in school", value: student.educationalBackground.likedSubject, type: "text" },
            { label: "Least liked subject/s in school", value: student.educationalBackground.leastSubject, type: "text" },
        ],
        "Work Experience": [
            { label: "Name of Company/Institution", value: student.workExperience.name, type: "text" },
            { label: "Duration (From-To)", value: student.workExperience.duration, type: "text" },
            { label: "Job Description", value: student.workExperience.description, type: "text" },
            { label: "Company Contact No.", value: student.workExperience.contactNo, type: "tel" },
            { label: "Company Email Address", value: student.workExperience.email, type: "email" },
        ],
        "Interest and Recreational Activities": [
            { label: "Sports", value: student.interests.sports, type: "text" },
            { label: "Hobbies", value: student.interests.hobbies, type: "text" },
            { label: "Talents", value: student.interests.talents, type: "text" },
            { label: "Socio-civic", value: student.interests.socioCivic, type: "text" },
            { label: "Organizations Involved", value: student.interests.organization, type: "text" },
        ],
        "Health": [
            { label: "Hospitalized", value: student.health.hospitalized, type: "text" },
            { label: "Reason", value: student.health.reason, type: "text" },
            { label: "Operation", value: student.health.operation, type: "text" },
            { label: "Illness/Condition", value: student.health.illness, type: "text" },
            { label: "Medical Certificate", value: student.health.medicalCert, type: "text" },
            { label: "Take Prescribed Drugs", value: student.health.prescribedDrug, type: "text" },
            { label: "Hereditary Illness", value: student.health.hereditary, type: "text" },
            { label: "Last saw a Doctor", value: student.health.doctorLastSeen, type: "date" },
        ],
        "Life Circumstances": [
            { label: "Recent Loss", value: student.lifeCircumstances.recentLoss, type: "text" },
            { label: "Current Concern", value: student.lifeCircumstances.currentConcern, type: "text" },
        ],
    };

    // Array of field labels na naka lock at bawal i-edit
    // The labels must match the keys in the `categories` object exactly.
    const lockedFields = [
      'Student ID',
      'Full Name', 
      'Permanent Address',
      'Emergency Contact',
      'Emergency Contact Number',
      'Birth Date',
      'Gender',
      'Program and Year/Section',
      'Academic Level'
    ];

    // PAGINATION LOGIC
    const itemsPerPage = 7;
    const [selectedCategory, setSelectedCategory] = useState("Basic Information");
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(categories[selectedCategory]);

    React.useEffect(() => {
        setFormData(categories[selectedCategory]);
        setCurrentPage(1);
    }, [selectedCategory]);

    const currentItems = formData || [];
    const totalPages = Math.ceil(currentItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    const handleChange = (index, value) => {
        const updated = [...formData];
        updated[index].value = value;
        setFormData(updated);
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setFormData(categories[selectedCategory]);
        setIsEditing(false);
    };

    return (
        <div className="animate-fade-in min-h-screen flex flex-col items-center pt-4 font-sans">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
                {/* Header */}
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Profile</h2>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">{student.studentName}</h3>
                    <p className="text-sm text-gray-700">{student.studentID}</p>
                    <p className="text-sm text-gray-700">{student.program}</p>
                </div>

                {/* Category Dropdown */}
                <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.keys(categories).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
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
                        // Check if the current field is in the list of locked fields
                        const isLocked = lockedFields.includes(item.label);
                        return (
                            <div key={idx} className="flex flex-col bg-gray-50 p-3 rounded shadow-sm">
                                <label className="text-sm font-semibold text-gray-700 mb-1">{item.label}</label>
                                {/* Render input only if editing and the field is not locked */}
                                {isEditing && !isLocked ? (
                                    <input
                                        type={item.type}
                                        value={item.value}
                                        onChange={(e) => handleChange(startIndex + idx, e.target.value)}
                                        className={inputClasses}
                                    />
                                ) : (
                                    // Otherwise, always display as a static paragraph
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
                            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
};
