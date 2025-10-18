// StudentCases.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import axios from "axios";
import {
    Search,
    Plus,
    FileText,
    X,
    Edit as Pencil,
    Archive,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    SlidersHorizontal,
    ArrowUpDown,
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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";

const PRIORITY_LEVELS = [
    { value: "", label: "No Priority" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
    { value: "3", label: "Level 3" },
];

const STATUS_OPTIONS = [
    { value: "All", label: "All Status" },
    { value: "On-going", label: "On-going" },
    { value: "Resolved", label: "Resolved" },
];

function StudentCases() {
    const { authData } = useContext(AuthContext);

    const [cases, setCases] = useState([]);
    const [caseDetailsMap, setCaseDetailsMap] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState("caseDetails");
    const [editedCaseData, setEditedCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedProgram, setSelectedProgram] = useState("all");
    const [selectedSection, setSelectedSection] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("On-going");
    const [priorityOrder, setPriorityOrder] = useState("desc");
    const [programOptions, setProgramOptions] = useState(["all"]);
    const [sectionOptions, setSectionOptions] = useState(["all"]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

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
                setNewCaseForm(prev => ({ ...prev, [name]: files[0] }));
            } else {
                setNewCaseForm(prev => ({ ...prev, [name]: value }));
            }
        } else if (eOrObj?.name) {
            const { name, value } = eOrObj;
            setNewCaseForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Fetch data
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "studentCases"),
            (snapshot) => {
                setLoading(true);
                const violations = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const list = violations.map(v => ({
                    id: v.id,
                    studentName: v.name ?? "Unknown",
                    studentId: v.sid ?? "",
                    status: v.status ?? "On-going",
                    timeCreated: v.timeCreated,
                    programSection: v.programSection ?? "",
                    priorityLevel: v.priorityLevel ?? v.priority ?? v.caseDetails?.priority ?? "",
                }));

                // Build filter dropdown options
                const programs = new Set();
                const sections = new Set();
                list.forEach(c => {
                    const [prog, sect] = c.programSection?.split(" ") || [];
                    if (prog) programs.add(prog);
                    if (sect) sections.add(sect);
                });
                setProgramOptions(["all", ...Array.from(programs)]);
                setSectionOptions(["all", ...Array.from(sections)]);

                const details = {};
                violations.forEach(v => (details[v.id] = v));

                setCases(list);
                setCaseDetailsMap(details);
                setLoading(false);
            },
            (error) => {
                console.error("Error listening for cases:", error);
                toast.error("Failed to fetch realtime cases");
                setLoading(false);
            }
        );

        return () => unsub();
    }, []);

    // Priority Helper
    const getPriorityInfo = (priority) => {
        if (!priority) return { rank: 0, label: "No Priority" };
        if (typeof priority === "number" || /^\d+$/.test(priority)) {
            const num = parseInt(priority, 10);
            return { rank: num, label: `Level ${num}` };
        }
        if (typeof priority === "string") {
            const match = priority.match(/([1-3])/);
            if (match) {
                const num = parseInt(match[1], 10);
                return { rank: num, label: `Level ${num}` };
            }
        }
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

    // Filtering Logic
    const filteredCases = cases
        .filter((c) => {
            // Search filter
            const matchesSearch =
                searchTerm === "" ||
                (c.studentName && c.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.studentId && c.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()));

            // Program filter
            const prog = c.programSection?.split(" ")[0] || "";
            const sect = c.programSection?.split(" ")[1] || "";
            if (selectedProgram !== "all" && prog !== selectedProgram) return false;
            if (selectedSection !== "all" && sect !== selectedSection) return false;

            // Status filter
            if (selectedStatus !== "All" && c.status !== selectedStatus) return false;

            return matchesSearch;
        })
        .sort((a, b) => {
            const { rank: priorityA } = getPriorityInfo(a.priorityLevel);
            const { rank: priorityB } = getPriorityInfo(b.priorityLevel);
            return priorityOrder === "desc" ? priorityB - priorityA : priorityA - priorityB;
        });

    // Pagination
    const totalRows = filteredCases.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pagedCases = filteredCases.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [totalPages, currentPage]);

    // For Modal Handlers
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

    const handleSaveEdits = async () => {
        if (!editedCaseData || !selectedCaseId) return;
        try {
            const payload = uiDetailsToServerPayload(editedCaseData);
            await axios.put(`/cases/update/${selectedCaseId}`, { ...payload, processedBy: authData?.displayName ?? 'Admin' });
            toast.success("Changes saved successfully!");
            setIsEditing(false);
        } catch {
            toast.error("Error saving changes.");
        }
    };

    const handleArchiveCase = async () => {
        if (!selectedCaseId) return;
        try {
            await axios.put(`/cases/update/${selectedCaseId}`, { status: "Resolved", processedBy: authData?.displayName ?? 'Admin' });
            setCases(prev => prev.map(c => c.id === selectedCaseId ? { ...c, status: "Resolved" } : c));
            toast.success("Case status updated to Resolved!");
            setSelectedCaseId(null);
        } catch {
            toast.error("Error archiving case.");
        }
    };

    const handleAddCase = async (caseDataWithPriority) => {
        const dataToSave = { ...caseDataWithPriority, processedBy: authData?.displayName ?? 'Admin' };
        console.log(caseDataWithPriority)
        if (
            !dataToSave.studentName || !dataToSave.studentId || !dataToSave.counselingTypeCategory ||
            !dataToSave.programSection || !dataToSave.dateOfInitiation || !dataToSave.timeOfInitiation ||
            !dataToSave.violation || !dataToSave.dateOfAction ||!dataToSave.caseStatus) {
                let emptyFields = [];
                if (!dataToSave.studentName) emptyFields.push('Name');
                if (!dataToSave.studentId) emptyFields.push('ID');
                if (!dataToSave.counselingTypeCategory) emptyFields.push('Counseling Type');
                if (!dataToSave.programSection) emptyFields.push('Program Section');
                if (!dataToSave.dateOfInitiation) emptyFields.push('Date of Initiation');
                if (!dataToSave.timeOfInitiation) emptyFields.push('Time of initiation');
                if (!dataToSave.violation) emptyFields.push('Violation');
                if (!dataToSave.dateOfAction) emptyFields.push('Date of Action');
                if (!dataToSave.caseStatus) emptyFields.push('Case Status');
                const fieldList = emptyFields.join(', ')
                toast.error(`Please fill out the required fields: ${fieldList}`);
                return;
        }
        
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            Object.entries(dataToSave).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'proofImage' && value instanceof File) {
                        formData.append('proof', value, value.name);
                    } else if (key !== 'proofImage') {
                        if (typeof value === 'object') {
                            formData.append(key, value.value ?? value.label ?? JSON.stringify(value));
                        } else {
                            formData.append(key, value);
                        }
                    }
                }
            });

            await axios.post("/cases/add", formData, { headers: { "Content-Type": "multipart/form-data" } });
            console.log(formData)
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
        } catch {
            toast.error("Error adding case.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingDots />;

    const dropdownClass =
        "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0172bd] bg-white text-[#0172bd] text-sm appearance-none pr-8";
    const filterLabel = "text-xs font-semibold text-gray-500 mb-1 ml-1";

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedProgram("all");
        setSelectedSection("all");
        setSelectedStatus("On-going");
        setPriorityOrder("desc");
    };

    const columns = [
        { label: "Case ID", key: "id", show: "lg" },
        { label: "Student Name", key: "studentName", show: "all" },
        { label: "Student ID", key: "studentId", show: "lg" },
        { label: "Program & Section", key: "programSection", show: "lg" },
        { label: "Priority", key: "priority", show: "all" },
        { label: "Status", key: "status", show: "all" },
    ];

    return (
        <div className="bg-gray-100 h-full flex flex-col pb-3">
            <ToastContainer position="top-right" autoClose={4000} />

            <div className="bg-white rounded-xl shadow-lg mx-2 sm:mx-4 flex-1 flex flex-col p-2 sm:p-6" style={{ maxWidth: "100vw" }}>
                {/* Header */}
                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                        <div className="text-3xl font-bold text-[#0172bd] flex items-center gap-2">
                            <FileText className="w-8 h-8" />
                            Student Cases
                        </div>

                        {/* Search + Add */}
                        <div className="flex gap-2 w-full md:w-auto md:justify-end md:items-center">
                            <div className="relative flex-1 max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search Name/ID"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] text-sm"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                            </div>
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-[#0172bd] rounded-lg font-semibold text-sm"
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-1" /> Clear
                            </button>
                            {authData?.user?.access?.studentCases?.canEdit && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center bg-[#0172bd] hover:bg-blue-500 text-sm text-white font-bold py-2 px-4 rounded-lg shadow-md"
                                >
                                    Add Case <Plus className="w-4 h-4 ml-2" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Showing X results */}
                    <div className="text-sm text-gray-500 mt-1 ml-1">
                        Showing {filteredCases.length} result{filteredCases.length !== 1 ? "s" : ""} of {cases.length} total
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-4 w-full">
                        <div>
                            <div className={filterLabel}>Program/Strand</div>
                            <div className="relative">
                                <select className={dropdownClass} value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
                                    {programOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt === "all" ? "All Programs" : opt}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <div className={filterLabel}>Section</div>
                            <div className="relative">
                                <select className={dropdownClass} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                                    {sectionOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt === "all" ? "All Sections" : opt}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <div className={filterLabel}>Priority Order</div>
                            <button
                                onClick={() => setPriorityOrder(prev => prev === "asc" ? "desc" : "asc")}
                                className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-[#0172bd] font-semibold text-sm bg-white"
                            >
                                {priorityOrder === "desc" ? "High → Low" : "Low → High"}
                                <ArrowUpDown className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                        <div>
                            <div className={filterLabel}>Status</div>
                            <div className="relative">
                                <select className={dropdownClass} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-[#0172bd] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-4 overflow-x-auto rounded-lg shadow bg-white">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className={`bg-[#0172bd] text-white font-bold px-4 py-2 ${col.show === "lg" ? "hidden lg:table-cell" : ""}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pagedCases.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">No cases found.</td>
                                </tr>
                            ) : (
                                pagedCases.map(aCase => {
                                    const { label } = getPriorityInfo(aCase.priorityLevel);
                                    return (
                                        <tr key={aCase.id} className="hover:bg-gray-100 transition cursor-pointer" onClick={() => openCaseModal(aCase.id)}>
                                            <td className="px-4 py-3 hidden lg:table-cell">{aCase.id}</td>
                                            <td className="px-4 py-3">{aCase.studentName}</td>
                                            <td className="px-4 py-3 hidden lg:table-cell">{aCase.studentId}</td>
                                            <td className="px-4 py-3 hidden lg:table-cell">{aCase.programSection}</td>
                                            <td className="px-4 py-3">
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
                                            </td>
                                            <td className="px-4 py-3">
                                                {aCase.status === "Resolved" ? (
                                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Resolved</span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">On-going</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="w-full flex justify-center lg:justify-end items-center mt-2">
                    <nav className="flex items-center space-x-1">
                        <button
                            className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-5 h-5" />
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </nav>
                </div>
            </div>

            {/* Case Modal */}
            {selectedCaseId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-[98vw] max-w-[98vw] h-[98vh] max-h-[98vh]
            md:w-[90vw] md:max-w-[900px] md:h-[90vh] md:max-h-[900px]
            lg:w-[95vw] lg:max-w-[1600px] lg:h-[90vh] lg:max-h-[900px]
            flex flex-col p-3 sm:p-4 md:p-6 relative overflow-y-auto custom-scrollbar"
                    >
                        <button
                            className="absolute top-11 right-5 text-[#0172bd] hover:text-blue-500 transition-transform hover:scale-110"
                            onClick={closeCaseModal}
                        >
                            <X className="w-8 h-8 sm:w-10 sm:h-10" />
                        </button>

                        <div className="flex flex-col gap-2 mb-4 mt-2 mr-15">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#0172bd]" />
                                    <div>
                                        <div className="text-2xl font-bold text-[#0172bd]">
                                            {caseDetailsMap[selectedCaseId]?.name || ""}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            {caseDetailsMap[selectedCaseId]?.sid || ""}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2 md:mt-0">
                                    <button
                                        className="flex items-center gap-1 px-3 py-2 bg-[#0172bd] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow"
                                        onClick={() => {
                                            if (isEditing) handleSaveEdits();
                                            setIsEditing(!isEditing);
                                        }}
                                    >
                                        {isEditing ? "Save" : "Edit Case"}
                                        <Pencil className="w-5 h-5 ml-1" />
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm shadow"
                                        onClick={handleArchiveCase}
                                    >
                                        Resolve Case
                                        <Archive className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>

                            {/* Priority and Info Tabs */}
                            <div className="flex flex-wrap gap-2 mt-2 items-center">
                                <label className="font-semibold text-[#0172bd]">Priority Level:</label>
                                <select
                                    className="px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm bg-gray-100 text-[#0172bd]"
                                    value={editedCaseData?.caseDetails?.priority || ""}
                                    disabled={!isEditing}
                                    onChange={e => setEditedCaseData(prev => ({
                                        ...prev,
                                        caseDetails: { ...prev.caseDetails, priority: e.target.value },
                                    }))}
                                >
                                    {PRIORITY_LEVELS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>

                                <select
                                    className="px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm bg-gray-100 text-[#0172bd]"
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

                        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                            <CaseInfoSection
                                infoType={infoType}
                                caseData={editedCaseData?.[infoType] || {}}
                                isEditing={isEditing}
                                onFieldChange={(cat, field, val) =>
                                    setEditedCaseData(prev => {
                                        const updated = JSON.parse(JSON.stringify(prev));
                                        if (!updated[cat]) updated[cat] = {};
                                        updated[cat][field] = val;
                                        return updated;
                                    })
                                }
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
                isButtonSubmitting={isSubmitting}
            />
        </div>
    );
}

export default StudentCases;
