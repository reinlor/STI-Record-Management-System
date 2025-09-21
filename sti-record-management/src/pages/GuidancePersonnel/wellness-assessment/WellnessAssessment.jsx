// WellnessAssessment.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import SurveyList from "./wellness-form/SurveyList";
import WellnessForm from "./wellness-form/WellnessForm";

function WellnessAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const [surveys, setSurveys] = useState({});
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState(null);
  const [activeSurvey, setActiveSurvey] = useState(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col gap-6 p-4">
      {/* Always show SurveyList */}
      <SurveyList surveys={surveys} refreshData={fetchData} onSelectSurvey={setActiveSurvey} />

      {/* If user selects or creates a survey, show WellnessForm */}
      {activeSurvey && surveys[activeSurvey] && (
        <WellnessForm
          surveyName={activeSurvey}
          surveyData={surveys[activeSurvey]}
          themes={themes}
          refreshData={fetchData}
        />
      )}
    </div>
  );
}

export default WellnessAssessment;
