import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthProvider.jsx';
import { useContext, useState } from 'react';
import React from 'react';

// Lucide icons
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  RefreshCcw,
  HeartPulse,
  FileEdit,
  FolderKanban,
  User,
  CircleAlert
} from "lucide-react";

export default function Sidebar() {
    const { authData = {}, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 768); 
    let menuPages = [];
    let panelName = '';
    const access = authData?.user?.access ?? null;

    // Icon mapping
    const iconMap = {
        "Dashboard": <LayoutDashboard className="w-5 h-5 mr-3" />,
        "Student Records": <Users className="w-5 h-5 mr-3" />,
        "Student Cases": <FileText className="w-5 h-5 mr-3" />,
        "Users": <User className="w-5 h-5 mr-3" />,
        "Request Slips": <ClipboardList className="w-5 h-5 mr-3" />,
        "Referral Forms": <FileEdit className="w-5 h-5 mr-3" />,
        "Back Up and Restore": <RefreshCcw className="w-5 h-5 mr-3" />,
        "Wellness Assessment": <HeartPulse className="w-5 h-5 mr-3" />,
        "Content Managemet": <FolderKanban className="w-5 h-5 mr-3" />,
        "Offenses List": <CircleAlert className="w-5 h-5 mr-3" />,
    };

    if (!access) {
        menuPages = [
            { label: "Dashboard", path: "/guidance" }
        ];
    } else {
        menuPages = [
            { label: "Dashboard", path: "/guidance" },
            access.studentRecords?.canView ? { label: "Student Records", path: "/guidance/student-records" } : null,
            access.studentCases?.canView ? { label: "Student Cases", path: "/guidance/student-cases" } : null,
            access.userManagement?.canView ? { label: "Users", path: "/guidance/users" } : null,
            access.requestSlip ? { label: "Request Slips", path: "/guidance/request-slip" } : null,
            access.referralForm ? { label: "Referral Forms", path: "/guidance/referral-form" } : null,
            access.backupRestore ? { label: "Back Up and Restore", path: "/guidance/back-n-restore" } : null,
            access.wellness ? { label: "Wellness Assessment", path: "/guidance/wellness" } : null,
            {label: "Content Managemet", path: "/guidance/content-management" },
            {label: "Offenses List", path: "/guidance/offenses" },
        ].filter(Boolean);
    }

    panelName = authData?.role ?? authData?.user?.role ?? '';

    // Responsive: close sidebar on small screens
    const handleResize = () => {
        if (window.innerWidth < 768) setIsOpen(false);
        else setIsOpen(true);
    };

    // Listen for window resize
    React.useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Toggle button for mobile/tablet */}
            <button
                className={`fixed bottom-4 left-4 z-[100] rounded-md px-3 py-2 text-lg cursor-pointer shadow-md transition
                    ${isOpen ? 'bg-white' : 'bg-white/30'}
                    md:hidden`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? (
                    // Close (X) icon
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <line x1="6" y1="6" x2="18" y2="18" stroke="#1a1a2e" strokeWidth="2"/>
                        <line x1="18" y1="6" x2="6" y2="18" stroke="#1a1a2e" strokeWidth="2"/>
                    </svg>
                ) : (
                    // Burger icon
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect x="4" y="7" width="16" height="2" rx="1" fill="#1a1a2e"/>
                        <rect x="4" y="11" width="16" height="2" rx="1" fill="#1a1a2e"/>
                        <rect x="4" y="15" width="16" height="2" rx="1" fill="#1a1a2e"/>
                    </svg>
                )}
            </button>
            <div className="p-2 bg-[#1a1a2e]">
            <aside className={`
                fixed left-0 top-0 h-screen w-[220px] bg-[#1a1a2e] z-50 transition-transform duration-300 shadow-md text-white flex flex-col ease-in-out 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:static md:h-auto md:shadow-none md:translate-x-0
            `}>
                <div className="font-bold text-[1.1rem] py-[16px] px-5 border-b border-[#757575] bg-[#1a1a2e]">
                    {panelName} Panel
                </div>
                <ul className="list-none p-0 m-0 flex-1">
                    {menuPages.map((page) => (
                        <li
                            key={page.path}
                            className="px-5 py-[14px] cursor-pointer text-white transition bg-none border-none text-[1rem] hover:bg-yellow-400 flex items-center rounded-lg "
                            onClick={() => {
                                navigate(page.path);
                                if (window.innerWidth < 768) setIsOpen(false); // auto-close on mobile
                            }}
                        >
                            {iconMap[page.label]}
                            <span>{page.label}</span>
                        </li>
                    ))}
                </ul>
            </aside>
            </div>
        </>
    );
}