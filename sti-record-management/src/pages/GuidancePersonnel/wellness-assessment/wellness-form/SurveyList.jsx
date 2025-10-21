import WellnessCard from "./components/WellnessCard";
import WellnessCardModal from "./components/WellnessCardModal";
import { useState, useContext } from "react";
import { AuthContext } from '../../../../AuthProvider.jsx';
import axios from "axios";
import { toast } from "react-toastify";

function SurveyList({ surveys = {}, refreshData, onSelectSurvey }) {
    const { authData } = useContext(AuthContext);
    const [displayModal, setDisplayModal] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [wellness, setWellness] = useState({ name: "", description: "" });
    const [loadingAction, setLoadingAction] = useState(false);

    const surveyEntries = Object.entries(surveys || {}).sort(([, a], [, b]) => {
        const parseToMillis = (dateInput) => {
            if (!dateInput) return 0;
            if (typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
                try { return dateInput.toDate().getTime(); } catch { return 0; }
            }
            if (typeof dateInput === 'object' && (dateInput.seconds !== undefined || dateInput._seconds !== undefined)) {
                const seconds = dateInput.seconds ?? dateInput._seconds;
                const nanos = dateInput.nanoseconds ?? dateInput._nanoseconds ?? 0;
                return (Number(seconds) * 1000) + Math.floor(Number(nanos) / 1e6);
            }
            if (typeof dateInput === 'number') {
                return dateInput > 1e12 ? dateInput : dateInput * 1000;
            }
            if (typeof dateInput === 'string') {
                const parsed = Date.parse(dateInput);
                if (!isNaN(parsed)) return parsed;
                const simplified = dateInput.replace(/\s+at\s+/i, ' ').replace(/UTC.*$/i, '').trim();
                const parsed2 = Date.parse(simplified);
                if (!isNaN(parsed2)) return parsed2;
            }
            return 0;
        };

        return parseToMillis(b.timeCreated) - parseToMillis(a.timeCreated);
    });

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
            await axios.post("/exam/survey/create", { surveyName: name, description, processedBy: authData?.user?.displayName });
            toast.success("Survey created");
            setDisplayModal(false);
            refreshData();
            onSelectSurvey && onSelectSurvey(name);
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
            <div className="flex items-center gap-4 mb-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0172bd]">Wellness Assessment Surveys</h1>
                    <p className="text-sm text-gray-600">Manage surveys and question databank</p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-sm inline-block" style={{ background: '#10b981' }} />
                        <span className="text-sm text-gray-700">Released</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-sm inline-block" style={{ background: '#9ca3af' }} />
                        <span className="text-sm text-gray-700">Not Released</span>
                    </div>
                </div>
            </div>

            <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      md:grid-cols-3 
      xl:grid-cols-5 
      gap-6 
      mt-2 
    ">
                <WellnessCard plus={true} type="addNew" setDisplay={openAddModal} />

                {surveyEntries.map(([name, meta]) => (
                    <WellnessCard
                        key={name}
                        name={name}
                        description={meta.description || ""}
                        processedBy={meta.processedBy}
                        timeCreated={meta.timeCreated}
                        schoolYear={meta.schoolYear}
                        isReleased={!!meta.isReleased}
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
