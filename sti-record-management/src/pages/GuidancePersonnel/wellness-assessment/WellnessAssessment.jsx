import React, { useState, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import WellnessGeneration from "./wellness-generation/WellnessGeneration";
import WellnessForm from "./wellness-form/WellnessForm.jsx";
import WellnessScoring from './wellness-scoring/WellnessScoring.jsx';
import WellnessSummary from "./wellnessSummary/WellnessSummaryReport.jsx";
import { Navigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";

function WelnessAssessment() {
  const [activeView, setActiveView] = useState("form");
  const { authData, logout } = useContext(AuthContext);


  const renderView = () => {
    switch (activeView) {
      case "form":
        return <WellnessForm />;
      case "grade":
        return (
          <WellnessScoring />
        );
      case "summary":
        return (
          <WellnessSummary />
        );
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            Select a view
          </div>
        );
    }
  };

  // if (!authData?.user?.access?.wellness) {
  //   return <Navigate to="/error401" replace />
  // }

  return (
    <div className="p-6 max-w-420 mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="h-10 w-10 text-[#0172bd]" />
            <h1 className="text-4xl font-bold text-[#0172bd] mb-1">Wellness Assessment</h1>
      </div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView("form")}
          className={`px-4 py-2 rounded-md ${activeView === "form"
            ? "bg-[#0172bd] text-white hover:bg-blue-500"
            : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
          Form
        </button>
        <button
          onClick={() => setActiveView("grade")}
          className={`px-4 py-2 rounded-md ${activeView === "grade"
            ? "bg-[#fef201] text-black hover:bg-yellow-400"
            : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
          Conditions
        </button>
        <button
          onClick={() => setActiveView("summary")}
          className={`px-4 py-2 rounded-md ${activeView === "summary"
            ? "bg-[#28a745] text-white hover:bg-green-500"
            : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
          Summary
        </button>
      </div>

      {/* Render the active view */}
      <div className="bg-white shadow-md rounded-lg p-6">{renderView()}</div>
    </div>
  );
}

export default WelnessAssessment;
