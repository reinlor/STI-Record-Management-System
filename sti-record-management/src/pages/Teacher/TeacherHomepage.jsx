import React, { useState, useEffect, useContext } from "react";
import TeacherTopbar from "./modules/TeacherTopbar";
import ChangePasswordModal from "../../component/ChangePasswordModal.jsx";
import TeacherDashboard from "./content/TeacherDashboard.jsx";
import SubmitReferralForm from "./content/SubmitReferral";
import ViewRequest from "./content/ViewRequest";
import NotificationsPage from "../../component/NotificationPage.jsx";
import { AuthContext } from "../../AuthProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Firebase imports for real-time data
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebaseClient.js";

export default function TeacherHomepage() {
  const { authData, logout } = useContext(AuthContext);
  const [selected, setSelected] = useState("dashboard");
  const [referralData, setReferralData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const setupRealtimeReferralListener = (teacherID) => {
    if (!teacherID) return () => { }; 

    setIsLoading(true);

    const referralQuery = query(
      collection(db, "referralForm"),
      where("employeeID", "==", teacherID)
    );

    // real-time listener
    const unsubscribe = onSnapshot(referralQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReferralData(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time referral data:", error);
      toast.error("Failed to load referral data in real-time.");
      setReferralData([]);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (!authData) {
      setIsLoading(false);
      return;
    }
    const teacherID = authData.user?.uid;
    console.log(teacherID)

    // Set up the listener and store the unsubscribe function
    const unsubscribe = setupRealtimeReferralListener(teacherID);

    // Clean up the listener when the component unmounts or authData changes
    return () => unsubscribe();
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
        // The onSuccess now simply closes the form or provides a success message, 
        // as data fetching is handled by the real-time listener in useEffect
        return authData && (
          <SubmitReferralForm
            teacher={authData}
            onSuccess={() => toast.success("Referral submitted successfully!")}
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