import { useEffect, useState, useContext, useRef } from "react";
import { X, Check, Calendar, Plus, ChevronLeft, ChevronRight, Trash, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../../../AuthProvider.jsx";

const defaultForm = {
    studentNumber: "",
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    emailAddress: "",
    gradeYearLevel: "",
    programStrand: "",
    section: "",
    birthDate: "",
    gender: "",
    mobileNo: "",
    contactNo: "",
    address: "",
    family: {
        fatherName: "",
        fatherContact: "",
        motherName: "",
        motherContact: "",
        guardianName: "",
        guardianRelation: "",
        guardianContact: "",
    },
    emergencyChoice: "",
    emergencyContact: { name: "", contactNo: "" },
    health: {
        illness: [""],
        prescribedDrug: [""],
        hereditary: [""],
    },
};

const AddStudentModal = ({ visible, onClose, newStudentForm = null, clearForm = null }) => {
    const { authData } = useContext(AuthContext);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [defaultPassword, setDefaultPassword] = useState('student1234');
    const [showPassword, setShowPassword] = useState(false);

    const yearLevelOptions = ["Tertiary", "Senior High School"];
    const [collegePrograms, setCollegePrograms] = useState([]);
    const [shsStrands, setShsStrands] = useState([]);
    const [errorFields, setErrorFields] = useState({});

    // Debouncer
    const [alertFields, setAlertFields] = useState({});
    const [isCheckingStudent, setIsCheckingStudent] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const debounceTimeout = useRef(null);

    // Missing Fields
    const [missingFields, setMissingFields] = useState({});

    const [emergencyNames, setEmergencyNames] = useState({
        father: '',
        mother: '',
        guardian: '',
        home: ''
    })

    useEffect(() => {
        if (!visible) return;
        const fetchData = async () => {
            try {
                const [programRes, strandRes] = await Promise.all([
                    axios.get("/content/program/get"),
                    axios.get("/content/strand/get"),
                ]);

                const uniquePrograms = Array.from(
                    new Set((programRes.data.programs || []).map((p) => p.acronym))
                );
                const uniqueStrands = Array.from(
                    new Set((strandRes.data.strands || []).map((s) => s.acronym))
                );

                setCollegePrograms(uniquePrograms);
                setShsStrands(uniqueStrands);
            } catch (error) {
                console.error("Error fetching programs/strands:", error);
                toast.error("Failed to load program & strand options.");
            }
        };
        fetchData();
    }, [visible]);


    useEffect(() => {
        if (newStudentForm) {
            setForm((prev) => ({
                ...prev,
                studentNumber: newStudentForm.studentNumber || newStudentForm.sid || "",
                lastName: newStudentForm.lastName || "",
                firstName: newStudentForm.firstName || "",
                middleName: newStudentForm.middleName || "",
                suffix: newStudentForm.suffix || "",
                emailAddress: newStudentForm.emailAddress || "",
                gradeYearLevel: newStudentForm.gradeYearLevel || newStudentForm.grade || "",
                programStrand: newStudentForm.programStrand || newStudentForm.program || "",
                section: newStudentForm.section || "",
                birthDate: newStudentForm.birthDate || newStudentForm.birth || "",
                gender: newStudentForm.gender || "",
                mobileNo: newStudentForm.mobileNo || "",
                contactNo: newStudentForm.contactNo || "",
                address: newStudentForm.address || "",
                family: {
                    fatherName: newStudentForm.fatherName || "",
                    fatherContact: newStudentForm.fatherContact || "",
                    motherName: newStudentForm.motherName || "",
                    motherContact: newStudentForm.motherContact || "",
                    guardianName: newStudentForm.guardianName || "",
                    guardianRelation: newStudentForm.guardianRelation || "",
                    guardianContact: newStudentForm.guardianContact || "",
                },
                emergencyChoice: "",
                emergencyContact: { name: "", contactNo: "" },
                health: {
                    illness: newStudentForm.health?.illness && newStudentForm.health.illness.length ? newStudentForm.health.illness : [""],
                    prescribedDrug:
                        newStudentForm.health?.prescribedDrug && newStudentForm.health.prescribedDrug.length
                            ? newStudentForm.health.prescribedDrug
                            : [""],
                    hereditary:
                        newStudentForm.health?.hereditary && newStudentForm.health.hereditary.length
                            ? newStudentForm.health.hereditary
                            : [""],
                },
            }));
        } else {
            setForm(defaultForm);
        }
    }, [newStudentForm, visible]);

    useEffect(() => {
        const { emergencyChoice } = form;
        if (emergencyChoice) syncEmergencyFromChoice(emergencyChoice);
    }, [form.mobileNo, form.contactNo, form.family]);

    const programOptions =
        form.gradeYearLevel === "Tertiary" ? collegePrograms : form.gradeYearLevel === "Senior High School" ? shsStrands : [];

    const update = (pathOrKey, value) => {
        if (typeof pathOrKey === "string" && pathOrKey.includes(".")) {
            const parts = pathOrKey.split(".");
            setForm((prev) => {
                const copy = JSON.parse(JSON.stringify(prev));
                let cur = copy;
                for (let i = 0; i < parts.length - 1; i++) {
                    cur = cur[parts[i]];
                    if (cur === undefined) return prev;
                }
                cur[parts[parts.length - 1]] = value;
                return copy;
            });
        } else {
            setForm((prev) => ({ ...prev, [pathOrKey]: value }));
        }
    };

    // Replace existing handleBasicChange function
    const handleBasicChange = async (e) => {
        const { name, value } = e.target;
        update(name, value);

        if (name === "studentNumber") {
            validateStudentNumber(value);

            // Clear any existing timeout
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            // Set new timeout
            debounceTimeout.current = setTimeout(async () => {
                if (value.length === 11) { // Only check if length is correct
                    await checkExistingStudent(value);
                }
            }, 500);
        }

        if (name === "emailAddress") {
            validateEmail(value);

            // Clear any existing timeout
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            // Set new timeout
            debounceTimeout.current = setTimeout(async () => {
                if (value.includes("@")) { // Only check if it looks like an email
                    await checkExistingEmail(value);
                }
            }, 500);
        }
    };

    const addHealthEntry = (field) => {
        setForm((prev) => {
            const copy = { ...prev };
            copy.health = { ...copy.health };
            copy.health[field] = [...(copy.health[field] || []), ""];
            return copy;
        });
    };
    const removeHealthEntry = (field, idx) => {
        setForm((prev) => {
            const copy = { ...prev };
            copy.health = { ...copy.health };
            copy.health[field] = copy.health[field].filter((_, i) => i !== idx);
            if (copy.health[field].length === 0) copy.health[field] = [""];
            return copy;
        });
    };
    const setHealthEntry = (field, idx, value) => {
        setForm((prev) => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy.health[field][idx] = value;
            return copy;
        });
    };

    const handleFamilyChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, family: { ...prev.family, [name]: value } }));
    };

    const syncEmergencyFromChoice = (choice) => {
        let name = "";
        let contactNo = "";
        if (!choice) {
            setForm((prev) => ({ ...prev, emergencyContact: { name: "", contactNo: "" } }));
            return;
        }
        if (choice === "fatherContact") {
            name = form.family.fatherName || "Father";
            contactNo = form.family.fatherContact || "";
        } else if (choice === "motherContact") {
            name = form.family.motherName || "Mother";
            contactNo = form.family.motherContact || "";
        } else if (choice === "guardianContact") {
            name = form.family.guardianName || "Guardian";
            contactNo = form.family.guardianContact || "";
        }
        setForm((prev) => ({ ...prev, emergencyChoice: choice, emergencyContact: { name, contactNo } }));
    };

    // Debouncer
    // Add after other function declarations
    const validateStudentNumber = (value) => {
        const pattern = /^02000\d{6}$/;
        if (!pattern.test(value)) {
            setAlertFields(prev => ({
                ...prev,
                studentNumber: "Student number must follow the format: 02000XXXXXX"
            }));
        } else {
            setAlertFields(prev => {
                const newAlerts = { ...prev };
                delete newAlerts.studentNumber;
                return newAlerts;
            });
        }
    };

    const validateEmail = (value) => {
        const pattern = /^[a-zA-Z0-9._%+-]+@dasmarinas\.sti\.edu\.ph$/;
        if (!pattern.test(value)) {
            setAlertFields(prev => ({
                ...prev,
                emailAddress: "Email must be in the format: name@dasmarinas.sti.edu.ph"
            }));
        } else {
            setAlertFields(prev => {
                const newAlerts = { ...prev };
                delete newAlerts.emailAddress;
                return newAlerts;
            });
        }
    };

    const checkExistingStudent = async (studentNumber) => {
        try {
            setIsCheckingStudent(true);
            const response = await axios.get(`/student/check/studentNumber/${studentNumber}`);
            if (response.data.exists) {
                setErrorFields(prev => ({
                    ...prev,
                    studentNumber: "Student number already exists"
                }));
                return true;
            } else {
                // Clear the error when student number is unique
                setErrorFields(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.studentNumber;
                    return newErrors;
                });
            }
            return false;
        } catch (error) {
            if (error.response?.status === 404) {
                // Clear the error when student number is unique
                setErrorFields(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.studentNumber;
                    return newErrors;
                });
            } else {
                console.error("Error checking student number:", error);
            }
            return false;
        } finally {
            setIsCheckingStudent(false);
        }
    };

    const checkExistingEmail = async (email) => {
        try {
            setIsCheckingEmail(true);
            const response = await axios.get(`/student/check/email?email=${email}`);
            if (response.data.exists) {
                setErrorFields(prev => ({
                    ...prev,
                    emailAddress: "Email address already exists"
                }));
                return true;
            } else {
                // Clear the error when email is unique
                setErrorFields(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.emailAddress;
                    return newErrors;
                });
            }
            return false;
        } catch (error) {
            if (error.response?.status === 404) {
                // Clear the error when email is unique
                setErrorFields(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.emailAddress;
                    return newErrors;
                });
            } else {
                console.error("Error checking email:", error);
            }
            return false;
        } finally {
            setIsCheckingEmail(false);
        }
    };

    useEffect(() => {
        const updatedNames = {
            father: form.family.fatherName || '',
            mother: form.family.motherName || '',
            guardian: form.family.guardianName || '',
            home: form.contactNo ? 'Home' : ''
        };
        setEmergencyNames(updatedNames);
    }, [form.family.fatherName, form.family.motherName, form.family.guardianName, form.contactNo]);

    useEffect(() => {
        if (form.emergencyContact.name === form.family.fatherName) {
            setForm((prev) => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    contactNo: prev.family.fatherContact,
                },
            }));
        } else if (form.emergencyContact.name === form.family.motherName) {
            setForm((prev) => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    contactNo: prev.family.motherContact,
                },
            }));
        } else if (form.emergencyContact.name === form.family.guardianName) {
            setForm((prev) => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    contactNo: prev.family.guardianContact,
                },
            }));
        } else if (form.emergencyContact.name === "Home") {
            setForm((prev) => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    contactNo: prev.contactNo,
                },
            }));
        }
    }, [
        form.family.fatherContact,
        form.family.motherContact,
        form.family.guardianContact,
        form.contactNo,
        form.emergencyContact.name,
    ]);

    const validateBasic = () => {
        const newErrors = {};

        // Only validate empty fields if user tries to proceed (handleNext)
        if (step === 0) {
            // Check required fields
            if (!form.studentNumber?.trim()) {
                newErrors.studentNumber = "Student number is required";
            }
            if (!form.lastName?.trim()) newErrors.lastName = true;
            if (!form.firstName?.trim()) newErrors.firstName = true;
            if (!form.emailAddress?.trim()) {
                newErrors.emailAddress = "Email address is required";
            }
            if (!form.gradeYearLevel) newErrors.gradeYearLevel = true;
            if (!form.programStrand) newErrors.programStrand = true;
            if (!form.birthDate) newErrors.birthDate = true;
            if (!form.gender) newErrors.gender = true;
            if (!form.mobileNo?.trim()) newErrors.mobileNo = true;
            if (!form.address?.trim()) newErrors.address = true;
        }

        // Preserve existing error messages for duplicates
        if (errorFields.studentNumber) {
            newErrors.studentNumber = errorFields.studentNumber;
        }
        if (errorFields.emailAddress) {
            newErrors.emailAddress = errorFields.emailAddress;
        }

        // Check for alert fields (format warnings)
        if (alertFields.studentNumber || alertFields.emailAddress) {
            toast.warning("Please check the format of student number and email address");
        }

        setErrorFields(newErrors);

        // Only apply shake animation when validating on next button click
        if (step === 0) {
            Object.keys(newErrors).forEach((key) => {
                // Skip shake animation for duplicate errors
                if ((key === "studentNumber" && errorFields.studentNumber) ||
                    (key === "emailAddress" && errorFields.emailAddress)) {
                    return;
                }
                const el = document.querySelector(`[name="${key}"]`);
                if (el) {
                    el.classList.remove("animate-shake");
                    void el.offsetWidth;
                    el.classList.add("animate-shake");
                }
            });
        }

        return Object.keys(newErrors).length === 0;
    };


    const validateFamily = () => {
        const newErrors = {};

        if (!form.emergencyContact.name?.trim()) newErrors.emergencyName = true;
        if (!form.emergencyContact.contactNo?.trim()) newErrors.emergencyNo = true;

        setErrorFields(newErrors);

        Object.keys(newErrors).forEach((key) => {
            const el = document.querySelector(`[name="${key}"]`);
            if (el) {
                el.classList.remove("animate-shake");
                void el.offsetWidth;
                el.classList.add("animate-shake");
            }
        });

        return Object.keys(newErrors).length === 0;
    };


    const handleNext = () => {
        if (step === 0 && !validateBasic()) return;
        if (step === 1 && !validateFamily()) return;
        setStep((s) => Math.min(2, s + 1));
    };

    const handlePrev = () => setStep((s) => Math.max(0, s - 1));

    const handleAddStudent = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const fullName = [
            form.lastName,
            form.firstName ? `, ${form.firstName}` : "",
            form.middleName ? ` ${form.middleName}` : "",
            form.suffix ? ` ${form.suffix}` : "",
        ]
            .filter(Boolean)
            .join("");

        const payload = {
            sid: form.studentNumber,
            isArchived: false,
            studentProfile: {
                name: fullName,
                lastName: form.lastName,
                firstName: form.firstName,
                middleName: form.middleName,
                suffix: form.suffix,
                academicLevel: form.gradeYearLevel,
                program: form.programStrand,
                section: form.section,
                birthday: form.birthDate,
                gender: form.gender,
            },
            contactInfo: {
                email: form.emailAddress,
                contactNo: form.mobileNo || "",
                homeNo: form.contactNo || "",
                address: {
                    currentAddress: form.address || "",
                },
            },
            familyBackground: {
                fatherInfo: { name: form.family.fatherName || "", contactNo: form.family.fatherContact || "" },
                motherInfo: { name: form.family.motherName || "", contactNo: form.family.motherContact || "" },
                guardian: {
                    name: form.family.guardianName || "",
                    relation: form.family.guardianRelation || "",
                    contactNo: form.family.guardianContact || "",
                },
                emergency: {
                    name: form.emergencyContact.name || "",
                    contactNo: form.emergencyContact.contactNo || "",
                },
            },
            health: {
                illness: (form.health.illness || []).map((s) => s.trim()).filter(Boolean),
                prescribedDrug: (form.health.prescribedDrug || []).map((s) => s.trim()).filter(Boolean),
                hereditary: (form.health.hereditary || []).map((s) => s.trim()).filter(Boolean),
            },
        };

        try {
            await axios.post("/student/create", { processedBy: authData?.displayName ?? 'Admin', ...payload });
            toast.success("Student Created Successfully!");
            if (clearForm) clearForm();
            onClose();
            setForm(defaultForm);
            setStep(0);
        } catch (error) {
            console.error("Error creating student:", error);
            toast.error("Student Creation Unsuccessful.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center border-b border-[#0172bd] pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd] ">
                        {step === 0 ? "Fill up Basic Information" : step === 1 ? "Fill up Family Information" : "Fill up Health Information"}
                    </h3>
                    <button className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer" onClick={onClose}>
                        <X className="w-8 h-8 text-[#0172bd]" />
                    </button>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`px-3 py-1 rounded ${step === 0 ? "bg-[#0172bd] text-white" : "bg-gray-100"}`}>1. Basic</div>
                    <div className={`px-3 py-1 rounded ${step === 1 ? "bg-[#0172bd] text-white" : "bg-gray-100"}`}>2. Family & Contact</div>
                    <div className={`px-3 py-1 rounded ${step === 2 ? "bg-[#0172bd] text-white" : "bg-gray-100"}`}>3. Health</div>
                </div>

                {/* Step content */}
                {step === 0 && (
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Existing fields */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">
                                    Student Number:<span className="text-red-700">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="studentNumber"
                                    name="studentNumber"
                                    value={form.studentNumber}
                                    onChange={handleBasicChange}
                                    placeholder="02000XXXXXX"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.studentNumber ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`}
                                />
                                {alertFields.studentNumber && !errorFields.studentNumber && (
                                    <p className="text-yellow-600 text-sm mt-1">{alertFields.studentNumber}</p>
                                )}
                                {errorFields.studentNumber && (
                                    <p className="text-red-600 text-sm mt-1">{errorFields.studentNumber}</p>
                                )}
                                {isCheckingStudent && (
                                    <p className="text-blue-600 text-sm mt-1">Checking student number...</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name:<span className="text-red-700">*</span>
                                </label>
                                <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleBasicChange} placeholder="e.g., Dela Cruz"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.lastName ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`} />
                            </div>
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name:<span className="text-red-700">*</span>
                                </label>
                                <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleBasicChange} placeholder="e.g., Juan"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.firstName ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`} />
                            </div>
                            <div>
                                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                                    Middle Name:
                                </label>
                                <input type="text" id="middleName" name="middleName" value={form.middleName} onChange={handleBasicChange} placeholder="e.g., Santos" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                                    Suffix:
                                </label>
                                <input type="text" id="suffix" name="suffix" value={form.suffix} onChange={handleBasicChange} placeholder="e.g., Jr., III" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <div className="relative">
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                                        Birth Date:<span className="text-red-700">*</span>
                                    </label>
                                    <input type="date" id="birthDate" name="birthDate" value={form.birthDate} onChange={handleBasicChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                            ${errorFields.birthDate ? "border-red-500 animate-shake" : "border-gray-300"} 
                                            focus:ring-blue-500 focus:border-blue-500`} />
                                    <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer" onClick={() => document.getElementById("birthDate")?.showPicker?.()} tabIndex={-1}>
                                        <Calendar className="w-5 h-5 mt-6" />
                                    </span>
                                </div>
                            </div>
                            <div
                                className={`flex space-x-4 p-2 rounded-md 
              ${errorFields.gender ? "border-2 border-red-500 animate-shake" : "border border-transparent"}`}
                            >
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={form.gender === "Male"}
                                        onChange={(e) => {
                                            update("gender", e.target.value);
                                            setErrorFields((prev) => ({ ...prev, gender: false }));
                                        }}
                                        className="form-radio text-blue-600 h-4 w-4"
                                    />
                                    <span className="ml-2 text-gray-700">Male</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={form.gender === "Female"}
                                        onChange={(e) => {
                                            update("gender", e.target.value);
                                            setErrorFields((prev) => ({ ...prev, gender: false }));
                                        }}
                                        className="form-radio text-blue-600 h-4 w-4"
                                    />
                                    <span className="ml-2 text-gray-700">Female</span>
                                </label>
                            </div>

                        </div>

                        <div className="space-y-4">



                            <div>
                                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                                    Email Address:<span className="text-red-700">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="emailAddress"
                                    name="emailAddress"
                                    value={form.emailAddress}
                                    onChange={handleBasicChange}
                                    placeholder="student@dasmarinas.sti.edu.ph"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                            ${errorFields.emailAddress ? "border-red-500" :
                                            alertFields.emailAddress ? "border-yellow-500" : "border-gray-300"} 
                                            focus:ring-blue-500 focus:border-blue-500`}
                                />
                                {alertFields.emailAddress && !errorFields.emailAddress && (
                                    <p className="text-yellow-600 text-sm mt-1">{alertFields.emailAddress}</p>
                                )}
                                {errorFields.emailAddress && (
                                    <p className="text-red-600 text-sm mt-1">{errorFields.emailAddress}</p>
                                )}
                                {isCheckingEmail && (
                                    <p className="text-blue-600 text-sm mt-1">Checking email address...</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 ">
                                    Year Level:<span className="text-red-700">*</span>
                                </label>
                                <select name="gradeYearLevel" value={form.gradeYearLevel} onChange={(e) => update("gradeYearLevel", e.target.value)}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.gradeYearLevel ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`}>
                                    <option value="">Select Year Level</option>
                                    {yearLevelOptions.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {form.gradeYearLevel === "Tertiary" ? "Program" : "Strand"}
                                    <span className="text-red-700">*</span>:
                                </label>
                                <select name="programStrand" value={form.programStrand} onChange={(e) => update("programStrand", e.target.value)}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.programStrand ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`} disabled={!form.gradeYearLevel}>
                                    <option value="">{form.gradeYearLevel === "Tertiary" ? "Select Program" : form.gradeYearLevel === "Senior High School" ? "Select Strand" : "Select Year Level first"}</option>
                                    {programOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                                    Section:
                                </label>
                                <input type="text" id="section" name="section" value={form.section} onChange={handleBasicChange} placeholder="Enter the section" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>


                            <div>
                                <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">
                                    Mobile No.:<span className="text-red-700">*</span>
                                </label>
                                <input type="text" id="mobileNo" name="mobileNo" value={form.mobileNo} onChange={handleBasicChange} placeholder="09XXXXXXXXXX"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.mobileNo ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`} />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Address:<span className="text-red-700">*</span>
                                </label>
                                <textarea id="address" name="address" value={form.address} onChange={handleBasicChange} rows="3" placeholder="Enter the address"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.address ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`}></textarea>
                            </div>
                        </div>

                        {/* Default Password Section */}
                        <div className="col-span-2 mt-4">
                            <label className="block text-sm font-medium text-[#0172bd]">Default Password</label>
                            <div className="mt-1 flex items-center">
                                <span className="block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100 px-3 py-1 bg-gray-50 text-gray-900">
                                    {showPassword ? defaultPassword : '******'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Father Name</label>
                                <input type="text" name="fatherName" value={form.family.fatherName} onChange={handleFamilyChange} placeholder="Father's full name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Father Contact No.</label>
                                <input type="text" name="fatherContact" value={form.family.fatherContact} onChange={handleFamilyChange} placeholder="09XXXXXXXXX" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mother Name</label>
                                <input type="text" name="motherName" value={form.family.motherName} onChange={handleFamilyChange} placeholder="Mother's full name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mother Contact No.</label>
                                <input type="text" name="motherContact" value={form.family.motherContact} onChange={handleFamilyChange} placeholder="09XXXXXXXXX" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label htmlFor="emerContactName" className="block text-sm font-medium text-gray-700">
                                    Emergency Contact Name<span className="text-red-700">*</span>
                                </label>
                                <select
                                    id="emerContactName"
                                    name="emergencyName"
                                    value={form.emergencyContact.name}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        let contactNo = "";
                                        if (selectedName === form.family.fatherName) contactNo = form.family.fatherContact;
                                        else if (selectedName === form.family.motherName) contactNo = form.family.motherContact;
                                        else if (selectedName === form.family.guardianName) contactNo = form.family.guardianContact;
                                        else if (selectedName === "Home") contactNo = form.contactNo;

                                        setForm((prev) => ({
                                            ...prev,
                                            emergencyContact: { name: selectedName, contactNo },
                                        }));
                                        setErrorFields((prev) => ({ ...prev, emergencyName: false }));
                                    }}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.emergencyName ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`}
                                >
                                    <option value="">None</option>
                                    {Object.entries(emergencyNames).map(([key, value]) =>
                                        value ? (
                                            <option key={key} value={value}>
                                                {value}
                                            </option>
                                        ) : null
                                    )}
                                </select>
                            </div>

                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
                                <input type="text" name="guardianName" value={form.family.guardianName} onChange={handleFamilyChange} placeholder="Guardian's full name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Relation</label>
                                <input type="text" name="guardianRelation" value={form.family.guardianRelation} onChange={handleFamilyChange} placeholder="Relation to student" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Guardian Contact No.</label>
                                <input type="text" name="guardianContact" value={form.family.guardianContact} onChange={handleFamilyChange} placeholder="09XXXXXXXXX" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700">
                                    Home No.:
                                </label>
                                <input type="text" id="contactNo" name="contactNo" value={form.contactNo} onChange={handleBasicChange} placeholder="Enter home or hotline #" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label htmlFor="emerContactNo" className="block text-sm font-medium text-gray-700">
                                    Emergency Contact No.<span className="text-red-700">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="emerContactNo"
                                    name="emergencyNo"
                                    value={form.emergencyContact.contactNo}
                                    onChange={(e) => {
                                        update("emergencyContact.contactNo", e.target.value);
                                        setErrorFields((prev) => ({ ...prev, emergencyNo: false }));
                                    }}
                                    placeholder="09XXXXXXXXX"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none 
                                        ${errorFields.emergencyNo ? "border-red-500 animate-shake" : "border-gray-300"} 
                                        focus:ring-blue-500 focus:border-blue-500`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        {/* Illness */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Illness (can add multiple)</label>
                                <button type="button" onClick={() => addHealthEntry("illness")} className="flex items-center space-x-2 text-sm text-[#0172bd]">
                                    <Plus className="w-4 h-4" /> <span>Add</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(form.health.illness || []).map((val, idx) => (
                                    <div key={`ill-${idx}`} className="flex items-center gap-2">
                                        <input type="text" value={val} onChange={(e) => setHealthEntry("illness", idx, e.target.value)} placeholder="Illness" className="flex-1 border rounded py-2 px-3" />
                                        <button type="button" onClick={() => removeHealthEntry("illness", idx)} className="p-2 hover:bg-gray-100 rounded">
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Prescribed Drugs */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Prescribed Drugs (can add multiple)</label>
                                <button type="button" onClick={() => addHealthEntry("prescribedDrug")} className="flex items-center space-x-2 text-sm text-[#0172bd]">
                                    <Plus className="w-4 h-4" /> <span>Add</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(form.health.prescribedDrug || []).map((val, idx) => (
                                    <div key={`drug-${idx}`} className="flex items-center gap-2">
                                        <input type="text" value={val} onChange={(e) => setHealthEntry("prescribedDrug", idx, e.target.value)} placeholder="Drug / medication" className="flex-1 border rounded py-2 px-3" />
                                        <button type="button" onClick={() => removeHealthEntry("prescribedDrug", idx)} className="p-2 hover:bg-gray-100 rounded">
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hereditary */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Hereditary Illness (can add multiple)</label>
                                <button type="button" onClick={() => addHealthEntry("hereditary")} className="flex items-center space-x-2 text-sm text-[#0172bd]">
                                    <Plus className="w-4 h-4" /> <span>Add</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(form.health.hereditary || []).map((val, idx) => (
                                    <div key={`her-${idx}`} className="flex items-center gap-2">
                                        <input type="text" value={val} onChange={(e) => setHealthEntry("hereditary", idx, e.target.value)} placeholder="Hereditary illness" className="flex-1 border rounded py-2 px-3" />
                                        <button type="button" onClick={() => removeHealthEntry("hereditary", idx)} className="p-2 hover:bg-gray-100 rounded">
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer buttons */}
                <div className="mt-6 flex items-center justify-between">
                    <div>
                        <button onClick={onClose} className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer">
                            Cancel
                            <X className="w-6 h-6 ml-2" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <button onClick={handlePrev} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center">
                                <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                            </button>
                        )}

                        {step < 2 && (
                            <button onClick={handleNext} className="bg-[#0172bd] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center cursor-pointer">
                                Next <ChevronRight className="w-5 h-5 ml-2" />
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                onClick={handleAddStudent}
                                disabled={isSubmitting}
                                className={`${isSubmitting ? "bg-green-300 cursor-not-allowed" : "bg-[#28a745] hover:bg-green-500"
                                    } text-white font-bold py-2 px-4 rounded-lg flex items-center`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                            ></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Save <Check className="w-6 h-6 ml-2" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
