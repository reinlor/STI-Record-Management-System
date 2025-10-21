import { useEffect, useState } from "react";
import axios from "axios";
import SurveyList from "./wellness-form/SurveyList";
import WellnessForm from "./wellness-form/WellnessForm";
import WellnessSummary from "./wellnessSummary/WellnessSummaryReport";
import LoadingDots from "../../../component/Loading";

import { FileChartLine } from 'lucide-react';

function WellnessAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const [surveys, setSurveys] = useState({});
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState(null);

  const [activeSurvey, setActiveSurvey] = useState(null);
  const [activeMode, setActiveMode] = useState("list");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get("/exam/survey/getAll");
      setSurveys(res.data.surveys || {});

      const themeRes = await axios.get("/exam/theme/get");
      setThemes(themeRes.data || []);
    } catch (err) {
      console.error("fetchData failed:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const backToList = () => {
    setActiveSurvey(null);
    setActiveMode("list");
  };

  if (isLoading) return <LoadingDots />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="h-full font-sans flex flex-col gap-2 p-4 bg-gray-100">
      {activeMode === "list" && (
        <>
          <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-[#0172bd] text-white hover:bg-blue-500 flex items-center justify-center gap-2 rounded-lg cursor-pointer"
            onClick={() => setActiveMode("summary")}
          >
            Summary
            <FileChartLine className="text-white" />
          </button>

          </div>
          <SurveyList
            surveys={surveys}
            refreshData={fetchData}
            onSelectSurvey={(name) => {
              setActiveSurvey(name);
              setActiveMode("form");
            }}
          />
        </>
      )}

      {activeMode === "form" && (
        <WellnessForm
          surveyName={activeSurvey}
          surveyData={surveys[activeSurvey]}
          themes={themes}
          refreshData={fetchData}
          onBack={backToList}
        />
      )}
      {activeMode === "summary" && <WellnessSummary onBack={backToList} />}
    </div>
  );
}

export default WellnessAssessment;
