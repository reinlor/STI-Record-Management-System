import React, { useState, useContext } from "react";
import StudentTopBar from "./components/StudentTopbar.jsx";
import ProfileView from "./module-content/ProfileView.jsx";
import StudentRequestSlip from "./module-content/StudentRequestSlip.jsx";
import StudentViewRequest from "./module-content/StudentViewRequest.jsx";
import WellnessCheck from "./module-content/WellnessCheck.jsx";
import ConsentModal from "./ConsentModal.jsx";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../../AuthProvider.jsx";


export default function StudentHomepage() {
  const { authData, logout } = useContext(AuthContext);
  const [selected, setSelected] = useState("profile");

  const renderModule = () => {
    switch (selected) {
      case "profile":
        return <ProfileView />;
      case "wellness":
        return <WellnessCheck />;
      case "request":
        return <StudentRequestSlip />;
      case "history":
        return <StudentViewRequest />;
      default:
        return (
          <div className="animate-fade-in text-center mt-12">
            <p className="text-gray-600 text-xl">Module content will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
      <ToastContainer />
      <ConsentModal 
        isFirstLogin={authData.user.isFirstLogin}
        id={authData.user.uid}/>
      <StudentTopBar selected={selected} setSelected={setSelected} />
      <div className="px-0 w-full">
        {renderModule()}
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}