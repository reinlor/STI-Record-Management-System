import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { LoadingBarProvider, useLoadingBar } from "../component/LoadingBarProvider.jsx";
import SideBar from "../component/SideBar.jsx";
import Header from "../component/Header.jsx";
import styles from "./layout-css/AdminLayout.module.css";

function AdminLayoutContent() {
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();
  
  // Patangal kung may maisip na magandang logic  -renlor
  const [visibility, setVisibility] = useState(false)

  const handleLogout = () => {
    navigate("/"); //Papunta sa Login Page
  }

  useEffect(() => {
    const loadData = async () => {
      start(); // Start Loading
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      }); // Dummy Timer ng loading
      complete(); // Finish Loading
      setVisibility(true); 
    };

    loadData();
  }, [start, complete]);

  return (
    <div className={styles.adminLayout}>
      <SideBar />

      <div className={`${styles.headerArea} ${visibility ? 'visible' : 'hidden'}`}>
        <Header 
            userName="Admin" 
            className={styles.mainHeader}
            onLogout={handleLogout} 
        />

        <div className={styles.adminContent}>
          <Outlet />
        </div>
        
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <LoadingBarProvider>
      <AdminLayoutContent />
    </LoadingBarProvider>
  );
}
