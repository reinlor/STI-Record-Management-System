// ...existing code...
import React, { useState, Fragment, useEffect } from "react";
import axios from "axios";
import { User, Folder, Search, Plus, ArrowLeft, ChevronRight, Pencil, Archive, X, Check, ChevronLeft } from 'lucide-react';
import user from '../../../assets/user.png'
import upload from '../../../assets/upload.png'

// ...existing code...

// NOTE: initialCases and mockCaseDetails were converted to API-backed requests.
// The UI shape (caseDetails/proof/actionsTaken/counselorNotes) is preserved via mappers.

/* ---------------- Mapping Helpers ---------------- */
const CaseInfoSection = ({ infoType, caseData, isEditing, onFieldChange }) => {
    const fieldsToDisplay = caseFieldDefinitions[infoType] || [];

    const infoTypeTitles = {
        caseDetails: "Case Details",
        proof: "Proof",
        actionsTaken: "Actions Taken",
        counselorNotes: "Counselor's Notes",
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                {infoTypeTitles[infoType]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fieldsToDisplay.map((fieldDef) => {
                    const value = caseData && caseData[fieldDef.key] !== undefined ? caseData[fieldDef.key] : 'N/A';
                    const inputId = `${infoType}-${fieldDef.key}`;

                    return (
                        <div key={fieldDef.key} className="flex flex-col">
                            <label htmlFor={inputId} className="text-sm text-gray-600 font-medium mb-1">
                                {fieldDef.label}:
                            </label>
                            {isEditing ? (
                                fieldDef.type === 'textarea' ? (
                                    <textarea
                                        id={inputId}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        rows={fieldDef.multiline ? 3 : 1}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                    />
                                ) : fieldDef.type === 'select' ? (
                                    <select
                                        id={inputId}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out cursor-pointer"
                                    >
                                        {fieldDef.options.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : fieldDef.type === 'file' ? (
                                    <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer relative group">
                                        {value && value !== 'N/A' ? (
                                            <img
                                                src={value} // Assuming value is a URL for display
                                                alt="Proof Preview"
                                                className="max-h-full max-w-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l1.5-1.5a.75.75 0 011.06 0L10.5 20.25m-8.25-4.5h16.5m-4.5 0v4.5m-4.5-4.5V21m12-8.25V1.5m0 0a2.25 2.25 0 00-2.25-2.25h-6A2.25 2.25 0 003 1.5V6" />
                                            </svg>
                                        )}
                                        <input
                                            id={inputId}
                                            name={fieldDef.key}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <span className="absolute bottom-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Upload Image</span>
                                    </div>
                                ) : (
                                    <input
                                        id={inputId}
                                        type={fieldDef.type}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                    />
                                )
                            ) : (
                                <span className="text-lg font-semibold text-gray-900 break-words">
                                    {value}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const caseFieldDefinitions = {
    caseDetails: [
        { key: 'studentName', label: 'Full Name', type: 'text' },
        { key: 'studentId', label: 'Student ID', type: 'text' },
        { key: 'dateOfInitiation', label: 'Date of Case Initiation', type: 'date' },
        { key: 'timeOfInitiation', label: 'Time of Initiation', type: 'time' },
        { key: 'counselingTypeCategory', label: 'Counseling Type/Category', type: 'text' },
        { key: 'caseStatus', label: 'Case Status', type: 'select', options: ['On-going', 'Resolved'] },
        { key: 'detailedDescription', label: 'Detailed Description', type: 'textarea', multiline: true },
    ],
    proof: [
        { key: 'proofDescription', label: 'Proof Description', type: 'textarea', multiline: true },
        { key: 'proofImage', label: 'Proof', type: 'file' },
    ],
    actionsTaken: [
        { key: 'actions', label: 'Actions Taken/Disciplinary Measures', type: 'textarea', multiline: true },
        { key: 'dateOfAction', label: 'Date of Action', type: 'date' },
    ],
    counselorNotes: [
        { key: 'notes', label: 'Counselor\'s Notes', type: 'textarea', multiline: true },
    ],
};

// Convert a server violation object -> UI grouped structure used by CaseInfoSection
const serverViolationToUIDetails = (violation) => {
    if (!violation) return null;

    return {
        caseDetails: {
            studentName: violation.name ?? 'N/A',
            studentId: violation.sid ?? 'N/A',
            dateOfInitiation: violation.initiationDate ?? 'N/A',
            timeOfInitiation: violation.initialTime ?? 'N/A',
            counselingTypeCategory: violation.counselingType ?? 'N/A',
            caseStatus: violation.status ?? 'On-going',
            detailedDescription: violation.detailedDescription ?? 'N/A',
        },
        proof: {
            proofDescription: violation.proofDescription ?? 'N/A',
            proofImage: violation.proofUrl ?? null,
        },
        actionsTaken: {
            actions: violation.actionTaken ?? 'N/A',
            dateOfAction: violation.dateOfAction ?? 'N/A',
        },
        counselorNotes: {
            notes: violation.notes ?? 'N/A',
        },
    };
};

// Convert UI grouped structure (editedCaseData) -> server payload shape for POST/PUT
const uiDetailsToServerPayload = (uiGrouped) => {
    if (!uiGrouped) return {};
    const cd = uiGrouped.caseDetails || {};
    const pf = uiGrouped.proof || {};
    const act = uiGrouped.actionsTaken || {};
    const cn = uiGrouped.counselorNotes || {};

    return {
        sid: cd.studentId ?? '',
        name: cd.studentName ?? '',
        initiationDate: cd.dateOfInitiation ?? '',
        initialTime: cd.timeOfInitiation ?? '',
        counselingType: cd.counselingTypeCategory ?? '',
        detailedDescription: cd.detailedDescription ?? '',
        proofDescription: pf.proofDescription ?? '',
        proofUrl: pf.proofImage ?? '', // keep string or empty
        actionTaken: act.actions ?? '',
        dateOfAction: act.dateOfAction ?? '',
        status: cd.caseStatus ?? 'On-going',
        notes: cn.notes ?? '',
    };
};

/* ---------------- Component ---------------- */

function StudentCases() {
    // ...existing state declarations...
    const [cases, setCases] = useState([]); // replaces initialCases
    const [caseDetailsMap, setCaseDetailsMap] = useState({}); // maps id -> server raw violation
    const [activeTab, setActiveTab] = useState("On-going"); // 'On-going' or 'Resolved'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState('caseDetails'); // Default info type
    const [editedCaseData, setEditedCaseData] = useState(null); // UI grouped structure for editing

    // newCaseForm unchanged
    const [newCaseForm, setNewCaseForm] = useState({
        studentName: '',
        studentId: '',
        dateOfInitiation: '',
        timeOfInitiation: '',
        counselingTypeCategory: '',
        detailedDescription: '',
        proofDescription: '',
        proofImage: null,
        actions: '',
        dateOfAction: '',
        caseStatus: 'On-going',
        counselorNotes: '',
    });

    const handleNewCaseFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setNewCaseForm(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setNewCaseForm(prev => ({ ...prev, [name]: value }));
        }
    };

    /* ---------------- API: fetch list of cases on mount ---------------- */
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await axios.get('/cases'); // server returns array of violations
                const violations = Array.isArray(res.data) ? res.data : [];
                // Map to simple list and details map
                const list = violations.map(v => ({
                    id: v.id,
                    studentName: v.name ?? v.name ?? 'Unknown',
                    studentId: v.sid ?? v.sid ?? '',
                    status: v.status ?? 'On-going',
                }));
                const details = {};
                violations.forEach(v => {
                    details[v.id] = v; // keep raw server object; mappers used when rendering
                });

                setCases(list);
                setCaseDetailsMap(details);
            } catch (err) {
                console.error('Failed to fetch cases', err);
                setCases([]);
                setCaseDetailsMap({});
            }
        };

        fetchCases();
    }, []);

    /* ---------------- When a case is selected: populate editedCaseData (UI grouped) ---------------- */
    useEffect(() => {
        if (selectedCaseId) {
            const raw = caseDetailsMap[selectedCaseId];
            const ui = serverViolationToUIDetails(raw);
            setEditedCaseData(ui ? JSON.parse(JSON.stringify(ui)) : null); // deep copy for editing
            setIsEditing(false);
        } else {
            setEditedCaseData(null);
            setIsEditing(false);
        }
    }, [selectedCaseId, caseDetailsMap]);

    /* ---------------- Add Case -> POST to server, then refresh list ---------------- */
    const handleAddCase = async () => {
        if (!newCaseForm.studentName || !newCaseForm.studentId || !newCaseForm.counselingTypeCategory) {
            alert('Please fill in Student Name, Student ID, and Counseling Type/Category.');
            return;
        }

        try {
            // Build server payload
            const payload = {
                sid: newCaseForm.studentId,
                name: newCaseForm.studentName,
                initiationDate: newCaseForm.dateOfInitiation || '',
                initialTime: newCaseForm.timeOfInitiation || '',
                counselingType: newCaseForm.counselingTypeCategory || '',
                detailedDescription: newCaseForm.detailedDescription || '',
                proofDescription: newCaseForm.proofDescription || '',
                proofUrl: newCaseForm.proofImage ? URL.createObjectURL(newCaseForm.proofImage) : '',
                actionTaken: newCaseForm.actions || '',
                dateOfAction: newCaseForm.dateOfAction || '',
                status: newCaseForm.caseStatus || 'On-going',
                notes: newCaseForm.counselorNotes || '',
            };

            await axios.post('/cases/add', payload);

            // Refresh list from server
            const refresh = await axios.get('/cases');
            const violations = Array.isArray(refresh.data) ? refresh.data : [];
            const list = violations.map(v => ({
                id: v.id,
                studentName: v.name ?? 'Unknown',
                studentId: v.sid ?? '',
                status: v.status ?? 'On-going',
            }));
            const details = {};
            violations.forEach(v => { details[v.id] = v; });

            setCases(list);
            setCaseDetailsMap(details);

            // Reset and close modal
            setNewCaseForm({
                studentName: '', studentId: '', dateOfInitiation: '', timeOfInitiation: '',
                counselingTypeCategory: '', detailedDescription: '', proofDescription: '',
                proofImage: null, actions: '', dateOfAction: '', caseStatus: 'On-going',
                counselorNotes: '',
            });
            setShowAddModal(false);
            alert('Case Added Successfully!');
        } catch (err) {
            console.error('Error adding case', err);
            alert('Error adding case.');
        }
    };

    /* ---------------- Archive/Resolve Case -> PUT update status, refresh affected item ---------------- */
    const handleArchiveCase = async () => {
        if (!selectedCaseId) return;

        try {
            // update status only
            await axios.put(`/cases/update/${selectedCaseId}`, { status: 'Resolved' });

            // update local list and details map (optimistic)
            setCases(prev => prev.map(c => c.id === selectedCaseId ? { ...c, status: 'Resolved' } : c));
            setCaseDetailsMap(prev => {
                const next = { ...prev };
                if (next[selectedCaseId]) next[selectedCaseId].status = 'Resolved';
                return next;
            });

            setSelectedCaseId(null);
            alert('Case status updated to Resolved!');
        } catch (err) {
            console.error('Error updating case status', err);
            alert('Error archiving case.');
        }
    };

    /* ---------------- Save Edits -> PUT update with mapped payload and refresh local state ---------------- */
    const handleSaveEdits = async () => {
        if (!editedCaseData || !selectedCaseId) return;

        try {
            const payload = uiDetailsToServerPayload(editedCaseData);
            await axios.put(`/cases/update/${selectedCaseId}`, payload);

            // refresh the single record locally by re-fetching all or updating the map
            const res = await axios.get('/cases');
            const violations = Array.isArray(res.data) ? res.data : [];
            const list = violations.map(v => ({
                id: v.id,
                studentName: v.name ?? 'Unknown',
                studentId: v.sid ?? '',
                status: v.status ?? 'On-going',
            }));
            const details = {};
            violations.forEach(v => { details[v.id] = v; });

            setCases(list);
            setCaseDetailsMap(details);

            setIsEditing(false);
            alert('Changes saved successfully!');
        } catch (err) {
            console.error('Error saving edits', err);
            alert('Error saving changes.');
        }
    };

    /* ---------------- Field change handler for editing UI grouped object ---------------- */
    const handleCaseFieldChange = (category, field, value) => {
        setEditedCaseData(prevData => {
            if (!prevData) return prevData;
            const newData = JSON.parse(JSON.stringify(prevData));
            if (!newData[category]) newData[category] = {};
            newData[category][field] = value;
            return newData;
        });
    };

    /* ---------------- Filtering & display computed values (unchanged UI logic) ---------------- */
    const filteredCases = cases.filter(c => {
        const matchesTab = (activeTab === 'All' && (c.status === 'On-going' || c.status === 'Resolved')) || c.status === activeTab;
        const matchesSearch = searchTerm === '' || (c.studentName && c.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.studentId && c.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    // displayCaseData used by UI; if editing use editedCaseData, otherwise map server raw to UI grouped
    const displayCaseData = isEditing && editedCaseData
        ? editedCaseData
        : (selectedCaseId ? serverViolationToUIDetails(caseDetailsMap[selectedCaseId]) : null);

    // ...existing rendering code (unchanged styles)...
    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Left Panel: Case List */}
            <div className={`w-96 bg-white border-r border-gray-200 shadow-lg flex flex-col`}>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <h2 className="text-3xl font-bold text-gray-800">Student Cases</h2>
                    </div>

                    <div className="flex justify-around bg-gray-200 p-1 rounded-lg mb-4">
                        <button
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54]
                                        ${activeTab === 'Resolved' ? 'bg-[#0A1220] text-white shadow-sm hover:bg-[#003d54]' : 'text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('Resolved')}
                        >
                            Resolved
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer
                                        ${activeTab === 'On-going' ? 'bg-[#0A1220] text-white shadow-sm hover:bg-[#003d54]' : 'text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('On-going')}
                        >
                            On-going
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Name/ ID"
                            className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full bg-[#0A1220] hover:bg-[#003d54] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Case
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                    {filteredCases.length > 0 ? (
                        filteredCases.map((aCase) => (
                            <div
                                key={aCase.id}
                                className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition duration-150 ease-in-out
                                            ${selectedCaseId === aCase.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedCaseId(aCase.id)}
                            >
                                <div className="flex items-center">
                                    <img src={user} alt="User" className="w-5 h-5 object-cover mr-5" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{aCase.studentName}</p>
                                        <p className="text-sm text-gray-600">{aCase.studentId}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#0A1220]" />
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-gray-500 text-center">No cases found.</p>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className={`flex-1 bg-white flex flex-col`}>
                <Fragment>
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setSelectedCaseId(null)}
                            >
                                <ChevronLeft className="w-8 h-8 text-gray-700" />
                            </button>
                            <select
                                className="block px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 text-sm sm:text-base cursor-pointer"
                                value={infoType}
                                onChange={(e) => setInfoType(e.target.value)}
                            >
                                <option value="caseDetails">Case Details</option>
                                <option value="proof">Proof</option>
                                <option value="actionsTaken">Actions Taken</option>
                                <option value="counselorNotes">Counselor's Notes</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                            <button
                                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center transition duration-150 ease-in-out text-sm sm:text-base font-medium cursor-pointer
                                            ${isEditing ? 'bg-gray-500 text-white shadow-md' : 'bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg'}`}
                                onClick={() => {
                                    if (isEditing) {
                                        handleSaveEdits();
                                    }
                                    setIsEditing(!isEditing);
                                }}
                            >
                                {isEditing ? 'Save' : 'Edit Case'}
                                <Pencil className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                                onClick={handleArchiveCase}
                            >
                                Resolve Case
                                <Archive className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {displayCaseData ? (
                            <CaseInfoSection
                                infoType={infoType}
                                caseData={displayCaseData[infoType]}
                                isEditing={isEditing}
                                onFieldChange={handleCaseFieldChange}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl p-4 text-center">
                                Select a case from the list to view its information.
                            </div>
                        )}
                    </div>
                </Fragment>
            </div>

            {/* Add Case Modal */}
            {showAddModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Add New Case</h3>
                            <button
                                className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
                                onClick={() => setShowAddModal(false)}
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {/* left & right columns unchanged (using same newCaseForm state) */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name:</label>
                                    <input
                                        type="text"
                                        id="studentName"
                                        name="studentName"
                                        value={newCaseForm.studentName}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID:</label>
                                    <input
                                        type="text"
                                        id="studentId"
                                        name="studentId"
                                        value={newCaseForm.studentId}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dateOfInitiation" className="block text-sm font-medium text-gray-700">Date of Initiation:</label>
                                    <input
                                        type="date"
                                        id="dateOfInitiation"
                                        name="dateOfInitiation"
                                        value={newCaseForm.dateOfInitiation}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="timeOfInitiation" className="block text-sm font-medium text-gray-700">Time of Initiation:</label>
                                    <input
                                        type="time"
                                        id="timeOfInitiation"
                                        name="timeOfInitiation"
                                        value={newCaseForm.timeOfInitiation}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="counselingTypeCategory" className="block text-sm font-medium text-gray-700">Counseling Type/Category:</label>
                                    <input
                                        type="text"
                                        id="counselingTypeCategory"
                                        name="counselingTypeCategory"
                                        value={newCaseForm.counselingTypeCategory}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700">Detailed Description:</label>
                                    <textarea
                                        id="detailedDescription"
                                        name="detailedDescription"
                                        value={newCaseForm.detailedDescription}
                                        onChange={handleNewCaseFormChange}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="proofDescription" className="block text-sm font-medium text-gray-700">Proof Description:</label>
                                    <textarea
                                        id="proofDescription"
                                        name="proofDescription"
                                        value={newCaseForm.proofDescription}
                                        onChange={handleNewCaseFormChange}
                                        rows="2"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="actions" className="block text-sm font-medium text-gray-700">Actions Taken:</label>
                                    <textarea
                                        id="actions"
                                        name="actions"
                                        value={newCaseForm.actions}
                                        onChange={handleNewCaseFormChange}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="dateOfAction" className="block text-sm font-medium text-gray-700">Date of Action:</label>
                                    <input
                                        type="date"
                                        id="dateOfAction"
                                        name="dateOfAction"
                                        value={newCaseForm.dateOfAction}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="caseStatus" className="block text-sm font-medium text-gray-700">Case Status:</label>
                                    <select
                                        id="caseStatus"
                                        name="caseStatus"
                                        value={newCaseForm.caseStatus}
                                        onChange={handleNewCaseFormChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="On-going">On-going</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="counselorNotes" className="block text-sm font-medium text-gray-700">Counselor's Notes:</label>
                                    <textarea
                                        id="counselorNotes"
                                        name="counselorNotes"
                                        value={newCaseForm.counselorNotes}
                                        onChange={handleNewCaseFormChange}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="proofImage" className="block text-sm font-medium text-gray-700">Proof Image:</label>
                                    <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer relative group">
                                        {newCaseForm.proofImage ? (
                                            <img
                                                src={URL.createObjectURL(newCaseForm.proofImage)}
                                                alt="Proof Preview"
                                                className="max-h-full max-w-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <img src={upload} alt="uploadIcon" className="w-10 h-10 object-cover" />
                                        )}
                                        <input
                                            id="proofImage"
                                            name="proofImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleNewCaseFormChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <span className="absolute bottom-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Upload Image</span>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-5 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                                <X className="w-8 h-8 ml-2" />
                            </button>
                            <button
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                                onClick={handleAddCase}
                            >
                                Add Case
                                <Check className="w-8 h-8 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCases;
// ...existing code...