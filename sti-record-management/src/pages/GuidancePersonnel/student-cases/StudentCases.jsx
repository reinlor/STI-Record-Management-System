import React, { useState, Fragment, useEffect } from "react";
import { User, Folder, Search, Plus, ArrowLeft, ChevronRight, Pencil, Archive, X, Check, ChevronLeft } from 'lucide-react';
import user from '../../../assets/user.png'
import upload from '../../../assets/upload.png'


const initialCases = [
    { id: 'C001', studentName: 'de Pedro, Dionne Jeus D.', studentId: '02000293896', status: 'On-going' },
    { id: 'C002', studentName: 'Garcia, Maria A.', studentId: '02000293897', status: 'Resolved' },
    { id: 'C003', studentName: 'Cruz, Juan B.', studentId: '02000293898', status: 'On-going' },
    { id: 'C004', studentName: 'Reyes, Anna C.', studentId: '02000293899', status: 'On-going' },
    { id: 'C005', studentName: 'Santos, Mark D.', studentId: '02000293900', status: 'Resolved' },
    { id: 'C006', studentName: 'Lim, Sarah E.', studentId: '02000293901', status: 'On-going' },
    { id: 'C007', studentName: 'Tan, Kevin F.', studentId: '02000293902', status: 'On-going' },
    { id: 'C008', studentName: 'Gomez, Liza G.', studentId: '02000293903', status: 'Resolved' },
];

