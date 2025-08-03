import { useNavigate } from "react-router-dom";
import styles from './components-css/SideBar.module.css';

export default function Sidebar({
    user = ''
}) {
    const navigate = useNavigate();
    let menuPages = [];
    let panelName = '';

    // User = admin
    if (user === 'admin') {
        menuPages = [
            { label: "Dashboard", path: "/admin" },
            { label: "Student Records", path: "/admin/student-records" },
            { label: "Student Cases", path: "/admin/student-cases" },
            { label: "Users", path: "/admin/users" },
            { label: "Back Up and Restore", path: "/admin/back-n-restore" }
        ];
        panelName = 'Admin';
    }
    // User =  Disciplinary Officer
    else if (user === 'disciplinary') {
        menuPages = [
            { label: "Dashboard", path: "/disciplinary" },
            { label: "Student Records", path: "/disciplinary/student-records" },
            { label: "Student Cases", path: "/disciplinary/student-cases" },
            { label: "Request Slip", path: "/disciplinary/request-slip" },
            { label: "Referral Form", path: "/disciplinary/referral-form" },
            { label: "Backup and Restore", path: "/disciplinary/backup-n-restore" }
        ];
        panelName = 'Disciplinary';
    }

    // User = Teacher

    // User = Student

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
