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
        <div className="flex flex-col gap-4 sm:gap-6 bg-gray-100 min-h-screen py-3 px-2 sm:px-4 overflow-hidden">
            {/* Back button */}
            <button
                onClick={onBack}
                className="self-start px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 bg-[#0172bd] cursor-pointer text-white font-semibold transition-colors"
            >
                ← Back to Surveys
            </button>

            {/* Content Container */}
            <div
                className="
          flex flex-col
          md:flex-row
          gap-4 sm:gap-6
          w-full
          h-full
          overflow-hidden
        "
            >
                {/* Main Table List */}
                <div
                    className="
            flex-1
            bg-white
            rounded-2xl
            p-3 sm:p-6
            border border-gray-200
            shadow-lg
            overflow-y-auto
            custom-scrollbar
            max-h-[70vh] md:max-h-[80vh]
            min-h-[50vh]
          "
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#0172bd] break-words">
                        {surveyName} <span></span>
                    </h2>
                    <WellnessTableList
                        data={surveyData.questions || []}
                        refreshData={refreshData}
                        themes={themes.likert || []}
                        surveyName={surveyName}
                    />
                </div>

                {/* Content Manager */}
                <div
                    className="
            w-full
            md:w-[35%]
            bg-white
            rounded-2xl
            shadow-md
            p-3 sm:p-6
            border border-gray-200
            overflow-y-auto
            custom-scrollbar
            max-h-[70vh] md:max-h-[80vh]
            min-h-[50vh]
          "
                >
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
