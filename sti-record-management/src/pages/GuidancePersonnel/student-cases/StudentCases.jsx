import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import axios from "axios";
import {
    Users,
    Search,
    SlidersHorizontal,
    Plus,
    FileText,
    FileCheck,
    Clock,
    X,
    Edit as Pencil,
    Archive,
    ChevronLeft,
    ChevronRight,
    Building,
    GraduationCap
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCaseModal from "./components/AddCaseModal.jsx";
import CaseInfoSection from "./components/CaseInfoSection.jsx";
import {
    serverViolationToUIDetails,
    uiDetailsToServerPayload,
} from "./components/CaseUtils.jsx";
import LoadingDots from "../../../component/Loading.jsx";

const TABS = [
    { value: "On-going", label: "On-going", icon: <Clock className="w-5 h-5 ml-1" /> },
    { value: "Resolved", label: "Resolved", icon: <FileCheck className="w-5 h-5 ml-1" /> },
];

const PRIORITY_LEVELS = [
    { value: "", label: "No Priority" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
    { value: "3", label: "Level 3" },
];

function StudentCases() {
    const { authData } = useContext(AuthContext);

    // State
    const [cases, setCases] = useState([]);
    const [caseDetailsMap, setCaseDetailsMap] = useState({});
    const [activeTab, setActiveTab] = useState("On-going");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState("caseDetails");
    const [editedCaseData, setEditedCaseData] = useState(null);
    const [activeLevel, setActiveLevel] = useState("shs"); // <-- Add this line
    const [loading, setLoading] = useState(true);

    // Add Case Form
    const [newCaseForm, setNewCaseForm] = useState({
        studentName: "",
        studentId: "",
        programSection: "",
        dateOfInitiation: "",
        timeOfInitiation: "",
        counselingTypeCategory: "",
        detailedDescription: "",
        proofDescription: "",
        proofImage: null,
        actions: "",
        dateOfAction: "",
        caseStatus: "On-going",
        counselorNotes: "",
        violation: ''
    });

    const handleNewCaseChange = (eOrObj) => {
        if (eOrObj?.target) {
            const { name, value, files } = eOrObj.target;

            if (files && files.length > 0) {
                setNewCaseForm(prev => ({
                    ...prev,
                    [name]: files[0],
                }));
            } else {
                setNewCaseForm(prev => ({
                    ...prev,
                    [name]: value,
                }));
            }

        } else if (eOrObj?.name) {
            const { name, value } = eOrObj;
            setNewCaseForm(prev => ({ ...prev, [name]: value }));
        }
    };


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Fetch cases
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await axios.get("/cases");
                const violations = Array.isArray(res.data) ? res.data : [];
                const list = violations.map((v) => ({
                    id: v.id,
                    studentName: v.name ?? "Unknown",
                    studentId: v.sid ?? "",
                    status: v.status ?? "On-going",
                    timeCreated: v.timeCreated,
                    programSection: v.programSection ?? "",
                    priorityLevel: v.priorityLevel ?? v.priority ?? v.caseDetails?.priority ?? "",
                }));
                const details = {};
                violations.forEach((v) => {
                    details[v.id] = v;
                });
                setCases(list);
                setCaseDetailsMap(details);
            } catch (err) {
                toast.error("Failed to fetch cases");
                setCases([]);
                setCaseDetailsMap({});
            }
            finally {
            }
        };
        fetchCases();
    }, []);

    // helper: convert various priority formats into a numeric rank (0..3)
    const getPriorityRank = (priority) => {
        if (priority == null) return 0;

        // number (1,2,3)
        if (typeof priority === "number") return priority;

        // string: "3", "Level 3", "Level 3 Safety and Security", "Level 1", etc.
        if (typeof priority === "string") {
            const numMatch = priority.match(/\b([1-3])\b/i);
            if (numMatch) return parseInt(numMatch[1], 10);

            const levelMatch = priority.match(/level\s*([1-3])/i);
            if (levelMatch) return parseInt(levelMatch[1], 10);

            return 0;
        }

        // object: maybe { value: "3" } or { label: "Level 3" }
        if (typeof priority === "object") {
            if (priority.value) {
                const v = parseInt(priority.value, 10);
                if (!isNaN(v)) return v;
            }
            if (priority.label) {
                const m = priority.label.match(/\b([1-3])\b/);
                if (m) return parseInt(m[1], 10);
            }
        }

        return 0;
    };

    const getPriorityInfo = (priority) => {
        if (!priority) return { rank: 0, label: "No Priority" };

        // If priority is numeric or string numeric
        if (typeof priority === "number" || /^\d+$/.test(priority)) {
            const num = parseInt(priority, 10);
            return { rank: num, label: `Level ${num}` };
        }

        // If string like "Level 3 Safety and Security"
        if (typeof priority === "string") {
            const match = priority.match(/([1-3])/);
            if (match) {
                const num = parseInt(match[1], 10);
                return { rank: num, label: `Level ${num}` };
            }
        }

        // If object like { value: "3" } or { label: "Level 2" }
        if (typeof priority === "object") {
            const fromValue = priority?.value || priority?.label || "";
            const match = String(fromValue).match(/([1-3])/);
            if (match) {
                const num = parseInt(match[1], 10);
                return { rank: num, label: `Level ${num}` };
            }
        }

        return { rank: 0, label: "No Priority" };
    };

    // Filtered and sorted cases
    const filteredCases = cases
        .filter((c) => {
            const matchesTab =
                (activeTab === "All" && (c.status === "On-going" || c.status === "Resolved")) ||
                c.status === activeTab;

            const matchesSearch =
                searchTerm === "" ||
                (c.studentName && c.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.studentId && c.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesTab && matchesSearch;
        })
        .sort((a, b) => {
            const rawPriorityA =
                a.priorityLevel ??
                caseDetailsMap[a.id]?.caseDetails?.priority ??
                caseDetailsMap[a.id]?.priority ??
                "";

            const rawPriorityB =
                b.priorityLevel ??
                caseDetailsMap[b.id]?.caseDetails?.priority ??
                caseDetailsMap[b.id]?.priority ??
                "";

            const { rank: priorityA } = getPriorityInfo(rawPriorityA);
            const { rank: priorityB } = getPriorityInfo(rawPriorityB);

            // Sort by priority first (3 → 1)
            if (priorityA !== priorityB) return priorityB - priorityA;

            // Then by date (newest first)
            const dateA = a.timeCreated && a.timeCreated.toDate ? a.timeCreated.toDate() : new Date(0);
            const dateB = b.timeCreated && b.timeCreated.toDate ? b.timeCreated.toDate() : new Date(0);
            return dateB - dateA;
        });


    // Pagination logic
    const totalRows = filteredCases.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pagedCases = filteredCases.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Reset to page 1 if filter/search changes and currentPage is out of bounds
    useEffect(() => {
        setLoading(true)
        if (currentPage > totalPages) setCurrentPage(1);
        setLoading(false)
    }, [totalPages, currentPage]);

    if (loading) {
        return <LoadingDots />
    }

    // Modal handlers
    const openCaseModal = (caseId) => {
        setSelectedCaseId(caseId);
        setIsEditing(false);
        setInfoType("caseDetails");
        setEditedCaseData(serverViolationToUIDetails(caseDetailsMap[caseId]));
    };
    const closeCaseModal = () => {
        setSelectedCaseId(null);
        setIsEditing(false);
    };

    // Add Case
    const handleAddCase = async (caseDataWithPriority) => {
        const dataToSave = { ...caseDataWithPriority };

        dataToSave.priorityLevel =
            (dataToSave.priorityLevels &&
                dataToSave.counselingTypeCategory &&
                typeof dataToSave.priorityLevels[dataToSave.counselingTypeCategory] === "string")
                ? dataToSave.priorityLevels[dataToSave.counselingTypeCategory]
                : "";

        if (!dataToSave.studentName || !dataToSave.studentId || !dataToSave.counselingTypeCategory) {
            toast.error("Please fill in Student Name, Student ID, and Counseling Type/Category.");
            return;
        }
        try {
            const formData = new FormData();
            Object.entries(dataToSave).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'proofImage' && value instanceof File) {
                        formData.append('proof', value, value.name);
                    } else if (key === 'proofImage' && value === null) {
                    } else {
                        formData.append(key, value);
                    }
                }
            });
            await axios.post("/cases/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Case Added Successfully!");
            setShowAddModal(false);
            setNewCaseForm({
                studentName: "",
                studentId: "",
                programSection: "",
                dateOfInitiation: "",
                timeOfInitiation: "",
                counselingTypeCategory: "",
                detailedDescription: "",
                proofDescription: "",
                proofImage: null,
                actions: "",
                dateOfAction: "",
                caseStatus: "On-going",
                counselorNotes: "",
                violation: ''
            });
            // Refresh
            const res = await axios.get("/cases");
            const violations = Array.isArray(res.data) ? res.data : [];
            const list = violations.map((v) => ({
                id: v.id,
                studentName: v.name ?? "Unknown",
                studentId: v.sid ?? "",
                status: v.status ?? "On-going",
                timeCreated: v.timeCreated,
                programSection: v.programSection ?? "",
            }));
            const details = {};
            violations.forEach((v) => {
                details[v.id] = v;
            });
            setCases(list);
            setCaseDetailsMap(details);
        } catch (err) {
            toast.error("Error adding case.");
        }
    };

    // Archive/Resolve
    const handleArchiveCase = async () => {
        if (!selectedCaseId) return;
        try {
            await axios.put(`/cases/update/${selectedCaseId}`, { status: "Resolved" });
            setCases((prev) =>
                prev.map((c) =>
                    c.id === selectedCaseId ? { ...c, status: "Resolved" } : c
                )
            );
            setCaseDetailsMap((prev) => {
                const next = { ...prev };
                if (next[selectedCaseId]) next[selectedCaseId].status = "Resolved";
                return next;
            });
            setSelectedCaseId(null);
            toast.success("Case status updated to Resolved!");
        } catch (err) {
            toast.error("Error archiving case.");
        }
    };

    // Edit
    const handleSaveEdits = async () => {
        if (!editedCaseData || !selectedCaseId) return;
        try {
            const payload = uiDetailsToServerPayload(editedCaseData);
            console.log(payload)
            await axios.put(`/cases/update/${selectedCaseId}`, payload);
            toast.success("Changes saved successfully!");
            setIsEditing(false);
            // Refresh
            const res = await axios.get("/cases");
            const violations = Array.isArray(res.data) ? res.data : [];
            const list = violations.map((v) => ({
                id: v.id,
                studentName: v.name ?? "Unknown",
                studentId: v.sid ?? "",
                status: v.status ?? "On-going",
                timeCreated: v.timeCreated,
                programSection: v.programSection ?? "",
            }));
            const details = {};
            violations.forEach((v) => {
                details[v.id] = v;
            });
            setCases(list);
            setCaseDetailsMap(details);
        } catch (err) {
            toast.error("Error saving changes.");
        }
    };

    // Info field change
    const handleCaseFieldChange = (category, field, value) => {
        setEditedCaseData((prevData) => {
            if (!prevData) return prevData;
            const newData = JSON.parse(JSON.stringify(prevData));
            if (!newData[category]) newData[category] = {};
            newData[category][field] = value;
            return newData;
        });
    };

    // Table columns for large screens
    const columns = [
        { label: "Case ID", key: "id", show: "lg" },
        { label: "Student Name", key: "studentName", show: "all" },
        { label: "Student ID", key: "studentId", show: "lg" },
        { label: "Program & Section", key: "programSection", show: "lg" },
        { label: "Priority", key: "priority", show: "all" }, // Priority column
        { label: "Status", key: "status", show: "all" },
    ];

    // Responsive filter layout
    const filterGridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2";

    return (
        <div className="bg-gray-100 h-full flex flex-col pb-3">
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

            {/* --- SHS/College buttons removed here --- */}

            {/* Header */}
            <div className={`bg-white rounded-xl shadow-lg mx-2 sm:mx-4 flex-1 flex flex-col p-2 sm:p-6`} style={{ maxWidth: "100vw" }}>

                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                        <div className="text-3xl font-bold text-[#0172bd] flex items-center gap-2">
                            <FileText className="w-8 h-8" />
                            Student Cases
                        </div>

                        {/* Search bar aligned right */}
                        <div className="flex gap-2 w-full md:w-auto md:justify-end md:items-center">
                            <div className="relative flex-1 max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search Name/ID"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] focus:border-transparent text-sm"
                                    style={{ minWidth: 0 }}
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {authData?.user?.access?.studentCases?.canEdit ? (
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="flex items-center bg-[#0172bd] hover:bg-blue-500 text-sm text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out shadow-md"
                                    >
                                        Add Case
                                        <Plus className="w-4 h-4 ml-2" />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Showing X results of Y total */}
                    <div className="text-sm text-gray-500 mt-1 ml-1">
                        Showing {filteredCases.length} result{filteredCases.length !== 1 ? "s" : ""} of {cases.length} total
                    </div>
                </div>

                {/* Table */}
                <div
                    className="mt-4 overflow-x-auto rounded-lg shadow bg-white "
                    style={{
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100vw",
                    }}
                >
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className={
                                            "bg-[#0172bd] text-white font-bold px-4 py-2" +
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
                            {pagedCases.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                        No cases found.
                                    </td>
                                </tr>
                            ) : (
                                pagedCases.map(aCase => (
                                    <tr
                                        key={aCase.id}
                                        className="hover:bg-gray-100 transition cursor-pointer"
                                        onClick={() => openCaseModal(aCase.id)}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">{aCase.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{aCase.studentName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">{aCase.studentId}</td>
                                        <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">{aCase.programSection}</td>
                                        {/* Priority column */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {(() => {
                                                const rawPriority = aCase.priorityLevel || caseDetailsMap[aCase.id]?.priority || "";

                                                const { label } = getPriorityInfo(rawPriority);
                                                return (
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${label.includes("3")
                                                            ? "bg-red-100 text-red-700"
                                                            : label.includes("2")
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : label.includes("1")
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        {/* Status column */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {aCase.status === "Resolved" ? (
                                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Resolved</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">On-going</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
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

            {/* Case Modal */}
            {selectedCaseId && (
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
                            className="absolute top-11 right-5 text-[#0172bd] hover:text-blue-500 transition-transform hover:scale-110"
                            onClick={closeCaseModal}
                        >
                            <X className="w-8 h-8 sm:w-10 sm:h-10" />
                        </button>
                        {/* Header: Name, ID, Buttons aligned right */}
                        <div className="flex flex-col gap-2 mb-4 mt-2 mr-15">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                {/* Name and ID */}
                                <div className="flex items-center gap-3 flex-shrink min-w-0">
                                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#0172bd] flex-shrink-0" />
                                    <div className="min-w-0">
                                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0172bd] break-words truncate md:break-normal md:whitespace-normal" style={{ maxWidth: "70vw" }}>
                                            {caseDetailsMap[selectedCaseId]?.name || ""}
                                        </div>
                                        <div className="text-gray-500 text-sm sm:text-base md:text-lg break-all">{caseDetailsMap[selectedCaseId]?.sid || ""}</div>
                                    </div>
                                </div>
                                {/* Buttons aligned right with name */}
                                <div className="flex gap-2 mt-2 md:mt-0 flex-wrap justify-start md:justify-end">
                                    <button
                                        className={`flex items-center gap-1 px-3 sm:px-4 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm sm:text-base shadow`}
                                        onClick={() => {
                                            if (isEditing) {
                                                handleSaveEdits();
                                            }
                                            setIsEditing(!isEditing);
                                        }}
                                    >
                                        {isEditing ? "Save" : "Edit Case"}
                                        <Pencil className="w-5 h-5 ml-1" />
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm sm:text-base shadow"
                                        onClick={handleArchiveCase}
                                    >
                                        Resolve Case
                                        <Archive className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>
                            {/* Priority Dropdown */}
                            <div className="flex flex-wrap gap-2 mt-2 items-center">
                                <label className="font-semibold text-[#0172bd]">Priority Level:</label>
                                <select
                                    className="px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm bg-gray-100 text-[#0172bd] hover:bg-blue-100"
                                    value={editedCaseData?.caseDetails?.priority || ""}
                                    disabled={!isEditing}
                                    onChange={e => {
                                        if (!isEditing) return;
                                        setEditedCaseData(prev => ({
                                            ...prev,
                                            caseDetails: {
                                                ...prev.caseDetails,
                                                priority: e.target.value,
                                            }
                                        }));
                                    }}
                                >
                                    {PRIORITY_LEVELS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {/* Info type tabs beside priority */}
                                <select
                                    className="px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm bg-gray-100 text-[#0172bd] hover:bg-blue-100"
                                    value={infoType}
                                    onChange={e => setInfoType(e.target.value)}
                                >
                                    <option value="caseDetails">Case Details</option>
                                    <option value="proof">Proof</option>
                                    <option value="actionsTaken">Actions Taken</option>
                                    <option value="counselorNotes">Counselor's Notes</option>
                                </select>
                            </div>
                        </div>
                        {/* Info Section */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                            <CaseInfoSection
                                infoType={infoType}
                                caseData={editedCaseData && editedCaseData[infoType] ? editedCaseData[infoType] : {}}
                                isEditing={isEditing}
                                onFieldChange={handleCaseFieldChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Add Case Modal */}
            <AddCaseModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                newCaseForm={newCaseForm}
                onChange={handleNewCaseChange}
                onSave={handleAddCase}
            />
        </div>
    );
}

export default StudentCases;