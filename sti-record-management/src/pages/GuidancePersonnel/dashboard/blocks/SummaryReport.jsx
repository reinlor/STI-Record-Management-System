import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

function SummaryReport({ allData, slipData, leaderboardData }) {
    const [summary, setSummary] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const generateSummary = () => {
        if (!allData?.length && !slipData?.length) {
            setSummary("No data is available to generate a comprehensive report at this time. System analytics will be displayed here as data is collected.");
            return;
        }

        // --- Violation Analysis ---
        const totalViolations = allData.length;
        const violationCounts = allData.reduce((acc, item) => {
            const key = item.violation || "Uncategorized";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const sortedViolations = Object.entries(violationCounts).sort(([, a], [, b]) => b - a);
        const topViolation = sortedViolations[0];
        const topViolator = leaderboardData?.[0];

        // --- Slip Analysis ---
        const totalSlips = slipData.length;
        const slipCounts = slipData.reduce((acc, item) => {
            const key = item.type || "Uncategorized";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const sortedSlips = Object.entries(slipCounts).sort(([, a], [, b]) => b - a);
        const topSlipType = sortedSlips[0];

        // --- Constructing the Report ---
        let report = "This report provides a detailed analysis of student conduct and administrative requests based on the data recorded in the system.\n\n";

        // Violation Paragraph
        if (totalViolations > 0 && topViolation) {
            const percentage = ((topViolation[1] / totalViolations) * 100).toFixed(1);
            report += `In the area of student discipline, a total of ${totalViolations} violation(s) have been recorded. The most prevalent issue is "${topViolation[0]}", which constitutes ${topViolation[1]} of these cases, making up ${percentage}% of all violations. `;
            if (topViolator) {
                report += `The student with the most recorded infractions is ${topViolator.name}, who has accumulated ${topViolator.violations} violation(s). This data suggests a need to focus on addressing the root causes of ${topViolation[0].toLowerCase()} among the student body.\n\n`;
            } else {
                report += "There is currently no single student with a dominant number of infractions.\n\n";
            }
        } else {
            report += "Regarding student discipline, there have been no violations recorded in the system. This indicates a period of good conduct among the student population.\n\n";
        }

        // Request Slip Paragraph
        if (totalSlips > 0 && topSlipType) {
            report += `On the administrative side, ${totalSlips} request slip(s) have been processed. The most common request from students is for an "${topSlipType[0]}", with ${topSlipType[1]} instances recorded. This highlights the primary reason students interact with the guidance office for administrative purposes.`;
        } else {
            report += "For administrative tasks, no request slips have been processed during this period.";
        }

        setSummary(report);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const title = "Guidance Office - Summary Report";
        const date = new Date().toLocaleDateString();

        doc.setFontSize(18);
        doc.text(title, 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Generated on: ${date}`, 105, 26, { align: "center" });

        doc.setFontSize(12);
        // Use splitTextToSize to handle automatic line wrapping
        const textLines = doc.splitTextToSize(summary, 180); // 180 is the max width in mm
        doc.text(textLines, 15, 40);

        doc.save("Summary_Report.pdf");
    };

    useEffect(() => {
        generateSummary();
    }, [allData, slipData, leaderboardData]);

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between p-6 min-h-[300px]"
            >
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-[#0172b9] mb-3">
                        Summary Report
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-6">
                        {summary || "Generating summary..."}
                    </p>
                </div>
                <div className="flex justify-end mt-4">
                    <span className="text-xs text-[#0172b9] font-medium">
                        View full report →
                    </span>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2 md:p-4">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto custom-scrollbar max-h-[80vh] transition-transform duration-300 animate-fadeIn">
                        <button
                            className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold transition"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-semibold text-[#0172b9] mb-4">
                            Detailed Summary Report
                        </h2>
                        <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                            {summary || "No detailed summary available."}
                        </p>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleDownloadPDF}
                                className="bg-[#0172bd] text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Download as PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SummaryReport;
