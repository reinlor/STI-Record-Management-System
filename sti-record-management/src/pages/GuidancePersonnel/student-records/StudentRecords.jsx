import React, { useState, Fragment, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../../AuthProvider.jsx';
import axios from 'axios';
import { Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../index.css';

// Lucide icons
import {
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Search,
    User,
    Archive as FileArchive,
    Edit,
    Users,
    Plus,
    FolderOpen,
    FileText,
    X,
    UserPlus,
    Camera, // <-- add this
} from 'lucide-react';

import InfoSection from './components/InfoSection.jsx';
import AddStudentModal from './components/AddStudentModal.jsx';
import BulkModal from './components/BulkModal.jsx';
import PhotoToTextModal from './components/PhotoToTextModal.jsx';
import ArchiveConfirmModal from './components/ArchiveConfirmModal.jsx';
import { normalizeForUI, updateRawField } from './components/StudentUtils.jsx';
import StudentList from './components/StudentList.jsx';

function StudentRecords() {
    const { authData, logout } = useContext(AuthContext);
    // Para sa Intersection observers
    const studentsListRef = useRef(null);
    const itemRefs = useRef(new Map());
    const observerRef = useRef(null);
    const [visibleIds, setVisibleIds] = useState(new Set());

    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('Enrolled');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
    const [editedStudentData, setEditedStudentData] = useState(null);

    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState('basic');
    const [selectedYearLevel, setSelectedYearLevel] = useState('none');
    const [selectedProgram, setSelectedProgram] = useState('none');
    const navigate = useNavigate();

    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showPhotoToTextModal, setShowPhotoToTextModal] = useState(false);

    const [displayStudentList, setDisplayStudentList] = useState(false)

    const formatBirthDate = (input) => {
        if (!input) return "";
        const parts = input.split(/[\/\-]/);
        if (parts.length === 3) {
            const [m, d, y] = parts;
            if (y.length === 4) {
                return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            }
        }
        return input;
    };

    const setRef = (element, id) => {
        if (element) {
            itemRefs.current.set(id, element);
        } else {
            itemRefs.current.delete(id);
        }
    };

    const initialNewStudentFormState = {
        fullName: "", studentNumber: "",
        emailAddress: "", gradeYearLevel: "", programStrand: "", section: "",
        birthDate: "", age: "", gender: "", mobileNo: "", address: "",
        emergencyContact: "", contactNo: "", healthCondition: "",
        profileImage: null,
    };

    const [newStudentForm, setNewStudentForm] = useState(initialNewStudentFormState);

    const handleNewStudentFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setNewStudentForm((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setNewStudentForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleClearStudentForm = () => {
        setNewStudentForm(initialNewStudentFormState)
    }

    const handleCaseButton = () => {
        const idSearch = selectedStudentId

        navigate("/guidance/student-cases", { state: { idSearch: idSearch } })
    }

    const [addMode, setAddMode] = useState('individual');


    // Fetch student data based on the active tab
    useEffect(() => {
        const endpoint = activeTab === 'Enrolled' ? '/student/active' : '/student/archived';
        axios.get(endpoint)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setStudents(res.data);
                } else {
                    setStudents(res.data?.questions ?? res.data ?? []);
                }
            })
            .catch(err => {
                console.error('Error fetching student list', err);
                toast.error('Error fetching student list.');
                setStudents([]);
            });
    }, [activeTab, showAddStudentModal, showBulkModal, showPhotoToTextModal]);

    // Update selected student details from local state
    useEffect(() => {
        if (selectedStudentId) {
            // Find the student in the local 'students' state
            const student = students.find(s => s.id === selectedStudentId || s.sid === selectedStudentId);

            if (student) {
                setSelectedStudentDetails(student);
                setEditedStudentData(JSON.parse(JSON.stringify(student)));
                setIsEditing(false);
            } else {
                // If student is not found in the list (e.g., after an archive action), reset the state
                setSelectedStudentDetails(null);
                setEditedStudentData(null);
                setIsEditing(false);
            }
        } else {
            setSelectedStudentDetails(null);
            setEditedStudentData(null);
            setIsEditing(false);
        }
    }, [selectedStudentId, students]);

    const handleAddStudent = async () => {
        try {
            const formData = new FormData();
            Object.entries(newStudentForm).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await axios.post('/student/create', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setStudents(prev => [...prev, res.data]);
            setShowAddStudentModal(false);
            toast.success('Student Added Successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Error adding student.');
        }
    };

    const handleAddStudentButtonClick = () => {
        if (addMode === 'individual') setShowAddStudentModal(true);
        else if (addMode === 'bulk') setShowBulkModal(true);
        else if (addMode === 'photo') setShowPhotoToTextModal(true);
    };

    const handleArchiveStudent = async () => {

        if (selectedStudentId) {
            try {
                const archiveConfig = activeTab === 'Archived' ? 'restoreData' : 'archiveData';
                const res = await axios.put(`/student/${archiveConfig}/${selectedStudentId}`);

                setStudents(prev =>
                    prev.filter(student => student.id !== selectedStudentId && student.sid !== selectedStudentId)
                );

                setSelectedStudentId(null);

                setShowArchiveConfirmModal(false);
                toast.success(res.data?.message || "Student Archived Successfully! "); // Replaced alert
            } catch (err) {
                console.error(err);
                toast.error("Error archiving student.");
            }
        }
    };


    const handleSaveEdits = async () => {
        if (editedStudentData && selectedStudentId) {
            try {
                const payload = JSON.parse(JSON.stringify(editedStudentData));
                delete payload.id;

                const res = await axios.put(
                    `/student/update/${selectedStudentId}`,
                    payload
                );

                const updatedStudent = {
                    ...res.data.updates,
                    id: res.data.id, 
                };

                setStudents(prev =>
                    prev.map(student =>
                        (student.id === selectedStudentId || student.sid === selectedStudentId)
                            ? updatedStudent
                            : student
                    )
                );

                setSelectedStudentDetails(updatedStudent);
                setEditedStudentData(JSON.parse(JSON.stringify(updatedStudent)));
                setIsEditing(false);
                toast.success("Changes saved successfully!");
            } catch (err) {
                console.error(err);
                toast.error("Error saving changes.");
            }
        }
    };

    const handleInfoFieldChange = (category, field, value) => {
        setEditedStudentData(prev => {
            if (!prev) return prev;
            return updateRawField(prev, category, field, value);
        });
    };

    const displayStudentRaw = isEditing && editedStudentData ? editedStudentData : selectedStudentDetails;
    const uiGroup = normalizeForUI(displayStudentRaw);
    const displayStudentData = uiGroup;

    // Mapping for year level to section prefix
    const yearLevelMapping = {
        '1st Year College': '1',
        '2nd Year College': '2',
        '3rd Year College': '3',
        '4th Year College': '4',
    };

    const filteredStudents = students.filter(student => {
        const nameStr = (student.studentProfile?.name ?? student.name ?? '').toString().toLowerCase();
        const idStr = (student.sid ?? student.id ?? '').toString().toLowerCase();

        const matchesSearch = searchTerm === '' ||
            nameStr.includes(searchTerm.toLowerCase()) ||
            idStr.includes(searchTerm.toLowerCase());

        const matchesYearLevel = selectedYearLevel === 'none' ||
            (student.studentProfile?.section?.startsWith(yearLevelMapping[selectedYearLevel]));

        const matchesProgram = selectedProgram === 'none' ||
            (student.studentProfile?.program === selectedProgram);

        return matchesSearch && matchesYearLevel && matchesProgram;
    }).sort((a, b) => {
        const yearOrder = {
            'Grade 11': 1, 'Grade 12': 2,
            '1st Year College': 3, '2nd Year College': 4,
            '3rd Year College': 5, '4th Year College': 6,
            'Graduated': 7, 'Left': 8, 'NA': 9, '': 10
        };
        const yearA = yearOrder[a.yearLevel ?? a.studentProfile?.academicLevel] || 99;
        const yearB = yearOrder[b.yearLevel ?? b.studentProfile?.academicLevel] || 99;

        if (selectedYearLevel !== 'none') {
            if (yearA !== yearB) return yearA - yearB;
        }

        if (selectedProgram !== 'none') {
            if ((a.program ?? a.studentProfile?.program) !== (b.program ?? b.studentProfile?.program)) {
                return (a.program ?? a.studentProfile?.program ?? '').localeCompare(b.program ?? b.studentProfile?.program ?? '');
            }
        }

        return 0;
    });

    const yearLevelOptions = [
        "none", "Grade 11", "Grade 12", "1st Year College",
        "2nd Year College", "3rd Year College", "4th Year College",
    ];

    const [tertiaryPrograms, setTertiaryPrograms] = useState(() => {
        const stored = localStorage.getItem('tertiaryPrograms');
        if (stored) return JSON.parse(stored).map(p => p.acronym);
        return ["BMMA", "BSIT", "BSBA", "BSA", "BSCS", "BSECE"];
    });
    const [shsStrands, setShsStrands] = useState(() => {
        const stored = localStorage.getItem('shsStrands');
        if (stored) return JSON.parse(stored).map(s => s.acronym);
        return ["STEM", "TVL", "GAS", "HUMSS", "ABM", "ICT"];
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [programRes, strandRes] = await Promise.all([
                    axios.get("/content/program/get"),
                    axios.get("/content/strand/get")
                ]);

                setTertiaryPrograms(programRes.data.programs.map(p => p.acronym));
                setShsStrands(strandRes.data.strands.map(s => s.acronym));
            } catch (error) {
                console.error("Error fetching programs/strands:", error);
                toast.error("Failed to load program & strand options.");
            }
        };

        fetchData();
    }, []);

    // Listen for changes in localStorage (in case another tab updates)
    useEffect(() => {
        const syncLists = () => {
            const t = localStorage.getItem('tertiaryPrograms');
            const s = localStorage.getItem('shsStrands');
            if (t) setTertiaryPrograms(JSON.parse(t).map(p => p.acronym));
            if (s) setShsStrands(JSON.parse(s).map(s => s.acronym));
        };
        window.addEventListener('storage', syncLists);
        return () => window.removeEventListener('storage', syncLists);
    }, []);

    // Dynamic program options based on year level
    const getProgramOptions = () => {
        if (selectedYearLevel === "Grade 11" || selectedYearLevel === "Grade 12") {
            return ["none", ...shsStrands];
        }
        if (
            selectedYearLevel === "1st Year College" ||
            selectedYearLevel === "2nd Year College" ||
            selectedYearLevel === "3rd Year College" ||
            selectedYearLevel === "4th Year College"
        ) {
            return ["none", ...tertiaryPrograms];
        }
        // Default options
        return ["none", ...tertiaryPrograms];
    };

    if (!authData?.user?.access?.studentRecords?.canView) {
        return <Navigate to="/error401" replace />
    }

    useEffect(() => {
        // Disconnect the old observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create a new observer instance
        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleIds(prev => {
                    const next = new Set(prev);
                    entries.forEach(entry => {
                        const id = entry.target.getAttribute('data-student-id');
                        if (entry.isIntersecting) {
                            next.add(id);
                        } else {
                            next.delete(id);
                        }
                    });
                    return next;
                });
            },
            {
                root: studentsListRef.current, // Use the container as the root
                rootMargin: '200px', // Start loading 200px before the item enters the view
                threshold: 0.1,
            }
        );

        observerRef.current = observer;

        // Observe all the elements currently in the refs map
        itemRefs.current.forEach(el => {
            if (el) observer.observe(el);
        });

        // Cleanup function
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [filteredStudents]);

    return (
        <>
            {!displayStudentList ? (<div className="bg-gray-100 h-full p-3 rounded-lg">
                <div className="flex bg-gray-100 h-full overflow-hidden">
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />

                    {/* --- Student List --- */}
                    <div
                        className={`h-full bg-white border border-gray-100 shadow-lg flex flex-col rounded-lg transition-all duration-300 
                    ${selectedStudentId ? 'w-0 lg:w-96' : 'w-full lg:w-96'}`}
                    >
                        {/* Only show content if not collapsed */}
                        {!(selectedStudentId && window.innerWidth < 1024) && (
                            <>
                                <div className="p-2">
                                    <div className="flex items-center space-x-3">
                                        <p className="flex items-center space-x-2 mb-4">
                                            <Users className="inline-block w-8 h-8 mr-2 text-[#0172bd]" />
                                            <h2 className="text-3xl font-bold text-[#0172bd]">Student Records</h2>
                                        </p>
                                    </div>

                                {/* Archive/Enrolled */}
                                    <div className="flex justify-around bg-[#f3f4f6] p-1 rounded-lg">
                                        <button className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54] 
                                        ${activeTab === 'Archived' ? 'bg-[#0172bd] text-white shadow-sm hover:bg-blue-500' : 'text-black hover:bg-gray-200'}`}
                                            onClick={() => setActiveTab('Archived')}>
                                            <FileArchive className="inline-block w-5 h-5 mr-2" />
                                            Archive
                                        </button>
                                        <button className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54] 
                                        ${activeTab === 'Enrolled' ? 'bg-[#0172bd] text-white shadow-sm hover:bg-blue-500' : 'text-gray-700 hover:bg-gray-200'}`}
                                            onClick={() => setActiveTab('Enrolled')}>
                                            <Users className="inline-block w-5 h-5 mr-2" />
                                            Enrolled
                                        </button>
                                    </div>

                                </div>
                                {/* Student List */}
                                <div className="relative p-2">
                                    <button
                                        className="w-full bg-[#0172bd] font-semibold hover:bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                        onClick={() => setDisplayStudentList(true)}
                                        title="Student List"
                                    >
                                        <span className="pl-2">Student List</span>
                                        <FolderOpen className="w-5 h-5 ml-2" />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="relative p-2">
                                    <input type="text" placeholder="Name/ ID"
                                        className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] focus:border-transparent transition duration-150 ease-in-out hover:bg-gray-50"
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    <Search className="w-5 h-5 absolute right-5 top-4.5 text-gray-400" />
                                </div>

                                <div className="flex space-x-2 p-2">
                                    <div className="relative flex-1">
                                        <select className="text-sm text-[#0172bd] block w-full px-4 py-2 border hover:bg-gray-100 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0172bd] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                            value={selectedYearLevel} onChange={(e) => setSelectedYearLevel(e.target.value)}>

                                            <option value="none">Year Level</option>
                                            {yearLevelOptions.filter(opt => opt !== "none").map(option => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ">
                                            <ChevronDown className="w-4 h-4 text-[#0172bd]" />
                                        </div>
                                    </div>

                                    <div className="relative flex-1">
                                        <select
                                            className="text-sm text-[#0172bd] block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0172bd] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                            value={selectedProgram}
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                        >
                                            <option value="none">Program/Course</option>
                                            {getProgramOptions().filter(opt => opt !== "none").map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <ChevronDown className="w-4 h-4 text-[#0172bd]" />
                                        </div>
                                    </div>
                                </div>

                                {authData?.user?.access?.studentRecords?.canEdit ? (
                                    <div className="flex gap-2 p-2">
                                        <button
                                            className="flex-1 bg-[#0172bd] hover:bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg "
                                            title="Add Individual Student"
                                            onClick={() => setShowAddStudentModal(true)}
                                        >
                                            <UserPlus className="w-6 h-6 text-white" />
                                            
                                        </button>
                                        <button
                                            className="flex-1 bg-[#0172bd] hover:bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                            title="Bulk Add Students"
                                            onClick={() => setShowBulkModal(true)}
                                        >
                                            <Users className="w-6 h-6 text-white" />
                                            <Plus className="w-5 h-5 text-white" />
                                        </button>
                                        <button
                                            className="flex-1 bg-[#0172bd] hover:bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                            title="Photo-to-Text Add"
                                            onClick={() => setShowPhotoToTextModal(true)}
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                            <Plus className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                ) : null}

                                <div ref={studentsListRef} className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => {
                                            const sid = student.sid ?? student.id ?? 'N/A';
                                            const name = student.studentProfile?.name ?? student.name ?? sid;
                                            const isVisible = visibleIds.has(sid);

                                            return (
                                                <div
                                                    key={sid}
                                                    data-student-id={sid}
                                                    ref={(el) => setRef(el, sid)}
                                                    className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition duration-150 ease-in-out ${selectedStudentId === sid
                                                        ? 'bg-blue-100 border-l-4 border-blue-500'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSelectedStudentId(sid)}
                                                >
                                                    {isVisible ? (
                                                        <div className="flex items-center">
                                                            <User className="w-8 h-8 mr-5 text-[#0172bd]" />
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{name}</p>
                                                                <p className="text-sm text-gray-600">{sid}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ height: '50px', width: '100%' }}></div>
                                                    )}
                                                    <ChevronRight className="w-5 h-5 text-[#0172bd]" />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="p-4 text-gray-500 text-center">No students found.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* --- Student Details --- */}
                    <div
                        className={`
                            h-full bg-white border-r border-gray-200 shadow-sm flex flex-col rounded-lg transition-all duration-300 flex-1
                            ${selectedStudentId ? 'flex' : 'hidden lg:flex'} /* keep visible on desktop */
                        `}
                    >
                        <Fragment>
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex flex-wrap lg:items-center gap-2 lg:gap-4 w-full">
                                    {/* Back + Name */}
                                    <div className="flex items-center min-w-0 flex-shrink gap-2">
                                        <button
                                            className="p-2 rounded-lg hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer flex-shrink-0"
                                            onClick={() => setSelectedStudentId(null)}
                                        >
                                            <ChevronLeft className="w-8 h-8 text-[#0172bd]" />
                                        </button>
                                        {selectedStudentDetails && (
                                            <span className="text-xl sm:text-2xl font-semibold text-black truncate min-w-0 max-w-[100vw] lg:max-w-[350px]">
                                                {selectedStudentDetails.studentProfile?.name ?? selectedStudentDetails.name ?? ''}
                                            </span>
                                        )}
                                    </div>

                                    {/* InfoType Dropdown */}
                                    <div className="relative w-full sm:w-auto lg:w-56 flex-shrink-0">
                                        <select
                                            className="block w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 text-[#0172bd] focus:ring-[#0172bd] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 text-sm sm:text-base cursor-pointer"
                                            value={infoType}
                                            onChange={(e) => setInfoType(e.target.value)}
                                        >
                                            <option value="basic">Basic Information</option>
                                            <option value="personal">Personal Information</option>
                                            <option value="contact">Contact Information</option>
                                            <option value="family">Family Background</option>
                                            <option value="educational">Educational Background</option>
                                            <option value="work">Work Experience (Optional)</option>
                                            <option value="interests">Interests and Activities</option>
                                            <option value="health">Health</option>
                                            <option value="life">Life Circumstances</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <ChevronDown className="w-4 h-4 text-[#0172bd]" />
                                        </div>
                                    </div>
                                    {/* Buttons */}
                                    <div className="flex gap-2 flex-1 justify-end flex-wrap">
                                        <button
                                            className="bg-[#0172bd] font-semibold  hover:bg-blue-500 text-[#fef201] py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                            onClick={() => setDisplayStudentList(true)}
                                            title="Student List"
                                        >
                                            <span className="block lg:w-0 lg:h-0 lg:p-0 lg:m-0"><FolderOpen className="lg:w-0 lg:h-0 w-5 h-5" /></span>
                                            <span className="w-0 h-0 p-0 m-0 overflow-hidden lg:w-auto lg:h-auto lg:p-1 lg:m-0 lg:ml-1 lg:overflow-visible lg:flex items-center">Student List <FolderOpen className="w-5 h-5 ml-2" /></span>
                                        </button>
                                        {selectedStudentId !== null && (
                                            <>
                                                {authData?.user?.access?.studentRecords?.canEdit && (
                                                    <button
                                                        className={`py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out font-medium shadow-md hover:shadow-lg
                                                    ${isEditing
                                                                ? 'bg-blue-400 hover:bg-blue-600 text-white'
                                                                : 'bg-[#0172bd] hover:bg-blue-500 text-[#fef201]'}`}
                                                        onClick={() => { if (isEditing) { handleSaveEdits(); } setIsEditing(!isEditing); }}
                                                        title={isEditing ? "Save" : "Edit Student"}
                                                    >
                                                        <span className="block lg:w-0 lg:h-0 lg:p-0 lg:m-0"><Edit className="lg:w-0 lg:h-0 w-5 h-5" /></span>
                                                        <span className="w-0 h-0 p-0 m-0 overflow-hidden lg:w-auto lg:h-auto lg:p-1 lg:m-0 lg:ml-1 lg:overflow-visible lg:flex items-center">{isEditing ? 'Save' : 'Edit Student'} <Edit className="w-5 h-5 ml-2" /></span>
                                                    </button>
                                                )}
                                                <button
                                                    className="bg-[#0172bd] text-[#fef201] font-semibold hover:bg-blue-500  py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                                    onClick={handleCaseButton}
                                                    title="Case"
                                                >
                                                    <span className="block lg:w-0 lg:h-0 lg:p-0 lg:m-0"><FileText className="lg:w-0 lg:h-0 w-5 h-5" /></span>
                                                    <span className="w-0 h-0 p-0 m-0 overflow-hidden lg:w-auto lg:h-auto lg:p-1 lg:m-0 lg:ml-1 lg:overflow-visible lg:flex items-center">Case <FileText className="w-5 h-5 ml-2" /></span>
                                                </button>
                                                <button
                                                    className="bg-[#dc3545] font-semibold hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                                    onClick={() => setShowArchiveConfirmModal(true)}
                                                    title={activeTab === 'Archived' ? 'Restore' : 'Archive'}
                                                >
                                                    <span className="block lg:w-0 lg:h-0 lg:p-0 lg:m-0"><FileArchive className="lg:w-0 lg:h-0 w-5 h-5" /></span>
                                                    <span className="w-0 h-0 p-0 m-0 overflow-hidden lg:w-auto lg:h-auto lg:p-1 lg:m-0 lg:ml-1 lg:overflow-visible lg:flex items-center">{activeTab === 'Archived' ? 'Restore' : 'Archive'} <FileArchive className="w-5 h-5 ml-2" /></span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details body */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {selectedStudentDetails ? (
                                    <InfoSection
                                        infoType={infoType}
                                        student={displayStudentData[infoType]}
                                        isEditing={isEditing}
                                        onFieldChange={handleInfoFieldChange}
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-500 text-xl p-4 text-center">
                                        Select a student from the list to view their information.
                                    </div>
                                )}
                            </div>
                        </Fragment>
                    </div>

                    {/* --- Modals --- */}
                    <AddStudentModal
                        visible={showAddStudentModal}
                        onClose={() => setShowAddStudentModal(false)}
                        newStudentForm={newStudentForm}
                        handleNewStudentFormChange={handleNewStudentFormChange}
                        onSave={handleAddStudent}
                        clearForm={handleClearStudentForm}
                    />
                    <BulkModal visible={showBulkModal} onClose={() => setShowBulkModal(false)} />
                    <PhotoToTextModal
                        visible={showPhotoToTextModal}
                        onClose={() => setShowPhotoToTextModal(false)}
                        onOCRSuccess={(ocr) => {
                            setNewStudentForm((prev) => ({
                                ...prev,
                                fullName: ocr.name || "",
                                studentNumber: ocr.studentId || "",
                                emailAddress: ocr.email || "",
                                gradeYearLevel: ocr.yearLevel || "",
                                programStrand: ocr.program || "",
                                section: ocr.section || "",
                                birthDate: formatBirthDate(ocr.datebirth) || "",
                                age: ocr.age || "",
                                gender: ocr.gender || "",
                                mobileNo: ocr.mobileNo || "",
                                address: ocr.address || "",
                                emergencyContact: ocr.emergencyContact || "",
                                contactNo: ocr.contactNo || "",
                                healthCondition: ocr.healthCondition || "",
                            }));
                            setShowPhotoToTextModal(false);
                            setShowAddStudentModal(true);
                        }}
                    />
                    <ArchiveConfirmModal
                        visible={showArchiveConfirmModal}
                        onCancel={() => setShowArchiveConfirmModal(false)}
                        onConfirm={handleArchiveStudent}
                        todo={activeTab === 'Archived' ? 'restore' : 'archive'}
                    />
                </div>
            </div>) : <StudentList onBack={() => setDisplayStudentList(false)} />}
        </>
    );

}

export default StudentRecords;