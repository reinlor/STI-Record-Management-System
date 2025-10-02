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
    const [tempWellnessLink, setTempWellnessLink] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // "SHS" or "Tertiary"
    const [newItem, setNewItem] = useState({ name: "", acronym: "" });
    const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

    // New states for other panels
    const [violations, setViolations] = useState([]);
    const [newViolation, setNewViolation] = useState({ category: "", priority: "1" });
    const [quickLinks, setQuickLinks] = useState([]);
    const [newQuickLink, setNewQuickLink] = useState({ title: "", file: null });
    const [schoolYearData, setSchoolYearData] = useState();
    const [tempSchoolYearData, setTempSchoolYearData] = useState({ ...schoolYearData });
    const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Mock API endpoint
    const API = "/content";

    // Toast
    const showToast = (message, type) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
    };

    // Fetch mock data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const response = await axios.get(`${API}/getAll`)

                console.log(response.data)

                setAnnouncements(response.data[0].announcement.messages);
                setShsStrands(response.data[3].programStrand.strand);
                setTertiaryPrograms(response.data[3].programStrand.program);
                setSchoolYearData(response.data[4].schoolPeriod)
                setViolations([]);
                setQuickLinks([]);
                setTempWellnessLink(response.data[7].wellness.link);
            } catch (error) {
                console.error("Error fetching content management data:", error);
            }
            finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, []);

    // === Handlers (kept same as original) ===
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

    const handleAddProgram = (type) => {
        setModalType(type);
        setIsAddModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (newItem.name && newItem.acronym) {
            try {
                if (modalType === "Tertiary") {
                    await axios.post(`${API}/program/add`, newItem);
                    setTertiaryPrograms([...tertiaryPrograms, newItem]);
                    showToast("New Program successfully added!", "success");
                } else if (modalType === "SHS") {
                    await axios.post(`${API}/strand/add`, newItem);
                    setShsStrands([...shsStrands, newItem]);
                    showToast("New Strand successfully added!", "success");
                }
                setIsAddModalOpen(false);
                setNewItem({ name: "", acronym: "" });
            } catch (error) {
                console.error("Error adding item:", error);
                showToast("Failed to add item.", "error");
            }
        } else {
            showToast("Please fill out both fields.", "error");
        }
    };

    const handleViolationModalSubmit = async (e) => {
        e.preventDefault();
        if (newViolation.category && newViolation.priority) {
            try {
                setViolations([...violations, { ...newViolation, id: Date.now() }]);
                setNewViolation({ category: "", priority: "1" });
                showToast("New violation successfully added!", "success");
                setIsViolationModalOpen(false);
            } catch (error) {
                console.error("Error adding violation:", error);
                showToast("Failed to add violation.", "error");
            }
        } else {
            showToast("Please fill out all fields.", "error");
        }
    };

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

    // Top buttons
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
        return <LoadingDots />
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition 
              ${activePanel === btn.key ? "bg-[#0172bd] text-white shadow" : "bg-white text-black hover:bg-gray-200"} 
              flex-1 min-w-[150px] justify-center`}
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
                {activePanel === PANEL.PROGRAMS && (
                    <ProgramsPanel
                        tertiaryPrograms={tertiaryPrograms}
                        shsStrands={shsStrands}
                        handleAddProgram={handleAddProgram}
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
                {activePanel === PANEL.VIOLATIONS && (
                    <ViolationsPanel violations={violations} setIsViolationModalOpen={setIsViolationModalOpen} />
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

            {/* Modals */}
            <AddProgramModal
                isOpen={isAddModalOpen}
                modalType={modalType}
                setIsOpen={setIsAddModalOpen}
                newItem={newItem}
                setNewItem={setNewItem}
                handleModalSubmit={handleModalSubmit}
            />
            <AddQuickLinkModal
                isOpen={isQuickLinkModalOpen}
                setIsOpen={setIsQuickLinkModalOpen}
                newQuickLink={newQuickLink}
                setNewQuickLink={setNewQuickLink}
                handleQuickLinkUpload={handleQuickLinkUpload}
            />
            <AddViolationModal
                isOpen={isViolationModalOpen}
                setIsOpen={setIsViolationModalOpen}
                newViolation={newViolation}
                setNewViolation={setNewViolation}
                handleViolationModalSubmit={handleViolationModalSubmit}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
}
