import { useNavigate } from "react-router-dom";
import styles from './components-css/SideBar.module.css';
import { AuthContext } from '../AuthProvider.jsx';
import { useContext, useState } from 'react';
import React from 'react';

export default function Sidebar() {
    const { authData = {}, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 768); 
    let menuPages = [];
    let panelName = '';
    const access = authData?.user?.access ?? null;

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
                className={styles.toggleBtn}
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
            <aside className={`${styles.sideBar} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles.sideBarHeader}>{panelName} Panel</div>
                <ul className={styles.menu}>
                    {menuPages.map((page) => (
                        <li
                            key={page.path}
                            className={styles.menuItem}
                            onClick={() => {
                                navigate(page.path);
                                if (window.innerWidth < 768) setIsOpen(false); // auto-close on mobile
                            }}
                        >
                            {page.label}
                        </li>
                    ))}
                </ul>
            </aside>
        </>
    );
}