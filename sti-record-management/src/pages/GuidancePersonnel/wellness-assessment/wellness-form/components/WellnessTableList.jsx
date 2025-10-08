import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function WellnessTableList({ data, refreshData, themes }) {
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editText, setEditText] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editTheme, setEditTheme] = useState("");

    if (data.length === 0) {
        return <div>There is no data</div>;
    }

    const groupedData = data.reduce((acc, currentItem) => {
        if (!acc[currentItem.category]) {
            acc[currentItem.category] = [];
        }
        acc[currentItem.category].push(currentItem);
        return acc;
    }, {});

    // Delete a question
    const handleDeleteQuestion = async (question) => {
        try {
            await axios.delete("/exam/question/delete", { data: { surveyName, question } });
            toast.success("Question deleted successfully!");
            refreshData();
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Failed to delete question");
        }
    };

    // Save edits (replace inside full array, not overwrite)
    const handleSaveEdit = async () => {
        try {
            const finalCategory =
                editCategory === "Others" ? newCategoryName : editCategory;
            const themeObj = themes.find((t) => t.themeName === editTheme);

            const updatedQuestions = data.map((q) =>
                q.question === editingQuestion.question
                    ? {
                        ...q,
                        question: editText,
                        category: finalCategory,
                        options: themeObj ? themeObj.scale : q.options,
                    }
                    : q
            );

            await axios.put("/exam/update", { surveyName, questions: updatedQuestions });

            toast.success("Question updated successfully!");
            setEditingQuestion(null);
            setEditText("");
            setEditCategory("");
            setNewCategoryName("");
            setEditTheme("");
            refreshData();
        } catch (err) {
            console.error("Update failed", err);
            toast.error("Failed to update question");
        }
    };

    return (
        <div className="space-y-8">
            {Object.keys(groupedData).map((category) => (
                <div
                    key={category}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                >
                    <h2 className="text-lg font-bold text-[#0172bd] border-b pb-2 mb-4">
                        {category}
                    </h2>
                    <div className="space-y-4">
                        {groupedData[category].map((res, index) => {
                            const themeMatch = themes.find(
                                (t) =>
                                    Array.isArray(t.scale) &&
                                    JSON.stringify(t.scale) === JSON.stringify(res.options)
                            );

                            return (
                                <div
                                    key={index}
                                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-400 hover:shadow transition"
                                >
                                    {editingQuestion?.question === res.question ? (
                                        <div className="space-y-3">
                                            {/* Question input */}
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="border rounded px-3 py-2 w-full"
                                            />

                                            {/* Category dropdown */}
                                            <select
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="border rounded px-3 py-2 w-full"
                                            >
                                                <option value="">Select category</option>
                                                {Object.keys(groupedData).map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                                <option value="Others">Create a new category</option>
                                            </select>

                                            {editCategory === "Others" && (
                                                <input
                                                    type="text"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    className="border rounded px-3 py-2 w-full"
                                                    placeholder="Enter new category"
                                                />
                                            )}

                                            {/* Theme dropdown */}
                                            <select
                                                value={editTheme}
                                                onChange={(e) => setEditTheme(e.target.value)}
                                                className="border rounded px-3 py-2 w-full"
                                            >
                                                <option value="">Select Theme</option>
                                                {themes.map((t) => (
                                                    <option key={t.themeName} value={t.themeName}>
                                                        {t.themeName}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-3 py-1 bg-green-600 text-white rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingQuestion(null)}
                                                    className="px-3 py-1 bg-gray-400 text-white rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-semibold text-gray-800 mb-2">
                                                {res.question}
                                            </h3>

                                            {!themeMatch && (
                                                <p className="text-red-600 text-sm">
                                                    ⚠️ This question’s theme was deleted
                                                </p>
                                            )}

                                            <ul className="space-y-1 pl-2">
                                                {res.options.map((option, optionIndex) => (
                                                    <li
                                                        key={optionIndex}
                                                        className="text-gray-600 flex items-center"
                                                    >
                                                        <span className="text-indigo-500 font-medium mr-2">
                                                            {optionIndex + 1}.
                                                        </span>
                                                        {option}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex gap-4 mt-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingQuestion(res);
                                                        setEditText(res.question);
                                                        setEditCategory(res.category);
                                                        setEditTheme(
                                                            themes.find((t) =>
                                                                JSON.stringify(t.scale) ===
                                                                JSON.stringify(res.options)
                                                            )?.themeName || ""
                                                        );
                                                    }}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(res.question)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default WellnessTableList;
