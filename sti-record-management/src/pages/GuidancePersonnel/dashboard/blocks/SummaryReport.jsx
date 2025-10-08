import React, { useState, useEffect } from "react";
import axios from "axios";

function SummaryReport({ allData, slipData }) {
    const [shortSummary, setShortSummary] = useState("");
    const [detailedSummary, setDetailedSummary] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchSummary = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.post(
                "http://localhost:5000/generate/generate-summary",
                { allData, slipData }
            );
            setShortSummary(response.data.shortSummary);
            setDetailedSummary(response.data.detailedSummary);
        } catch (err) {
            console.error("❌ Error fetching summary:", err);
            setError("Failed to generate AI summary. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allData?.length || slipData?.length) {
            fetchSummary();
        }
    }, [allData, slipData]);

    return (
        <>
            <div
                onClick={() => !loading && setIsModalOpen(true)}
                className="
          bg-white rounded-lg border border-gray-300
          shadow-sm 
          hover:shadow-md 
          transition-all 
          duration-300 
          cursor-pointer 
          flex flex-col 
          justify-between 
          p-6 
          min-h-[300px]
        "
            >
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-[#0172b9] mb-3">
                        Summary Report
                    </h2>

                    {loading ? (
                        <p className="text-sm text-gray-500 italic animate-pulse">
                            Generating summary...
                        </p>
                    ) : error ? (
                        <p className="text-sm text-red-500">{error}</p>
                    ) : (
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                            {shortSummary || "No summary available yet."}
                        </p>
                    )}
                </div>

                {!loading && !error && (
                    <div className="flex justify-end mt-4">
                        <span className="text-xs text-[#0172b9] font-medium">
                            View full report →
                        </span>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2 md:p-4">
                    <div
                        className="
              bg-white 
              rounded-2xl 
              shadow-lg 
              w-full 
              max-w-3xl 
              p-6 
              relative 
              overflow-y-auto 
              max-h-[80vh]
              transition-transform 
              duration-300 
              animate-fadeIn
            "
                    >
                        <button
                            className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold transition"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ×
                        </button>

                        <h2 className="text-2xl font-semibold text-[#0172b9] mb-4">
                            Detailed Summary Report
                        </h2>

                        {loading ? (
                            <p className="text-sm text-gray-500 italic animate-pulse">
                                Loading report...
                            </p>
                        ) : error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : (
                            <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                                {detailedSummary || shortSummary || "No detailed summary available."}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default SummaryReport;
