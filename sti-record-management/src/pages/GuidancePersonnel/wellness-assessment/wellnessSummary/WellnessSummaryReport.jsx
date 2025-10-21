// client/src/wellnessSummary/WellnessSummaryReport.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { ArrowLeft, RefreshCw, BarChart2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import LoadingDots from "../../../../component/Loading";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro"; // Use html2canvas-pro to support oklch colors

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WellnessSummary({ onBack }) {
    const [summaries, setSummaries] = useState([]);
    const [selected, setSelected] = useState(null); // surveyName
    const [detail, setDetail] = useState(null);
    const [rawResponses, setRawResponses] = useState([]);
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loading, setLoading] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false)

    const fetchSummaries = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/summary/getAll");
            setSummaries(res.data.summaries || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load summaries");
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (surveyName) => {
        setLoadingDetail(true);
        setError(null);
        setExpandedQuestion(null);
        setRawResponses([]);
        setCurrentPage(1);
        try {
            const res = await axios.get(`/summary/get/${encodeURIComponent(surveyName)}`);
            setDetail(res.data);
            setSelected(surveyName);

            // Fetch raw responses (assuming new endpoint /summary/getRaw/:surveyName)
            const rawRes = await axios.get(`/summary/getRaw/${encodeURIComponent(surveyName)}`);
            setRawResponses(rawRes.data.responses || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load survey details");
        } finally {
            setLoadingDetail(false);
        }
    };

    const downloadPDF = async () => {
        setIsExporting(true);
        const element = document.getElementById("survey-detail");
        if (!element) return setIsExporting(false);

        const originalExpanded = expandedQuestion;
        setExpandedQuestion(null);

        // Wait for render
        await new Promise((resolve) => setTimeout(resolve, 100));

        html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${detail.surveyName}_summary.pdf`);

            // Restore expanded state
            setExpandedQuestion(originalExpanded);
        });
        setIsExporting(false)
    };

    const getPaginatedResponses = (question) => {
        const questionResponses = rawResponses.map((resp) => ({
            studentId: resp.studentId,
            answer: resp.responses.find((r) => r.question === question)?.selectedAnswer || "N/A",
        }));
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return {
            paginated: questionResponses.slice(start, end),
            totalPages: Math.ceil(questionResponses.length / itemsPerPage),
        };
    };

    const getTextSummary = (q) => {
        if (!q.percentages) return "No percentage data available.";
        const sorted = Object.entries(q.percentages).sort(([, a], [, b]) => b - a);
        return `Most common response: ${sorted[0][0]} (${sorted[0][1]}%). ` +
            (sorted[1] ? `Followed by ${sorted[1][0]} (${sorted[1][1]}%).` : "");
    };

    useEffect(() => {
        fetchSummaries();
    }, []);

    return (
        <div className="bg-gray-100 h-full">
            <div className="bg-white rounded-lg shadow-lg p-4 h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0172bd] shadow hover:bg-blue-500 transition text-white font-semibold text-base mr-3 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Wellness Survey Summaries
                    </h2>
                </div>

                {/* Loading + Error */}
                {loading && <LoadingDots />}
                {error && <p className="text-red-600">{error}</p>}

                {/* List of surveys */}
                {!selected && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {summaries.length === 0 && (
                            <p className="text-gray-500">No survey submissions yet.</p>
                        )}
                        {summaries.map((s) => (
                            <div
                                key={s.surveyName}
                                className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                            >
                                <div className="flex items-start gap-3">
                                    <BarChart2 className="text-[#0172bd] w-6 h-6" />
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">
                                            {s.surveyName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Total submissions:{" "}
                                            <span className="font-medium">{s.totalSubmissions}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => fetchDetail(s.surveyName)}
                                    className="mt-6 px-4 py-2 rounded-lg bg-[#0172bd] text-white font-medium hover:bg-blue-500 transition w-full cursor-pointer"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detailed survey view */}
                {selected && (
                    <div>
                        {/* Header for detail view */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                                    {detail?.surveyName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Total submissions:{" "}
                                    <span className="font-medium">{detail?.totalSubmissions}</span>
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                                    onClick={() => {
                                        setSelected(null);
                                        setDetail(null);
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to List
                                </button>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
                                    onClick={() => fetchDetail(selected)}
                                    disabled={loadingDetail}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {loadingDetail ? "Refreshing..." : "Refresh"}
                                </button>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                                    onClick={downloadPDF}
                                    disabled={loadingDetail || isExporting}
                                >
                                    <Download className="w-4 h-4" />
                                    {isExporting ? 'Downloading...' : 'Download Pdf'}
                                </button>
                            </div>
                        </div>

                        {/* Charts */}
                        <div id="survey-detail">
                            {(detail?.questions || []).map((q, idx) => {
                                const labels = Object.keys(q.counts || {});
                                const data = labels.map((l) => q.counts[l]);
                                const chartData = {
                                    labels,
                                    datasets: [
                                        {
                                            label: `${q.totalResponses} responses`,
                                            data,
                                            backgroundColor: [
                                                "#6366F1",
                                                "#10B981",
                                                "#F59E0B",
                                                "#EF4444",
                                                "#3B82F6",
                                                "#8B5CF6",
                                            ],
                                            borderRadius: 6,
                                        },
                                    ],
                                };
                                const options = {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: q.question, font: { size: 16 } },
                                    },
                                };

                                const { paginated, totalPages } = expandedQuestion === q.question
                                    ? getPaginatedResponses(q.question)
                                    : { paginated: [], totalPages: 0 };

                                return (
                                    <div
                                        key={idx}
                                        className="bg-white p-6 rounded-2xl shadow mb-8"
                                    >
                                        <div className="h-72 md:h-96">
                                            <Bar data={chartData} options={options} />
                                        </div>
                                        <div className="mt-4 text-sm text-gray-700">
                                            <p className="mt-2">{getTextSummary(q)}</p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setExpandedQuestion(
                                                    expandedQuestion === q.question ? null : q.question
                                                )
                                            }
                                            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-sm font-medium cursor-pointer"
                                        >
                                            {expandedQuestion === q.question ? "Hide" : "View"} Individual Responses
                                        </button>
                                        {expandedQuestion === q.question && (
                                            <div className="mt-4 border-t pt-4">
                                                <div className="grid grid-cols-2 gap-4 font-bold text-gray-800 mb-2">
                                                    <div>Student ID</div>
                                                    <div>Selected Answer</div>
                                                </div>
                                                {paginated.map((item, itemIdx) => (
                                                    <div
                                                        key={itemIdx}
                                                        className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0 text-gray-700"
                                                    >
                                                        <div>{item.studentId}</div>
                                                        <div>{item.answer}</div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between mt-4">
                                                    <button
                                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" /> Prev
                                                    </button>
                                                    <span>Page {currentPage} of {totalPages}</span>
                                                    <button
                                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50 cursor-pointer"
                                                    >
                                                        Next <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {detail?.questions?.length === 0 && (
                                <p className="text-gray-500">No question stats available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}