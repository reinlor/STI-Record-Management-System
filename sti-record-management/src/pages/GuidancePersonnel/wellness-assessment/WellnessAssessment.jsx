import React, { useState, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import WellnessGeneration from "./wellness-generation/WellnessGeneration";
import WellnessForm from "./wellness-form/WellnessForm.jsx";
import WellnessScoring from './wellness-scoring/WellnessScoring.jsx';
import WellnessSummary from "./wellnessSummary/WellnessSummaryReport.jsx";
import { Navigate } from "react-router-dom";

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
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Wellness Assessment</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView("form")}
          className={`px-4 py-2 rounded-md ${activeView === "form"
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
            }`}
        >
          Form
        </button>
        <button
          onClick={() => setActiveView("grade")}
          className={`px-4 py-2 rounded-md ${activeView === "grade"
            ? "bg-green-500 text-white"
            : "bg-gray-200"
            }`}
        >
          Conditions
        </button>
        <button
          onClick={() => setActiveView("summary")}
          className={`px-4 py-2 rounded-md ${activeView === "summary"
            ? "bg-yellow-500 text-white"
            : "bg-gray-200"
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
