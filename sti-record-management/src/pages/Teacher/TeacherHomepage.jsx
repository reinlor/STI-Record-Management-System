import React, { useState, useEffect, useContext } from "react";
import TeacherTopbar from "./modules/TeacherTopbar";
import ChangePasswordModal from "../../component/ChangePasswordModal.jsx";
import TeacherDashboard from "./content/TeacherDashboard.jsx";
import SubmitReferralForm from "./content/SubmitReferral";
import ViewRequest from "./content/ViewRequest";
import NotificationsPage from "../../component/NotificationPage.jsx";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TeacherHomepage() {
  const { authData, logout } = useContext(AuthContext);
  const [selected, setSelected] = useState("submit");
  const [referralData, setReferralData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const fetchReferral = async (teacherID) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/referral/get/employee/${teacherID}`);
      setReferralData(res.data);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      setReferralData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authData) return;
    const teacherID = authData.user?.uid;
    fetchReferral(teacherID);
  }, [authData]);

  const handlePasswordChange = (currentPassword, newPassword) => {
    toast.success("Password change successfully!");
    // NOTE: Replace with backend password change logic
  };

  const renderModule = () => {
    switch (selected) {
      case "dashboard":
        return <TeacherDashboard />;
      case "submit":
        return authData && (
          <SubmitReferralForm
            teacher={authData}
            onSuccess={() => fetchReferral(authData.user?.uid)}
          />
        );
      case "view":
        return (
          <ViewRequest
            referralData={referralData}
            isLoading={isLoading}
          />
        );
      case "notifications":
        return authData && (
          <NotificationsPage uid={authData.user.uid} />
        );
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
      <ToastContainer />
      <div className="sticky top-0 z-50">
        <TeacherTopbar
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
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}