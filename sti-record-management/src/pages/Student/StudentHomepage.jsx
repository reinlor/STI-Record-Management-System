import React, { useState } from "react";
import StudentTopBar from "./components/StudentTopbar.jsx";
import ProfileView from "./module-content/ProfileView.jsx";
import StudentRequestSlip from "./module-content/StudentRequestSlip.jsx";
import StudentViewRequest from "./module-content/StudentViewRequest.jsx";
import WellnessCheck from "./module-content/WellnessCheck.jsx";

export default function StudentHomepage() {
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
            <p className="text-gray-600">Module content will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
      <StudentTopBar selected={selected} setSelected={setSelected} />
      <div className="flex pt-8 justify-center">
        <div className="w-full max-w-5xl transition-all duration-500 ease-in-out">
          {renderModule()}
        </div>
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