// WellnessForm.jsx
import WellnessTableList from "./components/WellnessTableList";
import WellnessContentManager from "./components/WellnessContentManager";

function WellnessForm({ surveyName, surveyData, themes, refreshData }) {
    if (!surveyData) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <p>No survey data available.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-indigo-700">{surveyName}</h2>
                <WellnessTableList
                    data={surveyData.questions || []}
                    refreshData={refreshData}
                    themes={themes.likert || []}
                    surveyName={surveyName}
                />
            </div>

            <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6">
                <WellnessContentManager
                    data={surveyData.questions || []}
                    theme={themes}
                    refreshData={refreshData}
                    surveyName={surveyName}
                />
            </div>
        </div>
    );
}

export default WellnessForm;
