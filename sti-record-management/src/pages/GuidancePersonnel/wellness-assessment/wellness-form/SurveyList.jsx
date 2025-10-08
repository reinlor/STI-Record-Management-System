// SurveyList.jsx
import WellnessCard from "./components/WellnessCard";
import WellnessCardModal from "./components/WellnessCardModal";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function SurveyList({ surveys = {}, refreshData, onSelectSurvey }) {
    const [displayModal, setDisplayModal] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [wellness, setWellness] = useState({ name: "", description: "" });
    const [loadingAction, setLoadingAction] = useState(false);

    const surveyEntries = Object.entries(surveys);

    const openAddModal = () => {
        setWellness({ name: "", description: "" });
        setIsAdd(true);
        setDisplayModal(true);
    };

    const openViewModal = (name, description) => {
        setWellness({ name, description });
        setIsAdd(false);
        setDisplayModal(true);
    };

    const handleCreateSurvey = async (name, description) => {
        if (!name) {
            toast.error("Survey name is required");
            return;
        }
        setLoadingAction(true);
        try {
            await axios.post("/exam/survey/create", { surveyName: name, description });
            toast.success("Survey created");
            setDisplayModal(false);
            refreshData();
            onSelectSurvey && onSelectSurvey(name); // auto-select newly created survey
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to create survey");
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDeleteSurvey = async (name) => {
        try {
            await axios.delete("/exam/survey/delete", { data: { surveyName: name } });
            toast.success("Survey deleted");
            setDisplayModal(false);
            refreshData();
            if (onSelectSurvey) onSelectSurvey(null);
        } catch {
            toast.error("Failed to delete survey");
        }
    };

    const handleToggleRelease = async (name, currentReleased) => {
        try {
            await axios.put("/exam/survey/release", { surveyName: name, isReleased: !currentReleased });
            toast.success(`Survey ${!currentReleased ? "released" : "disabled"}`);
            refreshData();
        } catch {
            toast.error("Failed to toggle release");
        }
    };

    const handleModifySurvey = async (name, updates) => {
        try {
            await axios.put("/exam/survey/update", { surveyName: name, updates });
            toast.success("Survey updated");
            setDisplayModal(false);
            refreshData();
        } catch {
            toast.error("Failed to update survey");
        }
    };

    return (
        <div className="bg-white h-full px-4 py-6 rounded-lg shadow-md overflow-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-2xl font-bold text-[#0172bd]">Wellness Assessment Surveys</h1>
            </div>
            <div
                className="
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      xl:grid-cols-5
      gap-6
      mt-2
    "
            >
                <WellnessCard plus={true} type="addNew" setDisplay={openAddModal} />

                {surveyEntries.map(([name, meta]) => (
                    <WellnessCard
                        key={name}
                        name={name}
                        description={meta.description || ""}
                        setDisplay={() => {
                            openViewModal(name, meta.description || "");
                            onSelectSurvey && onSelectSurvey(name);
                        }}
                    />
                ))}
            </div>
            <WellnessCardModal
                display={displayModal}
                onClose={() => setDisplayModal(false)}
                isAdd={isAdd}
                name={wellness.name}
                description={wellness.description}
                onCreate={handleCreateSurvey}
                onDelete={handleDeleteSurvey}
                onRelease={handleToggleRelease}
                onModify={handleModifySurvey}
                surveys={surveys}
                loading={loadingAction}
            />
        </div>
    );
}

export default SurveyList;
