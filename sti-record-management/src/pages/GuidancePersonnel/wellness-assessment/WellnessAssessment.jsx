import React, { useState, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import WellnessGeneration from "./wellness-generation/WellnessGeneration";
import WellnessScoring from './wellness-scoring/WellnessScoring.jsx';
import { Navigate } from "react-router-dom";

function WelnessAssessment() {
  const [activeView, setActiveView] = useState("form");
  const { authData, logout } = useContext(AuthContext);


  const renderView = () => {
    switch (activeView) {
      case "form":
        return <WellnessGeneration />;
      case "grade":
        return (
          <WellnessScoring />
        );
      case "submissions":
        return (
          <div className="p-4 bg-yellow-100 rounded-md">
            Wellness Table
          </div>
        );
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            Select a view
          </div>
        );
    }
  };

  if(!authData?.user?.access?.wellness?.canView){
    return <Navigate to="/error401" replace/> 
  }

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
          onClick={() => setActiveView("submissions")}
          className={`px-4 py-2 rounded-md ${activeView === "submissions"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200"
            }`}
        >
          Submissions
        </button>
      </div>

      {/* Render the active view */}
      <div className="bg-white shadow-md rounded-lg p-6">{renderView()}</div>
    </div>
  );
}

export default WelnessAssessment;
