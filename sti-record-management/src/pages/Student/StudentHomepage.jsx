import React, { useState, useContext, useEffect } from "react";
import StudentTopBar from "./components/StudentTopbar.jsx";
import ChangePasswordModal from "../../component/ChangePasswordModal.jsx";
import StudentDashboard from "./module-content/StudentDashboard.jsx";
import ProfileView from "./module-content/ProfileView.jsx";
import StudentRequestSlip from "./module-content/StudentRequestSlip.jsx";
import StudentViewRequest from "./module-content/StudentViewRequest.jsx";
import WellnessCheck from "./module-content/WellnessCheck.jsx";
import SurveyForm from "./module-content/SurveyForm.jsx";
import NotificationsPage from "../../component/NotificationPage.jsx";
import ConsentModal from "./ConsentModal.jsx";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "../../AuthProvider.jsx";

export default function StudentHomepage() {
  const [selected, setSelected] = useState(() => {
    const savedPage = sessionStorage.getItem("selectedPage");
    
    return savedPage || "dashboard";
});
  const [selectedSurveyName, setSelectedSurveyName] = useState(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { authData, logout } = useContext(AuthContext);

  useEffect(() => {
    sessionStorage.setItem("selectedPage", selected);
  }, [selected]);

  const handlePasswordChange = (currentPassword, newPassword) => {
    console.log("Current Password entered:", currentPassword);
    console.log("Password changed successfully to:", newPassword);
    toast.success("Password changed successfully!");
    // NOTE: Palitan kung pano ihandle yung password change sa backend
    // //This is just a placeholder function
  };

  const renderModule = () => {
    switch (selected) {
      case "dashboard":
        return <StudentDashboard />;
      case "profile":
        return <ProfileView />;
      case "wellness":
        // Pass a callback to WellnessCheck to handle survey selection
        return (
          <WellnessCheck
            setSelected={(surveyName) => {
              setSelectedSurveyName(surveyName);
              setSelected("survey");
            }}
          />
        );
      case "request":
        return <StudentRequestSlip />;
      case "history":
        return <StudentViewRequest />;
      case "survey":
        // Pass the selected survey name to SurveyForm
        return <SurveyForm surveyName={selectedSurveyName} />;
      case "notifications":
        return <NotificationsPage uid={authData.user.uid} />;
      default:
        return (
          <div className="animate-fade-in text-center mt-12">
            <p className="text-gray-600 text-xl">Module content will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
      <ConsentModal
        isFirstLogin={authData.user.isFirstLogin}
        id={authData.user.uid}
      />
      <div className="sticky top-0 z-50">
        <StudentTopBar
          selected={selected}
          setSelected={setSelected}
          onLogout={logout}
          onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        />
      </div>
      <div className="px-0 w-full">
        {renderModule()}
      </div>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onConfirmChange={handlePasswordChange}
      />
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