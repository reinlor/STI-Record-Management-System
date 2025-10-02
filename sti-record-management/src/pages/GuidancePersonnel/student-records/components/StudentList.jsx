import axios from "axios";
import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    Users,
    Search,
    X,
    ChevronDown,
    SlidersHorizontal,
    UserPlus,
    Users as UsersIcon,
    Camera,
    Edit,
    FileText,
    Archive as FileArchive,
    ArrowRightLeft,
    Building,
    GraduationCap,
    Download,
    ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import InfoSection from "./InfoSection";
import { fieldDefinitions, normalizeForUI } from "./StudentUtils";
import AddStudentModal from "./AddStudentModal";
import BulkModal from "./BulkModal";
import PhotoToTextModal from "./PhotoToTextModal";
import ArchiveConfirmModal from "./ArchiveConfirmModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ViolationPanel from "./ViolationPanel";
import CasesTable from "./CasesTable";
import LoadingDots from "../../../../component/Loading";

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const GENDER_OPTIONS = [
    { value: "all", label: "Both Genders" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
];

const INFO_TYPES = [
    { key: "basic", label: "Basic" },
    { key: "personal", label: "Personal" },
    { key: "contact", label: "Contact" },
    { key: "family", label: "Family" },
    { key: "educational", label: "Educational" },
    { key: "work", label: "Work" },
    { key: "interests", label: "Interests" },
    { key: "health", label: "Health" },
    { key: "life", label: "Life" },
    { key: "violation", label: "Violation" }
];

function StudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Student Cases
    const [showCasesView, setShowCasesView] = useState(false);

    // UI state
    const [activeLevel, setActiveLevel] = useState("shs");
    const [search, setSearch] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("all");
    const [selectedSection, setSelectedSection] = useState("all");
    const [selectedGender, setSelectedGender] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // For dropdown options
    const [programOptions, setProgramOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStudent, setModalStudent] = useState(null);

    // Add Student Modal state
    const [showAddMode, setShowAddMode] = useState(null); // 'individual', 'bulk', 'photo'
    const [showArchiveModal, setShowArchiveModal] = useState(false);

    // Info section state
    const [infoType, setInfoType] = useState("basic");
    const [isEditing, setIsEditing] = useState(false);
    const [editedStudentData, setEditedStudentData] = useState(null);

    // Transfer modal state
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferProgram, setTransferProgram] = useState("");
    const [transferSection, setTransferSection] = useState("");

    // Add Student Form state
    const initialNewStudentFormState = {
        fullName: "",
        studentNumber: "",
        emailAddress: "",
        gradeYearLevel: "",
        programStrand: "",
        section: "",
        birthDate: "",
        age: "",
        gender: "",
        mobileNo: "",
        address: "",
        emergencyContact: "",
        contactNo: "",
        healthCondition: "",
        profileImage: null,
    };
    const [newStudentForm, setNewStudentForm] = useState(initialNewStudentFormState);

    // Download Excel logic
    const [showDownloadForm, setShowDownloadForm] = useState(false);
    const [downloadSHS, setDownloadSHS] = useState(true);
    const [downloadCollege, setDownloadCollege] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    
    // Fetch students and filter options
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/student/');
                setStudents(res.data || []);
                // Extract unique programs and sections for dropdowns
                const progs = new Set();
                const sects = new Set();
                (res.data || []).forEach(stu => {
                    const prog = stu.studentProfile?.program;
                    const sect = stu.studentProfile?.section;
                    if (prog) progs.add(prog);
                    if (sect) sects.add(sect);
                });
                setProgramOptions(["all", ...Array.from(progs)]);
                setSectionOptions(["all", ...Array.from(sects)]);
            } catch (err) {
                setError(err);
                toast.error('Error loading students.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    if (loading) {
        return <LoadingDots />
    }

    // Filtering logic
    const filtered = students.filter(student => {
        const profile = student.studentProfile || {};
        // Academic Level
        if (activeLevel === "shs" && profile.academicLevel === "Tertiary") return false;
        if (activeLevel === "college" && profile.academicLevel !== "Tertiary") return false;
        // Search
        const searchStr = (profile.name || "") + (student.sid || "");
        if (search && !searchStr.toLowerCase().includes(search.toLowerCase())) return false;
        // Program
        if (selectedProgram !== "all" && profile.program !== selectedProgram) return false;
        // Section
        if (selectedSection !== "all" && profile.section !== selectedSection) return false;
        // Gender
        if (selectedGender !== "all" && profile.gender !== selectedGender) return false;
        // Status
        if (selectedStatus !== "all") {
            if (selectedStatus === "active" && student.isArchived) return false;
            if (selectedStatus === "inactive" && !student.isArchived) return false;
        }
        return true;
    });

    // Responsive: get filtered program/strand and section options
    const filteredProgramOptions = (() => {
        // Only show programs/strands for the selected academic level
        const progs = new Set();
        students.forEach(stu => {
            const profile = stu.studentProfile || {};
            if (
                (activeLevel === "shs" && profile.academicLevel !== "Tertiary") ||
                (activeLevel === "college" && profile.academicLevel === "Tertiary")
            ) {
                if (profile.program) progs.add(profile.program);
            }
        });
        return ["all", ...Array.from(progs)];
    })();

    const filteredSectionOptions = (() => {
        // Only show sections for the selected program/strand and academic level
        const sects = new Set();
        students.forEach(stu => {
            const profile = stu.studentProfile || {};
            if (
                (activeLevel === "shs" && profile.academicLevel !== "Tertiary") ||
                (activeLevel === "college" && profile.academicLevel === "Tertiary")
            ) {
                if (
                    (selectedProgram === "all" || profile.program === selectedProgram) &&
                    profile.section
                ) {
                    sects.add(profile.section);
                }
            }
        });
        return ["all", ...Array.from(sects)];
    })();

    // Table columns for large screens
    const columns = [
        { label: "Student ID", key: "sid", show: "lg" },
        { label: "Name", key: "name", show: "all" },
        { label: "Gender", key: "gender", show: "lg" },
        { label: "Program & Section", key: "progsect", show: "all" },
        { label: "Status", key: "status", show: "all" },
    ];

    // For "Showing X results of Y total"
    const totalCount = students.filter(student => {
        const profile = student.studentProfile || {};
        if (activeLevel === "shs" && profile.academicLevel === "Tertiary") return false;
        if (activeLevel === "college" && profile.academicLevel !== "Tertiary") return false;
        return true;
    }).length;

    // Colors
    const blue = "#0172bd";
    const grayBg = "bg-gray-100";
    const whiteBg = "bg-white";
    const labelClass = "text-3xl font-bold text-[#0172bd] flex items-center gap-2";
    const filterLabel = "text-xs font-semibold text-gray-500 mb-1 ml-1";
    const dropdownClass = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0172bd] focus:border-transparent bg-white text-[#0172bd] text-sm appearance-none pr-8";
    const tableHeaderClass = "bg-[#0172bd] text-white font-bold px-4 py-2";
    const tableCellClass = "px-4 py-3 whitespace-nowrap";
    const tableRowClass = "hover:bg-gray-100 transition cursor-pointer";

    // Clear filters
    const clearFilters = () => {
        setSearch("");
        setSelectedProgram("all");
        setSelectedSection("all");
        setSelectedGender("all");
        setSelectedStatus("all");
    };

    // Modal open handler
    const openStudentModal = (student) => {
        setModalStudent(student);
        setEditedStudentData(JSON.parse(JSON.stringify(student)));
        setInfoType("basic");
        setIsEditing(false);
        setModalOpen(true);
    };

    // Modal close handler
    const closeStudentModal = () => {
        setModalOpen(false);
        setModalStudent(null);
        setIsEditing(false);
        setShowCasesView(false);
    };

    // Add Student Button Handlers
    const handleAddIndividual = () => setShowAddMode('individual');
    const handleAddBulk = () => setShowAddMode('bulk');
    const handleAddPhoto = () => setShowAddMode('photo');
    const closeAddModal = () => setShowAddMode(null);

    // --- Functions from StudentRecords for modal actions ---
    // Edit
    const handleEdit = () => setIsEditing(true);
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedStudentData(JSON.parse(JSON.stringify(modalStudent)));
    };

    const handleSaveEdit = async () => {
        try {
            const { id, ...updatedData } = editedStudentData;
            await axios.put(`/student/update/${modalStudent.id}`, updatedData);
            setStudents(students =>
                students.map(s =>
                    s.id === modalStudent.id ? editedStudentData : s
                )
            );
            setIsEditing(false);
            setModalStudent(editedStudentData);
            toast.success("Changes saved successfully!");
        } catch (err) {
            toast.error("Failed to update student.");
        }
    };

    // Archive
    const handleArchive = async () => {
        if (!modalStudent) return;
        try {
            await axios.put(`/student/archiveData/${modalStudent.id}`);
            setStudents(students =>
                students.map(s =>
                    s.id === modalStudent.id ? { ...s, isArchived: true } : s
                )
            );
            setShowArchiveModal(false);
            closeStudentModal();
            toast.success("Student archived successfully!");
        } catch (err) {
            toast.error("Failed to archive student.");
        }
    };

    // Restore
    const handleRestore = async () => {
        if (!modalStudent) return;
        try {
            await axios.put(`/student/restoreData/${modalStudent.id}`);
            setStudents(students =>
                students.map(s =>
                    s.id === modalStudent.id ? { ...s, isArchived: false } : s
                )
            );
            setShowArchiveModal(false);
            closeStudentModal();
            toast.success("Student restored successfully!");
        } catch (err) {
            toast.error("Failed to restore student.");
        }
    };


    // Case
    const handleCaseButton = () => {
        setShowCasesView(s => !s);

        if (isEditing) setIsEditing(false);
    };

    // Info field change
    const handleFieldChange = (category, field, value) => {
        setEditedStudentData(prev => {
            const updated = { ...prev };
            // Use updateRawField if you want deep update, or just shallow for demo
            if (!updated[category]) updated[category] = {};
            updated[category][field] = value;
            return updated;
        });
    };

    // Helper function for Violation Panel
    const updateEditedStudent = (path, value) => {
        setEditedStudentData((prev) => {
            const next = JSON.parse(JSON.stringify(prev || {}));
            const parts = path.split('.');
            let cur = next;
            for (let i = 0; i < parts.length - 1; i++) {
                const p = parts[i];
                if (cur[p] === undefined || cur[p] === null) cur[p] = {};
                cur = cur[p];
            }
            cur[parts[parts.length - 1]] = value;
            return next;
        });
    };

    // helper to replace entire violations object on editedStudentData
    const replaceEditedStudentViolations = (newViolations) => {
        setEditedStudentData((prev) => ({ ...(prev || {}), violations: newViolations }));
    };

    // Transfer
    const handleTransfer = async () => {
        if (!modalStudent) return;
        try {
            await axios.put(`/student/transfer/${modalStudent._id}`, {
                program: transferProgram,
                section: transferSection,
            });
            setStudents(students =>
                students.map(s =>
                    s._id === modalStudent._id
                        ? {
                            ...s,
                            studentProfile: {
                                ...s.studentProfile,
                                program: transferProgram,
                                section: transferSection,
                            },
                        }
                        : s
                )
            );
            setShowTransferModal(false);
            closeStudentModal();
        } catch (err) {
            alert("Failed to transfer student.");
        }
    };

    // Add Student Form handlers
    const handleNewStudentFormChange = (e) => {
        const { name, value, type, files } = e.target;
        setNewStudentForm((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value,
        }));
    };
    const clearForm = () => setNewStudentForm(initialNewStudentFormState);

    // Pagination logic
    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pagedStudents = filtered.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Download Excel logic (all info types)
    const handleDownload = () => {
        let data = [];
        if (downloadSHS) {
            data = data.concat(
                students.filter(
                    s => s.studentProfile?.academicLevel !== "Tertiary"
                )
            );
        }
        if (downloadCollege) {
            data = data.concat(
                students.filter(
                    s => s.studentProfile?.academicLevel === "Tertiary"
                )
            );
        }
        if (data.length === 0) {
            alert("Please select at least one group to download.");
            return;
        }
        // Gather all info types for each student
        const excelData = data.map(s => {
            const info = normalizeForUI(s);
            return {
                "Student ID": s.sid,
                "Name": s.studentProfile?.name,
                "Gender": s.studentProfile?.gender,
                "Program": s.studentProfile?.program,
                "Section": s.studentProfile?.section,
                "Academic Level": s.studentProfile?.academicLevel,
                "Status": s.isArchived ? "Inactive" : "Active",
                "Email": info.basic?.emailAddress,
                "Contact No": info.basic?.mobilePhoneNumber,
                // Basic
                "Birth Date": info.basic?.birthDate,
                "Personal Place of Birth": info.personal?.birthDate,
                "Address": info.basic?.address,
                "Health Condition": info.basic?.healthCondition,
                "Emergency Contact": info.basic?.emergencyContact,
                // Personal
                "Religion": info.personal?.religion,
                "Civil Status": info.personal?.status,
                "Personal Nationality": info.personal?.nationality,
                // Contact
                "Mobile No": info.contact?.mobilePhoneNumber,
                "Home No": info.contact?.homeNumber,
                "Contact Address": info.contact?.presentAddress,
                // Family
                "Father Name": info.family?.fatherName,
                "Father Occupation": info.family?.fatherOccupation,
                "Mother Name": info.family?.motherName,
                "Mother Occupation": info.family?.motherOccupation,
                "Guardian Name": info.family?.nameOfGuardian,
                "Guardian Contact": info.family?.guardianContactNumber,
                // Educational
                "Elementary School": info.educational?.nameOfGradeSchool,
                "Elementary Year Graduated": info.educational?.yearsAttendedGradeSchool,
                "Junior High School": info.educational?.nameOfJuniorHighSchool,
                "Junior High Year Graduated": info.educational?.yearsAttendedJuniorHighSchool,
                "Senior High School": info.educational?.nameOfSeniorHighSchool,
                "Senior High Year Graduated": info.educational?.yearsAttendedSeniorHighSchool,
                "College School": info.educational?.nameOfCollege,
                "College Year Graduated": info.educational?.yearsAttendedCollege,
                // Work
                "Work Company": info.work?.nameOfCompanyInstitution,
                "Work description": info.work?.jobDescription,
                "Work Years": info.work?.durationFromTo,
                // Interests
                "Sports": info.interests?.sports,
                "Hobbies": info.interests?.hobbies,
                "Talents": info.interests?.talents,
                "Socio Civic": info.interests?.socioCivic,
                "Organization": info.interests?.organizationsInvolved,
                // Health
                "Hospitalized": info.health?.hospitalized,
                "Reason of Hospitalization": info.health?.reason,
                "Undergo an Operation": info.health?.operation,
                "Health Condition": info.health?.illnessCondition,
                "Medical Certificate": info.health?.medicalCertificate,
                "Prescribed Drugs": info.health?.takePrescribedDrugs,
                "Heriditary Illness": info.health?.hereditaryIllness,
                "Last Saw Doctor": info.health?.lastSawDoctor,
                // Life
                "Recent Loss": info.life?.recentLoss,
                "Current Concerns": info.life?.currentConcern,
                // Violations
            };
        });
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "student_list.xlsx");
        setShowDownloadForm(false);
    };

    return (
        <div className={`${grayBg} h-full flex flex-col pb-3`}>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {/* Top bar */}
            <div className="flex items-center gap-2 p-4 pb-2">
                {/* SHS/College Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${activeLevel === "shs"
                            ? "bg-[#0172bd] text-white shadow"
                            : "bg-white text-[#0172bd] hover:bg-blue-100"} `}
                        onClick={() => setActiveLevel("shs")}
                    >
                        Senior High School
                        <Building className="w-5 h-5 ml-2" />
                    </button>
                    <button
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${activeLevel === "college"
                            ? "bg-[#0172bd] text-white shadow"
                            : "bg-white text-[#0172bd] hover:bg-blue-100"} `}
                        onClick={() => setActiveLevel("college")}
                    >
                        College
                        <GraduationCap className="w-6 h-6 ml-2" />
                    </button>
                    {/* Download Button */}
                    <button
                        className="flex items-center px-4 py-2 rounded-lg font-semibold bg-[#0172bd] text-white hover:bg-blue-500 ml-2 transition"
                        onClick={() => setShowDownloadForm(f => !f)}
                        title="Download Student List"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                    </button>
                </div>
            </div>
            {/* Download Form */}
            {showDownloadForm && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 mb-2">
                    <label className="flex items-center gap-2 font-semibold text-[#0172bd]">
                        <input
                            type="checkbox"
                            checked={downloadSHS}
                            onChange={e => setDownloadSHS(e.target.checked)}
                        />
                        Senior High School
                    </label>
                    <label className="flex items-center gap-2 font-semibold text-[#0172bd]">
                        <input
                            type="checkbox"
                            checked={downloadCollege}
                            onChange={e => setDownloadCollege(e.target.checked)}
                        />
                        College
                    </label>
                    <button
                        className="flex items-center px-4 py-2 rounded-lg font-semibold bg-[#0172bd] text-white hover:bg-blue-500 transition"
                        onClick={handleDownload}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download Excel
                    </button>
                    <button
                        className="ml-auto text-gray-400 hover:text-gray-600"
                        onClick={() => setShowDownloadForm(false)}
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Main panel */}
            <div className={`${whiteBg} rounded-xl shadow-lg mx-2 sm:mx-4 flex-1 flex flex-col p-2 sm:p-6`} style={{ maxWidth: "100vw" }}>
                {/* Label, Add Buttons, and Search */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                        <div className={labelClass}>
                            <Users className="w-8 h-8" />
                            Student List
                        </div>
                        {/* Search bar aligned with label, right side */}
                        <div className="flex gap-2 w-full md:w-auto md:justify-end md:items-center">
                            <div className="relative flex-1 max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search Name/ID"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] focus:border-transparent text-sm"
                                    style={{ minWidth: 0 }}
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                            </div>
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-[#0172bd] rounded-lg font-semibold text-sm"
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                    {/* Add Student Buttons */}
                    <div className="flex gap-2 mt-2 mb-2 flex-wrap">
                        <button
                            className="flex items-center gap-1 px-3 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow"
                            onClick={handleAddIndividual}
                        >
                            <UserPlus className="w-4 h-4" />
                            Individual
                        </button>
                        <button
                            className="flex items-center gap-1 px-3 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow"
                            onClick={handleAddBulk}
                        >
                            <UsersIcon className="w-4 h-4" />
                            Bulk
                        </button>
                        <button
                            className="flex items-center gap-1 px-3 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow"
                            onClick={handleAddPhoto}
                        >
                            <Camera className="w-4 h-4" />
                            Photo To Text
                        </button>
                    </div>
                    {/* Showing X results of Y total */}
                    <div className="text-sm text-gray-500 mt-1 ml-1">
                        Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""} of {totalCount} total
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 w-full max-w-full">
                    {/* Program/Strand */}
                    <div>
                        <div className={filterLabel}>Program/Strand</div>
                        <div className="relative">
                            <select
                                className={dropdownClass}
                                value={selectedProgram}
                                onChange={e => setSelectedProgram(e.target.value)}
                            >
                                <option value="all">All Programs</option>
                                {filteredProgramOptions.filter(opt => opt !== "all").map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                        </div>
                    </div>
                    {/* Section */}
                    <div>
                        <div className={filterLabel}>Section</div>
                        <div className="relative">
                            <select
                                className={dropdownClass}
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                            >
                                <option value="all">All Sections</option>
                                {filteredSectionOptions.filter(opt => opt !== "all").map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                        </div>
                    </div>
                    {/* Gender */}
                    <div>
                        <div className={filterLabel}>Gender</div>
                        <div className="relative">
                            <select
                                className={dropdownClass}
                                value={selectedGender}
                                onChange={e => setSelectedGender(e.target.value)}
                            >
                                {GENDER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                        </div>
                    </div>
                    {/* Status */}
                    <div>
                        <div className={filterLabel}>Status</div>
                        <div className="relative">
                            <select
                                className={dropdownClass}
                                value={selectedStatus}
                                onChange={e => setSelectedStatus(e.target.value)}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div
                    className="mt-6 overflow-x-auto rounded-lg shadow"
                    style={{
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100vw",
                    }}
                >
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                {/* Responsive columns */}
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className={
                                            tableHeaderClass +
                                            (col.show === "lg"
                                                ? " hidden lg:table-cell"
                                                : "")
                                        }
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-red-500">
                                        Error loading students.
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                pagedStudents.map(student => {
                                    const profile = student.studentProfile || {};
                                    return (
                                        <tr
                                            key={student.sid}
                                            className={tableRowClass}
                                            onClick={() => openStudentModal(student)}
                                        >
                                            {/* Student ID (large screens only) */}
                                            <td className={tableCellClass + " hidden lg:table-cell"}>{student.sid}</td>
                                            {/* Name */}
                                            <td className={tableCellClass}>{profile.name}</td>
                                            {/* Gender (large screens only) */}
                                            <td className={tableCellClass + " hidden lg:table-cell"}>{profile.gender}</td>
                                            {/* Program & Section */}
                                            <td className={tableCellClass}>{profile.program} {profile.section}</td>
                                            {/* Status */}
                                            <td className={tableCellClass}>
                                                {student.isArchived ? (
                                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Inactive</span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">Active</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>
                {/* Pagination controls */}
                <div className="w-full flex justify-center lg:justify-end items-center mt-2 pr-0 lg:pr-2">
                    <nav className="flex items-center space-x-1">
                        <button
                            className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-5 h-5 object-cover rounded" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0172bd] text-white' : 'hover:bg-gray-200 text-[#0172bd]'}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5 object-cover rounded" />
                        </button>
                    </nav>
                </div>
            </div>

            {/* Student Modal */}
            {modalOpen && modalStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div
                        className={`
                            bg-white rounded-2xl shadow-2xl
                            w-[98vw] max-w-[98vw] h-[98vh] max-h-[98vh]
                            md:w-[90vw] md:max-w-[900px] md:h-[90vh] md:max-h-[900px]
                            lg:w-[95vw] lg:max-w-[1600px] lg:h-[90vh] lg:max-h-[900px]
                            flex flex-col p-3 sm:p-4 md:p-6 relative overflow-y-auto custom-scrollbar
                        `}
                        style={{
                            minWidth: 0,
                        }}
                    >
                        {/* Close button always top right */}
                        <button
                            className="absolute top-11 right-5 text-[#0172bd] hover:text-blue-500 transition-transform hover:scale-110 "
                            onClick={closeStudentModal}
                        >
                            <X className="w-8 h-8 sm:w-10 sm:h-10" />
                        </button>
                        {/* Header: Name, SID, Buttons aligned right */}
                        <div className="flex flex-col gap-2 mb-4 mt-2 mr-15">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                {/* Name and SID */}
                                <div className="flex items-center gap-3 flex-shrink min-w-0">
                                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#0172bd] flex-shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0172bd] break-words truncate md:break-normal md:whitespace-normal" style={{ maxWidth: "70vw" }}>
                                            {modalStudent.studentProfile?.name}
                                        </div>
                                        <div className="text-gray-500 text-sm sm:text-base md:text-lg break-all">{modalStudent.sid}</div>
                                    </div>
                                </div>
                                {/* Buttons aligned right with name */}
                                <div className="flex gap-2 mt-2 md:mt-0 flex-wrap justify-start md:justify-end">
                                    <button
                                        className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm sm:text-base shadow"
                                        onClick={isEditing ? handleSaveEdit : handleEdit}
                                    >
                                        <Edit className="w-5 h-5" />
                                        {isEditing ? "Save" : "Edit Student"}
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm sm:text-base shadow"
                                        onClick={handleCaseButton}
                                    >
                                        <FileText className="w-5 h-5" />
                                        {showCasesView ? "Go Back" : "Case"}
                                    </button>
                                    <button
                                        className={`flex items-center gap-1 px-3 sm:px-4 py-2 
                                                    ${modalStudent.isArchived
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-red-600 hover:bg-red-700"} 
                                                    text-white rounded-lg font-semibold text-sm sm:text-base shadow`}
                                        onClick={() => setShowArchiveModal(true)}
                                    >
                                        <FileArchive className="w-5 h-5" />
                                        {modalStudent.isArchived ? "Restore" : "Archive"}
                                    </button>

                                </div>
                            </div>
                            {/* Info type tabs under name and student number */}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {INFO_TYPES.map(type => (
                                    <button
                                        key={type.key}
                                        className={`px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm transition
                                            ${infoType === type.key
                                                ? "bg-[#0172bd] text-white"
                                                : "bg-gray-100 text-[#0172bd] hover:bg-blue-100"}`}
                                        onClick={() => setInfoType(type.key)}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Info Section */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                            {showCasesView ? (
                                <CasesTable studentId={modalStudent._id || modalStudent.id || modalStudent.sid} />
                            ) : infoType === "violation" ? (
                                <ViolationPanel
                                    rawStudent={isEditing ? editedStudentData : modalStudent}
                                    isEditing={isEditing}
                                    updateEditedStudent={updateEditedStudent}
                                    replaceEditedStudentViolations={replaceEditedStudentViolations}
                                />
                            ) : (
                                <InfoSection
                                    infoType={infoType}
                                    student={normalizeForUI(isEditing ? editedStudentData : modalStudent)[infoType]}
                                    isEditing={isEditing}
                                    onFieldChange={handleFieldChange}
                                />
                            )}

                            {isEditing && !showCasesView && (
                                <div className="flex gap-2 mt-6">
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-[#0172bd] hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
                                        onClick={handleSaveEdit}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                    {/* Archive Confirm Modal */}
                    <ArchiveConfirmModal
                        visible={showArchiveModal}
                        onCancel={() => setShowArchiveModal(false)}
                        onConfirm={modalStudent?.isArchived ? handleRestore : handleArchive}
                        todo={modalStudent?.isArchived ? "restore" : "archive"}
                    />
                </div>
            )}

            {/* Add Student Modal */}
            <AddStudentModal
                visible={showAddMode === "individual"}
                onClose={closeAddModal}
                newStudentForm={newStudentForm}
                handleNewStudentFormChange={handleNewStudentFormChange}
                clearForm={clearForm}
            />
            <BulkModal
                visible={showAddMode === "bulk"}
                onClose={closeAddModal}
            />
            <PhotoToTextModal
                visible={showAddMode === "photo"}
                onClose={closeAddModal}
                onOCRSuccess={data => {
                    // Prefill form with OCR data if needed
                }}
            />
        </div>
    );
}

export default StudentList;