// Mock data for detailed case information (right panel)
// This will be treated as our "database"
const mockCaseDetails = {
    'C001': {
        caseDetails: {
            studentName: 'de Pedro, Dionne Jeus D.',
            studentId: '02000293896',
            dateOfInitiation: '2025-07-01',
            timeOfInitiation: '13:10',
            counselingTypeCategory: 'Misconduct',
            caseStatus: 'On-going',
            detailedDescription: 'Student was caught using mobile phone during class hours, violating the school\'s policy on electronic device usage. This is the first offense.',
        },
        proof: {
            proofDescription: 'Screenshot of phone usage and teacher\'s written report.',
            proofImage: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Proof%20Img', // Placeholder image
        },
        actionsTaken: {
            actions: 'Verbal warning and confiscation of phone for the remainder of the day. Student was asked to reflect on their actions.',
            dateOfAction: '2025-07-01',
        },
        counselorNotes: {
            notes: 'Dionne expressed remorse and understood the violation. Advised further counseling if behavior persists. Parents informed.',
        },
    },
    'C002': {
        caseDetails: {
            studentName: 'Garcia, Maria A.',
            studentId: '02000293897',
            dateOfInitiation: '2025-06-15',
            timeOfInitiation: '09:00',
            counselingTypeCategory: 'Academic Concern',
            caseStatus: 'Resolved',
            detailedDescription: 'Consistent low grades in Mathematics. Student struggling with algebra concepts.',
        },
        proof: {
            proofDescription: 'Report cards, teacher\'s notes.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'Scheduled tutoring sessions, provided additional learning materials, regular check-ins with teacher and parents.',
            dateOfAction: '2025-06-20',
        },
        counselorNotes: {
            notes: 'Maria\'s grades improved significantly after consistent tutoring. She showed great effort and engagement.',
        },
    },
    'C003': {
        caseDetails: {
            studentName: 'Cruz, Juan B.',
            studentId: '02000293898',
            dateOfInitiation: '2025-07-10',
            timeOfInitiation: '10:30',
            counselingTypeCategory: 'Behavioral Issue',
            caseStatus: 'On-going',
            detailedDescription: 'Disruptive behavior during group activities, talking out of turn, not respecting classmates.',
        },
        proof: {
            proofDescription: 'Teacher observation log.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'One-on-one session with counselor. Discussed importance of respect and active listening.',
            dateOfAction: '2025-07-10',
        },
        counselorNotes: {
            notes: 'Juan acknowledged his behavior and promised to improve. Will monitor progress over the next two weeks.',
        },
    },
    'C004': {
        caseDetails: {
            studentName: 'Reyes, Anna C.',
            studentId: '02000293899',
            dateOfInitiation: '2025-07-05',
            timeOfInitiation: '14:00',
            counselingTypeCategory: 'Attendance Issue',
            caseStatus: 'On-going',
            detailedDescription: 'Repeated tardiness in morning classes without valid explanation.',
        },
        proof: {
            proofDescription: 'Attendance records.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'Meeting with student and parents to understand reasons for tardiness and develop a plan.',
            dateOfAction: '2025-07-08',
        },
        counselorNotes: {
            notes: 'Parents cited transportation issues. Suggested alternative routes. Will check attendance next month.',
        },
    },
    'C005': {
        caseDetails: {
            studentName: 'Santos, Mark D.',
            studentId: '02000293900',
            dateOfInitiation: '2025-05-20',
            timeOfInitiation: '11:45',
            counselingTypeCategory: 'Peer Conflict',
            caseStatus: 'Resolved',
            detailedDescription: 'Disagreement with a classmate over a group project causing tension.',
        },
        proof: {
            proofDescription: 'Statements from involved students.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'Mediation session with counselor. Both parties apologized and agreed to work together.',
            dateOfAction: '2025-05-22',
        },
        counselorNotes: {
            notes: 'Conflict resolved. Students learned conflict resolution skills. Positive outcome.',
        },
    },
    'C006': {
        caseDetails: {
            studentName: 'Lim, Sarah E.',
            studentId: '02000293901',
            dateOfInitiation: '2025-07-12',
            timeOfInitiation: '15:30',
            counselingTypeCategory: 'Stress/Anxiety',
            caseStatus: 'On-going',
            detailedDescription: 'Student expressed feeling overwhelmed by academic pressure and upcoming exams.',
        },
        proof: {
            proofDescription: 'Student self-report.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'Provided coping strategies, recommended stress management techniques, offered relaxation exercises.',
            dateOfAction: '2025-07-12',
        },
        counselorNotes: {
            notes: 'Sarah felt better after the session. Encouraged her to seek further support if needed. Follow-up planned.',
        },
    },
    'C007': {
        caseDetails: {
            studentName: 'Tan, Kevin F.',
            studentId: '02000293902',
            dateOfInitiation: '2025-07-18',
            timeOfInitiation: '09:45',
            counselingTypeCategory: 'Academic Concern',
            caseStatus: 'On-going',
            detailedDescription: 'Lack of participation in class discussions and reluctance to ask questions.',
        },
        proof: {
            proofDescription: 'Teacher observation.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'Individual session focusing on confidence building and active learning strategies.',
            dateOfAction: '2025-07-18',
        },
        counselorNotes: {
            notes: 'Kevin is shy but receptive. Suggested starting with small contributions. Will check in next week.',
        },
    },
    'C008': {
        caseDetails: {
            studentName: 'Gomez, Liza G.',
            studentId: '02000293903',
            dateOfInitiation: '2025-06-01',
            timeOfInitiation: '13:00',
            counselingTypeCategory: 'Health Concern',
            caseStatus: 'Resolved',
            detailedDescription: 'Frequent headaches affecting concentration in class.',
        },
        proof: {
            proofDescription: 'Medical certificate provided by parents.',
            proofImage: null,
        },
        actionsTaken: {
            actions: 'Advised parents to consult a specialist. Arranged for a comfortable seating position in class.',
            dateOfAction: '2025-06-05',
        },
        counselorNotes: {
            notes: 'Headaches are now less frequent after medical consultation. Student is more comfortable and focused.',
        },
    },
};

// Define the fields for each information section and their display properties for cases
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

// Component to render individual sections of case information
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


