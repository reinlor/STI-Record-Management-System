import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./ConfirmModalModule"; // adjust path if needed
import LoadingDots from "../../../../../component/Loading";

function WellnessContentManager({ data, theme, refreshData, surveyName }) {
    const [displayCategoryInput, setDisplayCategoryInput] = useState(false);
    const [question, setQuestion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [otherCategory, setOtherCategory] = useState("");
    const [selectedTheme, setSelectedTheme] = useState(null);

    const [newThemeName, setNewThemeName] = useState("");
    const [newThemeScale, setNewThemeScale] = useState(["", "", "", "", ""]);
    const [editingTheme, setEditingTheme] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    const [isReleased, setIsReleased] = useState(false);

    const [isLoading, setIsLoading] = useState(true)

    const uniqueCategories = [...new Set(data.map((item) => item.category))];

    useEffect(() => {
        const fetchStatus = async () => {
            setIsLoading(true)
            try {
                if (surveyName) {
                    const res = await axios.get(`/exam/survey/get/${encodeURIComponent(surveyName)}`);
                    if (res.data && typeof res.data.isReleased === "boolean") {
                        setIsReleased(res.data.isReleased);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch release status", err);
            }
            finally {
                setIsLoading(false)
            }
        };
        fetchStatus();
    }, [surveyName]);

    const confirmToggleRelease = (newStatus) => {
        setModalAction(() => async () => {
            try {
                await axios.put("/exam/survey/release", { surveyName, isReleased: newStatus });
                setIsReleased(newStatus);
                toast.success(`Survey ${newStatus ? "released" : "disabled"} successfully!`);
                refreshData();
            } catch {
                toast.error("Failed to update release status");
            }
        });
        setModalOpen(true);
    };

    const displayExistingTheme = () => {
        if (!theme || !theme.likert || !Array.isArray(theme.likert)) {
            return <p>No themes available or incorrect data format.</p>;
        }

        return theme.likert.map((th, themeIndex) => (
            <div
                key={th._id || th.themeName || themeIndex}
                className="p-4 bg-gray-100 rounded-lg mb-4"
            >
                <h2 className="text-lg font-semibold">{th.themeName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                    {th.scale.map((sc, scaleIndex) => (
                        <span
                            key={sc || scaleIndex}
                            className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                        >
                            {sc}
                        </span>
                    ))}
                </div>

                <div className="flex gap-3 mt-3">
                    <button
                        onClick={() => handleEditTheme(th)}
                        className="text-blue-600 hover:underline"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => confirmDeleteTheme(th.themeName)}
                        className="text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ));
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        setDisplayCategoryInput(category === "Others");
    };

    const handleThemeChange = (e) => {
        const themeName = e.target.value;
        const selectedThemeObject = theme.likert.find(
            (th) => th.themeName === themeName
        );
        setSelectedTheme(selectedThemeObject);
    };

    const handleAddQuestion = async () => {
        const finalCategory =
            selectedCategory === "Others" ? otherCategory : selectedCategory;

        if (!question || !finalCategory || !selectedTheme) {
            toast.error("Please fill in all fields.");
            return;
        }

        const newQuestion = {
            category: finalCategory,
            question: question,
            options: selectedTheme.scale,
        };

        try {
            await axios.post("/exam/add", {
                surveyName,
                questions: [newQuestion]
            });
            toast.success("Question added successfully!");
            setQuestion("");
            setSelectedCategory("");
            setOtherCategory("");
            setSelectedTheme(null);
            setDisplayCategoryInput(false);
            refreshData();
        } catch (error) {
            toast.error("Failed to add question");
        }
    };


    const handleAddTheme = async () => {
        if (!newThemeName || newThemeScale.some((s) => !s)) {
            toast.error("Please fill in all fields.");
            return;
        }

        const newTheme = {
            themeName: newThemeName,
            scale: newThemeScale,
        };

        try {
            if (editingTheme) {
                await axios.put("/exam/theme/edit", {
                    oldThemeName: editingTheme,
                    newTheme,
                });
                toast.success("Theme updated successfully!");
                setEditingTheme(null);
            } else {
                await axios.put("/exam/theme/update", newTheme);
                toast.success("Theme added successfully!");
            }

            setNewThemeName("");
            setNewThemeScale(["", "", "", "", ""]);
            refreshData();
        } catch (error) {
            toast.error("Failed to save theme");
        }
    };

    const handleEditTheme = (theme) => {
        setNewThemeName(theme.themeName);
        setNewThemeScale(theme.scale);
        setEditingTheme(theme.themeName);
    };

    const confirmDeleteTheme = (themeName) => {
        setModalAction(() => async () => {
            try {
                await axios.delete("/exam/theme/delete", { data: { themeName } });
                toast.success("Theme deleted successfully!");
                refreshData();
            } catch {
                toast.error("Delete failed");
            }
        });
        setModalOpen(true);
    };

    const confirmReleaseExam = (isReleased) => {
        setModalAction(() => async () => {
            try {
                await axios.put("/exam/release", { isReleased });
                toast.success(
                    `Exam ${isReleased ? "released" : "disabled"} successfully!`
                );
                refreshData();
            } catch {
                toast.error("Failed to update release status");
            }
        });
        setModalOpen(true);
    };

    const isFormValid =
        question &&
        selectedCategory &&
        selectedTheme &&
        (selectedCategory !== "Others" || otherCategory);

    if (isLoading) {
        return <LoadingDots />
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Add question card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h1 className="text-xl font-bold mb-6 text-[#0172bd]">
                    Add a New Question
                </h1>
                <div className="space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Question</span>
                        <textarea
                            placeholder="e.g., How would you rate your daily stress level?"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Category</span>
                        <select
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">Select an existing category</option>
                            {uniqueCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                            <option value="Others">Create a new category</option>
                        </select>
                    </label>

                    {displayCategoryInput && (
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">
                                New Category Name
                            </span>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                value={otherCategory}
                                onChange={(e) => setOtherCategory(e.target.value)}
                            />
                        </label>
                    )}

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                            Theme Scale
                        </span>
                        <select
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            value={selectedTheme?.themeName || ""}
                            onChange={handleThemeChange}
                        >
                            <option value="">Select a theme scale</option>
                            {theme?.likert?.map((th) => (
                                <option key={th.themeName} value={th.themeName}>
                                    {th.themeName}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow transition-all ${isFormValid
                            ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                        onClick={handleAddQuestion}
                        disabled={!isFormValid}
                    >
                        Add Question
                    </button>
                </div>
            </div>

            {/* Themes section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold mb-4 text-[#0172bd]">
                    {editingTheme ? "Edit Theme" : "Create New Theme"}
                </h2>
                <label className="block mb-2">
                    <span className="text-sm font-medium">Theme Name</span>
                    <input
                        type="text"
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        className="mt-1 block w-full border rounded px-3 py-2"
                        placeholder="Enter a theme name"
                    />
                </label>
                <div className="grid grid-cols-5 gap-2 mb-4">
                    {newThemeScale.map((val, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={val}
                            onChange={(e) => {
                                const updated = [...newThemeScale];
                                updated[idx] = e.target.value;
                                setNewThemeScale(updated);
                            }}
                            className="border rounded px-2 py-1"
                            placeholder={`Scale ${idx + 1}`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleAddTheme}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    {editingTheme ? "Save Changes" : "Save Theme"}
                </button>

                <h2 className="text-lg font-bold mt-6 mb-2 text-[#0172bd]">
                    Existing Themes
                </h2>
                {displayExistingTheme()}
            </div>

            {/* Release Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold mb-4 text-[#0172bd]">Release Exam</h2>
                {isReleased ? (
                    <button
                        onClick={() => confirmToggleRelease(false)}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Disable Release
                    </button>
                ) : (
                    <button
                        onClick={() => confirmToggleRelease(true)}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Release Exam
                    </button>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={modalOpen}
                title="Confirm Action"
                message="Are you sure you want to continue?"
                onConfirm={() => {
                    modalAction && modalAction();
                    setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}

export default WellnessContentManager;