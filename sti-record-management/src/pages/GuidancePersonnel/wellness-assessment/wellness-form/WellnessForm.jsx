import WellnessTableList from "./components/WellnessTableList";
import WellnessContentManager from "./components/WellnessContentManager";

function WellnessForm({ surveyName, surveyData, themes, refreshData, onBack }) {
    if (!surveyData) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <button
                    onClick={onBack}
                    className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ← Back to Surveys
                </button>
                <p>No survey data available.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 bg-gray-100 h-screen py-2 overflow-hidden">
            {/* Back button */}
            <button
                onClick={onBack}
                className="self-start px-4 py-2  rounded-lg shadow-md hover:bg-blue-500 bg-[#0172bd] text-white font-semibold"
            >
                ← Back to Surveys
            </button>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Table List */}
                <div className="w-full md:w-2/3 bg-white rounded-2xl p-4 sm:p-6 overflow-y-auto custom-scrollbar border border-gray-200 shadow-lg max-h-[70vh] md:max-h-[80vh]">
                    <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#0172bd]">{surveyName}</h2>
                    <WellnessTableList
                        data={surveyData.questions || []}
                        refreshData={refreshData}
                        themes={themes.likert || []}
                        surveyName={surveyName}
                    />
                </div>

                {/* Content Manager */}
                <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-4 sm:p-6 mt-4 md:mt-0 overflow-auto custom-scrollbar max-h-[70vh] md:max-h-[80vh] border border-gray-200">
                    <WellnessContentManager
                        data={surveyData.questions || []}
                        theme={themes}
                        refreshData={refreshData}
                        surveyName={surveyName}
                    />
                </div>
            </div>
        </div>
    );
}

export default WellnessForm;