function StudentCases() {
    const [cases, setCases] = useState(initialCases); // Renamed from students to cases
    const [activeTab, setActiveTab] = useState("On-going"); // 'On-going' or 'Resolved'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState(null); // Renamed from selected to selectedCaseId
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState('caseDetails'); // Default info type
    const [editedCaseData, setEditedCaseData] = useState(null); // New state for editing

    // Effect to load case data into editedCaseData when selectedCaseId changes
    useEffect(() => {
        if (selectedCaseId) {
            // Deep copy the case details
            setEditedCaseData(JSON.parse(JSON.stringify(mockCaseDetails[selectedCaseId])));
        } else {
            setEditedCaseData(null);
            setIsEditing(false);
        }
    }, [selectedCaseId]);

    // State for the new case form in the modal
    const [newCaseForm, setNewCaseForm] = useState({
        studentName: '',
        studentId: '',
        dateOfInitiation: '',
        timeOfInitiation: '',
        counselingTypeCategory: '',
        detailedDescription: '',
        proofDescription: '',
        proofImage: null, // For storing file object or URL
        actions: '',
        dateOfAction: '',
        caseStatus: 'On-going', // Default status
        counselorNotes: '',
    });

    // Handle change for new case form inputs
    const handleNewCaseFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setNewCaseForm(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setNewCaseForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle adding a new case
    const handleAddCase = () => {
        if (!newCaseForm.studentName || !newCaseForm.studentId || !newCaseForm.counselingTypeCategory) {
            alert('Please fill in Student Name, Student ID, and Counseling Type/Category.');
            return;
        }

        // Generate a new ID for the case
        const newCaseId = `C${(cases.length + 1).toString().padStart(3, '0')}`; // Simple incrementing ID

        // Create the new case object for the list
        const newCaseToList = {
            id: newCaseId,
            studentName: newCaseForm.studentName,
            studentId: newCaseForm.studentId,
            status: newCaseForm.caseStatus,
        };

        // Create detailed data for the new case
        const newCaseDetails = {
            caseDetails: {
                studentName: newCaseForm.studentName,
                studentId: newCaseForm.studentId,
                dateOfInitiation: newCaseForm.dateOfInitiation,
                timeOfInitiation: newCaseForm.timeOfInitiation,
                counselingTypeCategory: newCaseForm.counselingTypeCategory,
                caseStatus: newCaseForm.caseStatus,
                detailedDescription: newCaseForm.detailedDescription,
            },
            proof: {
                proofDescription: newCaseForm.proofDescription,
                proofImage: newCaseForm.proofImage ? URL.createObjectURL(newCaseForm.proofImage) : null,
            },
            actionsTaken: {
                actions: newCaseForm.actions,
                dateOfAction: newCaseForm.dateOfAction,
            },
            counselorNotes: {
                notes: newCaseForm.counselorNotes,
            },
        };

        // Update the cases list and details mock data
        setCases(prevCases => [...prevCases, newCaseToList]);
        mockCaseDetails[newCaseId] = newCaseDetails;

        // Reset form and close modal
        setNewCaseForm({
            studentName: '', studentId: '', dateOfInitiation: '', timeOfInitiation: '',
            counselingTypeCategory: '', detailedDescription: '', proofDescription: '',
            proofImage: null, actions: '', dateOfAction: '', caseStatus: 'On-going',
            counselorNotes: '',
        });
        setShowAddModal(false);
        alert('Case Added Successfully!');
    };

    // Handle archiving a case
    const handleArchiveCase = () => {
        if (selectedCaseId) {
            setCases(prevCases =>
                prevCases.map(c =>
                    c.id === selectedCaseId ? { ...c, status: 'Resolved' } : c // Change status to Resolved (Archived from previous concept)
                )
            );
            // Also update the mockCaseDetails directly
            if (mockCaseDetails[selectedCaseId]) {
                mockCaseDetails[selectedCaseId].caseDetails.caseStatus = 'Resolved';
            }

            setSelectedCaseId(null);
            alert('Case status updated to Resolved!'); // Feedback to user
        }
    };

    // Handle saving edits to a case's information
    const handleSaveEdits = () => {
        if (editedCaseData && selectedCaseId) {
            // Update the mockCaseDetails "database" with the edited data
            mockCaseDetails[selectedCaseId] = editedCaseData;

            // Also update the main cases list for any changes in student name or ID or status
            setCases(prevCases =>
                prevCases.map(c =>
                    c.id === selectedCaseId
                        ? {
                            ...c,
                            studentName: editedCaseData.caseDetails?.studentName || c.studentName,
                            studentId: editedCaseData.caseDetails?.studentId || c.studentId,
                            status: editedCaseData.caseDetails?.caseStatus || c.status,
                        }
                        : c
                )
            );

            setIsEditing(false);
            alert('Changes saved successfully!');
        }
    };

    // Handler for changes in the CaseInfoSection when in editing mode
    const handleCaseFieldChange = (category, field, value) => {
        setEditedCaseData(prevData => {
            if (!prevData) return prevData;

            const newData = JSON.parse(JSON.stringify(prevData));

            if (!newData[category]) {
                newData[category] = {};
            }
            newData[category][field] = value;
            return newData;
        });
    };

    // Filter cases based on active tab and search term
    const filteredCases = cases.filter(c => {
        const matchesTab = (activeTab === 'All' && (c.status === 'On-going' || c.status === 'Resolved')) || c.status === activeTab;
        const matchesSearch = searchTerm === '' || c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              c.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              c.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Get the details of the currently selected case
    const displayCaseData = isEditing && editedCaseData ? editedCaseData : (selectedCaseId ? mockCaseDetails[selectedCaseId] : null);

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Left Panel: Case List */}
            <div className={`w-96 bg-white border-r border-gray-200 shadow-lg flex flex-col`}>
                {/* Header Section of Left Panel */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <h2 className="text-3xl font-bold text-gray-800">Student Cases</h2>
                    </div>

                    {/* Filter Tabs: Resolved / On-going */}
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

                    {/* Search Bar for Name/ID */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Name/ ID"
                            className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Search Icon from Lucide */}
                        <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Add Case Button */}
                    <button
                        className="w-full bg-[#0A1220] hover:bg-[#003d54] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" /> {/* Plus Icon from Lucide */}
                        Add Case
                    </button>
                </div>

                {/* Case List - Scrollable Area */}
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
                                    {/* User Icon from Lucide */}
                                    <img src={user} alt="User" className="w-5 h-5 object-cover mr-5" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{aCase.studentName}</p>
                                        <p className="text-sm text-gray-600">{aCase.studentId}</p>
                                    </div>
                                </div>
                                {/* ChevronRight Icon from Lucide */}
                                <ChevronRight className="w-5 h-5 text-[#0A1220]" />
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-gray-500 text-center">No cases found.</p>
                    )}
                </div>
            </div>

            {/* Right Panel: Case Information Details */}
            <div className={`flex-1 bg-white flex flex-col`}>
                <Fragment>
                    {/* Right Panel Header with action buttons and info type dropdown */}
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Back Button */}
                            <button
                                className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                                onClick={() => setSelectedCaseId(null)}
                            >
                                <ChevronLeft className="w-8 h-8 text-gray-700" /> {/* ArrowLeft Icon from Lucide */}
                            </button>
                            {/* Info Type Dropdown */}
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

                        {/* Action Buttons: Edit, Archive */}
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
                                {/* Edit/Save Icon from Lucide */}
                                {isEditing ? 'Save' : 'Edit Case'}
                                <Pencil className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                                onClick={handleArchiveCase}
                            >
                                {/* Archive Icon from Lucide */}
                                Resolve Case
                                <Archive className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                            </button>
                        </div>
                    </div>

                    {/* Case Information Content - Scrollable */}
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
                                <X className="w-6 h-6 text-gray-600" /> {/* X Icon from Lucide */}
                            </button>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {/* Left Column for form */}
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

                            {/* Right Column for form */}
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
                                <X className="w-8 h-8 ml-2" /> {/* X Icon from Lucide */}
                            </button>
                            <button
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                                onClick={handleAddCase}
                            >
                                Add Case
                                <Check className="w-8 h-8 ml-2" /> {/* Check Icon from Lucide */}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCases;
