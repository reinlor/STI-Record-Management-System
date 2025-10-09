// ContentManagement.jsx (relevant portions / complete file replacement recommended)
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Plus,
    X,
    Check,
    Bell,
    GraduationCap,
    Building,
    Link2,
    ShieldAlert,
    CalendarDays,
    FileText,
} from "lucide-react";

// Components
import Toast from "./components/Toast";
import AnnouncementPanel from "./components/AnnouncementPanel";
import ProgramsPanel from "./components/ProgramsPanel";
import WellnessPanel from "./components/WellnessPanel";
import ViolationsPanel from "./components/ViolationsPanel";
import SchoolYearPanel from "./components/SchoolYearPanel";
import QuickLinksPanel from "./components/QuickLinksPanel";
import AddProgramModal from "./components/AddProgramModal";
import AddQuickLinkModal from "./components/AddQuickLinkModal";
import AddViolationModal from "./components/AddViolationModal";
import LoadingDots from "../../../component/Loading";

const PANEL = {
    ANNOUNCEMENT: "announcement",
    PROGRAMS: "programs",
    WELLNESS: "wellness",
    QUICKLINKS: "quicklinks",
    VIOLATIONS: "violations",
    SCHOOL_YEAR: "school_year",
};

export default function ContentManagement() {
    const [activePanel, setActivePanel] = useState(PANEL.ANNOUNCEMENT);

    // State
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "" });
    const [tertiaryPrograms, setTertiaryPrograms] = useState([]);
    const [shsStrands, setShsStrands] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [newItem, setNewItem] = useState({ name: "", acronym: "" });
    const [isEditingProgram, setIsEditingProgram] = useState(false);
    const [tempWellnessLink, setTempWellnessLink] = useState("");
    const [programModalType, setProgramModalType] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

    // Violations states
    const [violations, setViolations] = useState([]);
    const [newViolation, setNewViolation] = useState({ category: "", priority: "1", violations: [], offense: "" });
    const [offenses, setOffenses] = useState([]);
    const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [isEditingViolation, setIsEditingViolation] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

    const [quickLinks, setQuickLinks] = useState([]);
    const [newQuickLink, setNewQuickLink] = useState({ title: "", file: null });
    const [schoolYearData, setSchoolYearData] = useState();
    const [tempSchoolYearData, setTempSchoolYearData] = useState({ ...schoolYearData });
    const [isLoading, setIsLoading] = useState(true);

    // Mock API endpoint
    const API = "/content";

    // Toast helper
    const showToast = (message, type) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
    };

    // Fetch data on load
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API}/getAll`);
                // keep previous behavior for announcement/programs/etc
                console.log(response.data);
                setAnnouncements(response.data[0].announcement.messages);
                setShsStrands(response.data[3].programStrand.strand);
                setTertiaryPrograms(response.data[3].programStrand.program);
                setSchoolYearData(response.data[4].schoolPeriod);
                setTempWellnessLink(response.data[7].wellness.link);
            } catch (error) {
                console.error("Error fetching content management data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchViolationsAndOffenses = async () => {
            try {
                // Fetch violations
                const vResp = await axios.get(`${API}/violations/get`);
                const vData = vResp.data || {};
                const vList = Object.keys(vData).map((key) => {
                    const payload = vData[key] || {};
                    return {
                        category: key,
                        priority: payload.priorityLevel || payload.priority || "1",
                        violations: payload.violations || [],
                        offense: payload.offense || payload.offence || "",
                    };
                });
                setViolations(vList);
            } catch (err) {
                console.warn("No violations found or failed to fetch:", err?.response?.data || err.message);
                setViolations([]);
            }

            try {
                const oResp = await axios.get(`${API}/offenses/get`);
                const oData = oResp.data || {};
                const offenseKeys = Object.keys(oData);
                setOffenses(offenseKeys);
            } catch (err) {
                console.warn("No offenses found or failed to fetch:", err?.response?.data || err.message);
                setOffenses([]);
            }
        };

        fetchData();
        fetchViolationsAndOffenses();
    }, []);

    // === Announcement handlers ===

    const handlePostAnnouncement = async () => {
        if (newAnnouncement.title && newAnnouncement.body) {
            try {
                await axios.post(`${API}/announcement/add`, {
                    title: newAnnouncement.title,
                    description: newAnnouncement.body,
                });
                setAnnouncements([
                    {
                        title: newAnnouncement.title,
                        description: newAnnouncement.body,
                        timeCreated: new Date(),
                    },
                    ...announcements,
                ]);
                setNewAnnouncement({ title: "", body: "" });
                showToast("New announcement successfully posted!", "success");
            } catch (error) {
                console.error("Error posting announcement:", error);
                showToast("Failed to post announcement.", "error");
            }
        } else {
            showToast("Please fill out both title and body fields.", "error");
        }
    };


    // === Violations handlers ===

    const openAddViolationModal = () => {
        setNewViolation({ category: "", priority: "1", violations: [], offense: "" });
        setIsEditingViolation(false);
        setIsViolationModalOpen(true);
    };

    const handleAddViolation = async (violationObj) => {
        try {
            await axios.post(`${API}/violations/add`, {
                violationCategoryName: violationObj.category,
                priorityLevel: violationObj.priority,
                violations: violationObj.violations || [],
                offense: violationObj.offense || "",
            });
            // optimistic update
            setViolations((prev) => [
                ...prev,
                {
                    category: violationObj.category,
                    priority: violationObj.priority,
                    violations: violationObj.violations || [],
                    offense: violationObj.offense || "",
                },
            ]);
            setIsViolationModalOpen(false);
            showToast("New violation successfully added!", "success");
        } catch (error) {
            console.error("Error adding violation:", error);
            showToast("Failed to add violation.", "error");
        } finally {
            setNewViolation({ category: "", priority: "1", violations: [], offense: "" });
        }
    };

    const handleEditCategory = (v) => {
        // prepare editing object, keep track of original name for rename actions
        setNewViolation({
            category: v.category,
            priority: v.priority,
            violations: [...(v.violations || [])],
            offense: v.offense || "",
            oldCategoryName: v.category,
        });
        setIsEditingViolation(true);
        setIsViolationModalOpen(true);
    };

    const handleUpdateViolation = async (violationObj) => {
        try {
            await axios.put(`${API}/violations/update`, {
                oldCategoryName: violationObj.oldCategoryName, // optional
                violationCategoryName: violationObj.category,
                priorityLevel: violationObj.priority,
                violations: violationObj.violations || [],
                offense: violationObj.offense || "",
            });

            // Update local state: handle rename if happened
            setViolations((prev) => {
                const filtered = prev.filter((p) => p.category !== violationObj.oldCategoryName);
                const updated = {
                    category: violationObj.category,
                    priority: violationObj.priority,
                    violations: violationObj.violations || [],
                    offense: violationObj.offense || "",
                };
                // ensure no duplicate entries
                const exists = prev.some((p) => p.category === violationObj.category && violationObj.oldCategoryName !== violationObj.category);
                return exists ? prev.map((p) => (p.category === violationObj.category ? updated : p)) : [updated, ...filtered];
            });

            setIsViolationModalOpen(false);
            setIsEditingViolation(false);
            showToast("Violation category updated!", "success");
        } catch (error) {
            console.error("Error updating violation:", error);
            showToast("Failed to update violation.", "error");
        }
    };

    const handleDeleteCategory = (v) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Violation Category",
            message: `Are you sure you want to delete the entire category "${v.category}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await axios.delete(`${API}/violations/delete`, { data: { violationCategoryName: v.category } });
                    setViolations((prev) => prev.filter((p) => p.category !== v.category));
                    showToast("Violation category deleted.", "success");
                } catch (err) {
                    console.error("Error deleting violation category:", err);
                    showToast("Failed to delete category.", "error");
                } finally {
                    setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
                }
            },
        });
    };

    // === Program/strands handler ===

    const handleAddProgram = (type) => {
        setModalType(type);
        setNewItem({ name: "", acronym: "" });
        setIsEditingProgram(false);
        setIsAddModalOpen(true);
    };

    const handleEditProgram = (item, type) => {
        setModalType(type);
        setNewItem({
            name: item.name,
            acronym: item.acronym,
            oldAcronym: item.acronym,
        });
        setIsEditingProgram(true);
        setIsAddModalOpen(true);
    };

    const handleProgramSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditingProgram) {
                if (modalType === "Tertiary") {
                    await axios.put(`${API}/program/update`, {
                        oldAcronym: newItem.oldAcronym,
                        name: newItem.name,
                        acronym: newItem.acronym,
                    });
                    setTertiaryPrograms((prev) =>
                        prev.map((p) =>
                            p.acronym === newItem.oldAcronym
                                ? { name: newItem.name, acronym: newItem.acronym }
                                : p
                        )
                    );
                    showToast("Program updated successfully!", "success");
                } else {
                    await axios.put(`${API}/strand/update`, {
                        oldAcronym: newItem.oldAcronym,
                        name: newItem.name,
                        acronym: newItem.acronym,
                    });
                    setShsStrands((prev) =>
                        prev.map((s) =>
                            s.acronym === newItem.oldAcronym
                                ? { name: newItem.name, acronym: newItem.acronym }
                                : s
                        )
                    );
                    showToast("Strand updated successfully!", "success");
                }
            } else {
                if (modalType === "Tertiary") {
                    await axios.post(`${API}/program/add`, {
                        name: newItem.name,
                        acronym: newItem.acronym,
                    });
                    setTertiaryPrograms((prev) => [
                        ...prev,
                        { name: newItem.name, acronym: newItem.acronym },
                    ]);
                    showToast("Program added successfully!", "success");
                } else {
                    await axios.post(`${API}/strand/add`, {
                        name: newItem.name,
                        acronym: newItem.acronym,
                    });
                    setShsStrands((prev) => [
                        ...prev,
                        { name: newItem.name, acronym: newItem.acronym },
                    ]);
                    showToast("Strand added successfully!", "success");
                }
            }
        } catch (error) {
            console.error("Error saving:", error);
            showToast("Error saving program/strand.", "error");
        } finally {
            setIsAddModalOpen(false);
            setIsEditingProgram(false);
            setNewItem({ name: "", acronym: "" });
        }
    };

    const handleDeleteProgram = (item, type) => {
        setConfirmModal({
            isOpen: true,
            title: `Delete ${type === "Tertiary" ? "Program" : "Strand"}`,
            message: `Are you sure you want to delete "${item.name}" (${item.acronym})? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    if (type === "Tertiary") {
                        await axios.delete(`${API}/program/delete`, {
                            data: { acronym: item.acronym },
                        });
                        setTertiaryPrograms((prev) =>
                            prev.filter((p) => p.acronym !== item.acronym)
                        );
                        showToast("Program deleted.", "success");
                    } else {
                        await axios.delete(`${API}/strand/delete`, {
                            data: { acronym: item.acronym },
                        });
                        setShsStrands((prev) =>
                            prev.filter((s) => s.acronym !== item.acronym)
                        );
                        showToast("Strand deleted.", "success");
                    }
                } catch (error) {
                    console.error("Error deleting:", error);
                    showToast("Failed to delete.", "error");
                } finally {
                    setConfirmModal({
                        isOpen: false,
                        title: "",
                        message: "",
                        onConfirm: null,
                    });
                }
            },
        });
    };

    // === School year handler ===

    const handleSetSchoolYear = async () => {
        try {
            console.log(tempSchoolYearData)
            await axios.put(`${API}/schoolPeriod/update`, tempSchoolYearData)
            setSchoolYearData(tempSchoolYearData);
            showToast("School year and academic period successfully updated!", "success");
        } catch (error) {
            console.error("Error updating school year:", error);
            showToast("Failed to update school year.", "error");
        }
    };

    // === Quick link handler ===

    const handleQuickLinkUpload = async (e) => {
        e.preventDefault();
        if (newQuickLink.title && newQuickLink.file) {
            try {
                const fileUrl = URL.createObjectURL(newQuickLink.file);
                setQuickLinks([
                    ...quickLinks,
                    { title: newQuickLink.title, url: fileUrl, fileName: newQuickLink.file.name },
                ]);
                setNewQuickLink({ title: "", file: null });
                showToast("File successfully uploaded!", "success");
                setIsQuickLinkModalOpen(false);
            } catch (error) {
                console.error("Error uploading file:", error);
                showToast("Failed to upload file.", "error");
            }
        } else {
            showToast("Please provide a title and select a file.", "error");
        }
    };

    // === Wellness link handler ===

    const handleSetWellnessLink = async () => {
        if (tempWellnessLink) {
            try {
                await axios.put(`${API}/wellness/change`, { link: tempWellnessLink });
                showToast("Wellness Program link successfully updated!", "success");
            } catch (error) {
                console.error("Error updating wellness link:", error);
                showToast("Failed to update wellness link.", "error");
            }
        } else {
            showToast("Please provide a valid link.", "error");
        }
    };

    // Top buttons left as you had them...
    const topButtons = [
        { key: PANEL.ANNOUNCEMENT, label: "Announcement", icon: <Bell className="w-5 h-5" /> },
        {
            key: PANEL.PROGRAMS,
            label: "Programs/Strands",
            icon: (
                <span className="flex gap-1">
                    <GraduationCap className="w-5 h-5" />
                    <Building className="w-5 h-5" />
                </span>
            ),
        },
        { key: PANEL.VIOLATIONS, label: "Violations", icon: <ShieldAlert className="w-5 h-5" /> },
        { key: PANEL.SCHOOL_YEAR, label: "School Year", icon: <CalendarDays className="w-5 h-5" /> },
        { key: PANEL.QUICKLINKS, label: "Quick Links & Resources", icon: <FileText className="w-5 h-5" /> },
        { key: PANEL.WELLNESS, label: "Wellness Link", icon: <Link2 className="w-5 h-5" /> },
    ];

    if (isLoading) {
        return <LoadingDots />;
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 p-2 md:p-4 gap-4 font-sans">
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        .resizable-y { resize: vertical; }
      `}</style>

            {/* Top Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 w-full">
                {topButtons.map((btn) => (
                    <button
                        key={btn.key}
                        onClick={() => setActivePanel(btn.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition  ${activePanel === btn.key ? "bg-[#0172bd] text-white shadow" : "bg-white text-black hover:bg-gray-200"
                            }  flex-1 min-w-[150px] justify-center`}
                    >
                        {btn.icon}
                        <span className="whitespace-nowrap">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Panels */}
            <div className="flex-1 w-full overflow-hidden">
                {activePanel === PANEL.ANNOUNCEMENT && (
                    <AnnouncementPanel
                        announcements={announcements}
                        newAnnouncement={newAnnouncement}
                        setNewAnnouncement={setNewAnnouncement}
                        handlePostAnnouncement={handlePostAnnouncement}
                    />
                )}

                {activePanel === PANEL.VIOLATIONS && (
                    <ViolationsPanel
                        violations={violations}
                        onOpenAddModal={openAddViolationModal}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                    />
                )}

                {activePanel === PANEL.PROGRAMS && (
                    <ProgramsPanel
                        tertiaryPrograms={tertiaryPrograms}
                        shsStrands={shsStrands}
                        handleAddProgram={handleAddProgram}
                        onEditProgram={handleEditProgram}
                        onDeleteProgram={handleDeleteProgram}
                    />
                )}
                {activePanel === PANEL.WELLNESS && (
                    <WellnessPanel
                        tempWellnessLink={tempWellnessLink}
                        setTempWellnessLink={setTempWellnessLink}
                        handleSetWellnessLink={handleSetWellnessLink}
                    />
                )}
                {activePanel === PANEL.QUICKLINKS && (
                    <QuickLinksPanel quickLinks={quickLinks} setIsQuickLinkModalOpen={setIsQuickLinkModalOpen} />
                )}
                {activePanel === PANEL.SCHOOL_YEAR && (
                    <SchoolYearPanel
                        tempSchoolYearData={tempSchoolYearData}
                        setTempSchoolYearData={setTempSchoolYearData}
                        schoolYearData={schoolYearData}
                        handleSetSchoolYear={handleSetSchoolYear}
                    />
                )}
            </div>

            {/* Add/Edit Violation modal */}
            <AddViolationModal
                isOpen={isViolationModalOpen}
                setIsOpen={(val) => {
                    setIsViolationModalOpen(val);
                    if (!val) {
                        setIsEditingViolation(false);
                        setNewViolation({ category: "", priority: "1", violations: [], offense: "" });
                    }
                }}
                newViolation={newViolation}
                setNewViolation={setNewViolation}
                onSave={isEditingViolation ? handleUpdateViolation : handleAddViolation}
                isEditing={isEditingViolation}
                offenses={offenses}
            />

            {/* Confirm modal (simple inline modal) */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-5 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-2">{confirmModal.title}</h3>
                        <p className="text-sm text-gray-700 mb-4">{confirmModal.message}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
                                className="px-4 py-2 rounded-lg bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Program Modal */}
            <AddProgramModal
                isOpen={isAddModalOpen}
                setIsOpen={(val) => {
                    setIsAddModalOpen(val);
                    if (!val) {
                        setIsEditingProgram(false);
                        setNewItem({ name: "", acronym: "" });
                    }
                }}
                modalType={modalType}
                newItem={newItem}
                setNewItem={setNewItem}
                handleModalSubmit={handleProgramSubmit}
                isEditing={isEditingProgram}
            ></AddProgramModal>


            {/* Toast */}
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
        </div>
    );
}
