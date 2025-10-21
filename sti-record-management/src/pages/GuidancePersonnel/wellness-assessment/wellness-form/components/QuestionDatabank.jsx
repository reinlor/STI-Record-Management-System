import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FixedSizeList as List } from "react-window";
import LoadingDots from "../../../../../component/Loading";

// Generate unique id for each question
const genId = (() => {
    let counter = 0;
    return () => `q-${Date.now()}-${counter++}`;
})();

export default function QuestionDatabank({ currentSurveyName, refreshData }) {
    const [questions, setQuestions] = useState([]);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(new Set());

    // --- Debounce search ---
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(handler);
    }, [query]);

    // --- Initial fetch ---
    useEffect(() => {
        fetchDatabank();
    }, []);

    const fetchDatabank = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/exam/questions/databank");
            const withIds = (res.data.questions || []).map((q) => ({
                ...q,
                uid: q._id || q.id || genId(), // ✅ fallback unique id
            }));
            setQuestions(withIds);
        } catch (err) {
            console.error("Failed to fetch question databank", err);
            toast.error("Failed to load question databank");
        } finally {
            setLoading(false);
        }
    };

    // --- Memoized filter ---
    const filtered = useMemo(() => {
        const lower = debouncedQuery.toLowerCase();
        return questions.filter(
            (q) =>
                (q.question || "").toLowerCase().includes(lower) ||
                (q.category || "").toLowerCase().includes(lower) ||
                (q.surveyName || "").toLowerCase().includes(lower)
        );
    }, [questions, debouncedQuery]);

    // --- Toggle select by uid ---
    const toggleSelect = (uid) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(uid) ? next.delete(uid) : next.add(uid);
            return next;
        });
    };

    // --- Insert selected ---
    const handleInsertSelected = async () => {
        if (!selected.size) return toast.info("No questions selected");
        if (!currentSurveyName) return toast.error("Select a survey first");

        const selectedList = filtered.filter((q) => selected.has(q.uid));
        if (!selectedList.length) return toast.info("No valid questions selected");

        const payloadQuestions = selectedList.map((q) => ({
            category: q.category || "Uncategorized",
            question: q.question,
            options: q.options || [],
        }));

        try {
            await axios.post("/exam/add", {
                surveyName: currentSurveyName,
                questions: payloadQuestions,
            });
            toast.success(`${payloadQuestions.length} question(s) added`);
            setSelected(new Set());
            refreshData && refreshData();
        } catch (err) {
            console.error("Insert failed", err);
            toast.error("Failed to insert questions");
        }
    };

    // --- Single insert handler ---
    const handleSingleInsert = async (q) => {
        if (!currentSurveyName) {
            toast.error("Select a survey first");
            return;
        }
        try {
            await axios.post("/exam/add", {
                surveyName: currentSurveyName,
                questions: [
                    {
                        category: q.category || "Uncategorized",
                        question: q.question,
                        options: q.options || [],
                    },
                ],
            });
            toast.success("Question added");
            refreshData && refreshData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add question");
        }
    };

    // --- Row renderer ---
    const Row = useCallback(
        ({ index, style }) => {
            const q = filtered[index];
            if (!q) return null;

            return (
                <div
                    style={style}
                    key={q.uid}
                    className={`p-3 bg-gray-50 rounded border mb-1 flex flex-col sm:flex-row items-start sm:items-center justify-between ${selected.has(q.uid) ? "bg-blue-50" : ""
                        }`}
                >
                    <div className="w-full sm:w-4/5">
                        <div className="font-semibold text-gray-800">{q.question}</div>
                        <div className="text-sm text-gray-600">
                            Category: {q.category || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                            From: {q.surveyName || "unknown"}
                        </div>
                    </div>

                    <div className="flex flex-col items-end sm:items-center sm:flex-row gap-2 mt-2 sm:mt-0">
                        <label className="text-sm flex items-center gap-1">
                            <input
                                type="checkbox"
                                checked={selected.has(q.uid)}
                                onChange={() => toggleSelect(q.uid)}
                                className="hover:cursor-pointer"
                            />
                            Select
                        </label>
                        <button
                            onClick={() => handleSingleInsert(q)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                        >
                            Insert
                        </button>
                    </div>
                </div>
            );
        },
        [filtered, selected]
    );

    // --- UI ---
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0172bd]">Question Databank</h3>

            <input
                type="text"
                placeholder="Search questions, category, or source survey..."
                className="border rounded px-3 py-2 w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {loading ? (
                <div className="flex justify-center py-6">
                    <LoadingDots />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-sm text-gray-600">No questions found.</div>
            ) : (
                <List
                    height={400}
                    itemCount={filtered.length}
                    itemSize={115}
                    width="100%"
                    className="custom-scrollbar border rounded-md"
                >
                    {Row}
                </List>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer"
                    onClick={handleInsertSelected}
                >
                    Insert Selected
                </button>
                <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition cursor-pointer"
                    onClick={fetchDatabank}
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}
