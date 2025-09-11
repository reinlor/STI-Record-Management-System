import { useState } from "react";
import axios from "axios";

function WellnessContentManager({ data, theme }) {
    const [displayCategoryInput, setDisplayCategoryInput] = useState(false);
    const [question, setQuestion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [otherCategory, setOtherCategory] = useState("");
    const [selectedTheme, setSelectedTheme] = useState(null);

    const uniqueCategories = [...new Set(data.map((item) => item.category))];

    const displayExistingTheme = () => {
        if (!theme || !theme.likert || !Array.isArray(theme.likert)) {
            return <p>No themes available or incorrect data format.</p>;
        }

        return theme.likert.map((th, themeIndex) => (
            <div key={th._id || th.themeName || themeIndex} className="p-4 bg-gray-100 rounded-lg mb-4">
                <h2 className="text-lg font-semibold">{th.themeName}</h2>
                {th.scale && Array.isArray(th.scale) ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {th.scale.map((sc, scaleIndex) => (
                            <span key={sc || scaleIndex} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                                {sc}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No scale data available.</p>
                )}
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
        const selectedThemeObject = theme.likert.find(th => th.themeName === themeName);
        setSelectedTheme(selectedThemeObject);
    };

    const handleAddQuestion = async () => {
        const finalCategory = selectedCategory === "Others" ? otherCategory : selectedCategory;

        if (!question || !finalCategory || !selectedTheme) {
            console.log("Please fill in all the required fields.");
            return;
        }

        const newQuestion = {
            category: finalCategory,
            question: question,
            options: selectedTheme.scale
        };

        const requestBody = {
            questions: [newQuestion]
        };

        try {
            const response = await axios.post("/exam/add", requestBody);
            console.log("Question added successfully:", response.data);
            alert("Question added successfully!");
            
            setQuestion("");
            setSelectedCategory("");
            setOtherCategory("");
            setSelectedTheme(null);
            setDisplayCategoryInput(false);
        } catch (error) {
            console.error("Failed to add question:", error);
            alert(`Failed to add question: ${error.message}`);
        }
    };

    const isFormValid = question && selectedCategory && selectedTheme && (selectedCategory !== "Others" || otherCategory);

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-8">
                    {/* Add question card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h1 className="text-xl font-bold mb-6 text-indigo-700">➕ Add a New Question</h1>
                        <div className="space-y-5">
                            {/* inputs same as your code but with consistent spacing */}
                        </div>
                    </div>
                    <div className="space-y-5">
                        {/* Question input */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Question</span>
                            <textarea
                                placeholder="e.g., How would you rate your daily stress level?"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                        </label>

                        {/* Category select */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Category</span>
                            <select
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">Select an existing category</option>
                                {uniqueCategories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                                <option value="Others">Create a new category</option>
                            </select>
                        </label>

                        {/* New category input */}
                        {displayCategoryInput && (
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">New Category Name</span>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    value={otherCategory}
                                    onChange={(e) => setOtherCategory(e.target.value)}
                                />
                            </label>
                        )}

                        {/* Theme select */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Theme Scale</span>
                            <select
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                value={selectedTheme?.themeName || ""}
                                onChange={handleThemeChange}
                            >
                                <option value="">Select a theme scale</option>
                                {theme?.likert?.map((th) => (
                                    <option key={th.themeName} value={th.themeName}>{th.themeName}</option>
                                ))}
                            </select>
                        </label>

                        {/* Button */}
                        <button
                            className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow transition-all ${isFormValid
                                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500'
                                : 'bg-gray-300 cursor-not-allowed'
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
                    <h2 className="text-lg font-bold mb-4 text-indigo-700">🎨 Existing Themes</h2>
                    <div>
                        <h2>Create new theme</h2>
                        <label>Name</label>
                        <input placeholder="Enter a theme name"/>

                    </div>
                    {displayExistingTheme()}
                </div>
            </div>
        </div>
    );
}

export default WellnessContentManager