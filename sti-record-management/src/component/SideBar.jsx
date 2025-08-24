import { useNavigate } from "react-router-dom";
import styles from './components-css/SideBar.module.css';
import { AuthContext } from '../AuthProvider.jsx';
import { useContext } from 'react';


export default function Sidebar() {
    const { authData, logout } = useContext(AuthContext);

    const navigate = useNavigate();
    let menuPages = [];
    let panelName = '';

    if (!authData.user.access) {
        menuPages = [
            { label: "Dashboard", path: "/guidance" }
        ]
    } else {
        menuPages = [
            authData.user.access.dashboard.canView ? { label: "Dashboard", path: "/guidance" } : null,
            authData.user.access.studentRecords.canView ? { label: "Student Records", path: "/guidance/student-records" } : null,
            authData.user.access.studentCases.canView ? { label: "Student Cases", path: "/guidance/student-cases" } : null,
            authData.user.access.userManagement.canView ? { label: "Users", path: "/guidance/users" } : null,
            authData.user.access.requestSlip.canView ? { label: "Request Slips", path: "/guidance/request-slip" } : null,
            authData.user.access.referralForm.canView ? { label: "Referral Forms", path: "/guidance/referral-form" } : null,
            authData.user.access.backupRestore.canView ? { label: "Back Up and Restore", path: "/guidance/back-n-restore" } : null,
            authData.user.access.wellness.canView ? { label: "Wellness Assessment", path: "/guidance/wellness" } : null,
        ].filter(Boolean);
    }
    panelName = authData.role;

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
