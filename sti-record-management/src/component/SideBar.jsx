import { useNavigate } from "react-router-dom";
import styles from './components-css/SideBar.module.css';
import { AuthContext } from '../AuthProvider.jsx';
import { useContext } from 'react';


export default function Sidebar() {
    const { authData = {}, logout } = useContext(AuthContext);

    const navigate = useNavigate();
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
            access.requestSlip?.canView ? { label: "Request Slips", path: "/guidance/request-slip" } : null,
            access.referralForm?.canView ? { label: "Referral Forms", path: "/guidance/referral-form" } : null,
            access.backupRestore?.canView ? { label: "Back Up and Restore", path: "/guidance/back-n-restore" } : null,
            access.wellness?.canView ? { label: "Wellness Assessment", path: "/guidance/wellness" } : null,
        ].filter(Boolean);
    }

    // Prefer a top-level role if present, otherwise fallback to user role or empty string
    panelName = authData?.role ?? authData?.user?.role ?? '';

    return (
        <>
            <aside className={styles.sideBar}>
                <div className={styles.sideBarHeader}>{panelName} Panel</div>
                <ul className={styles.menu}>
                    {menuPages.map((page) => (
                        <li
                            key={page.path}
                            className={styles.menuItem}
                            onClick={() => navigate(page.path)}
                        >
                            {page.label}
                        </li>
                    ))}
                </ul>
            </aside>
        </>
    );
}