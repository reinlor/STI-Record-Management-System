import { useNavigate } from "react-router-dom";
import styles from'./components-css/SideBar.module.css';

export default function Sidebar() {
    const navigate = useNavigate();
    
    const menuPages = [
      {label: "Dashboard", path: "/admin"},
      {label: "Student Records", path: "/admin/student-records"},
      {label: "Student Cases", path: "/admin/student-cases"},
      {label: "Users", path: "/admin/users"},
      {label: "Back Up and Restore", path: "/admin/back-n-restore"}
    ];
    return (
    <>
        <aside className={styles.sideBar}>
            <div className={styles.sideBarHeader}>Admin Panel</div>
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
