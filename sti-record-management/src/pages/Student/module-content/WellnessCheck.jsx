import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingDots from "../../../component/Loading";

export default function WellnessCheck({ setSelected }) {
  const [wellnessLink, setWellnessLink] = useState("");
  const [releasedSurveys, setReleasedSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  useEffect(() => {
    // Fetch Mind Check survey link (Card 1)
    const fetchSurveyLink = async () => {
      try {
        const response = await axios.get("http://localhost:5000/content/wellness/get");
        setWellnessLink(response.data.link);
      } catch (error) {
        console.error("Error fetching survey link:", error);
      }
    };

    // Fetch released surveys for student
    const fetchReleasedSurveys = async () => {
      setLoadingSurveys(true)
      try {
        const res = await axios.get("/exam/survey/getAll");
        const surveys = res.data.surveys || {};
        // Filter only released surveys
        const released = Object.entries(surveys)
          .filter(([_, meta]) => meta.isReleased)
          .map(([name, meta]) => ({
            name,
            description: meta.description || "",
          }));
        setReleasedSurveys(released);
      } catch (err) {
        console.error("Error fetching released surveys:", err);
      } finally {
        setLoadingSurveys(false);
      }
    };

    fetchSurveyLink();
    fetchReleasedSurveys();
  }, []);

  return (
    <div className="animate-fade-in min-h-screen flex flex-col items-center pt-6 font-sans bg-gray-100">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-5xl">
        {/* Section Header */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4">
          Wellness Check
        </h2>

        {/* Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8`}>
          {/* Card 1: Mind Check (Always visible) */}
          <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Mind Check</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              This is a placeholder description for the Wellness Check.
              Explain why a user should take this test or what it is about.
            </p>
            <button
              disabled={!wellnessLink}
              onClick={() => window.open(wellnessLink, "_blank")}
              className={`${wellnessLink
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
                } text-white font-medium px-5 py-2 rounded-lg self-start mt-auto transition-colors duration-200`}
            >
              {wellnessLink ? "Go to Survey" : "Loading..."}
            </button>
          </div>

          {/* Dynamically render released surveys from admin */}
          {loadingSurveys ? (
            <LoadingDots />
          ) : (
            releasedSurveys.map((survey, idx) => (
              <div
                key={survey.name}
                className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 flex flex-col"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{survey.name}</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {survey.description || "No description provided."}
                </p>
                <button
                  onClick={() => setSelected(survey.name)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg self-start mt-auto transition-colors duration-200 cursor-pointer"
                >
                  Answer Survey
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fade Animation */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
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