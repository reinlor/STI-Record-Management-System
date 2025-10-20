import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function SummaryReport({ allData, slipData, leaderboardData }) {
    const [summary, setSummary] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schoolYear, setSchoolYear] = useState(null);
    const violationChartRef = useRef(null);
    const slipChartRef = useRef(null);
    const [filteredAllData, setFilteredAllData] = useState([]);
    const [filteredSlipData, setFilteredSlipData] = useState([]);

    const themeColor = "#0172BD"; // STI Blue

    // 🔹 Fetch current school year
    useEffect(() => {
        const fetchSchoolYear = async () => {
            try {
                const res = await axios.get("/content/schoolPeriod/get");
                if (res.data?.schoolYear) {
                    setSchoolYear(res.data.schoolYear);
                }
            } catch (err) {
                console.error("Error fetching school year:", err);
            }
        };
        fetchSchoolYear();
    }, []);

    // 🔹 Filter data by schoolYear
    useEffect(() => {
        if (schoolYear) {
            const filteredViolations = allData.filter(
                (item) => item.schoolYear === schoolYear
            );
            const filteredSlips = slipData.filter(
                (item) => item.schoolYear === schoolYear
            );
            setFilteredAllData(filteredViolations);
            setFilteredSlipData(filteredSlips);
        }
    }, [schoolYear, allData, slipData]);

    const generateSummary = () => {
        if (!filteredAllData?.length && !filteredSlipData?.length) {
            setSummary(
                "No data is available to generate a comprehensive report for this school year."
            );
            return;
        }

        // --- Violation Analysis ---
        const totalViolations = filteredAllData.length;
        const violationCounts = filteredAllData.reduce((acc, item) => {
            const key = item.violation || item.type || "Uncategorized";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const sortedViolations = Object.entries(violationCounts).sort(
            ([, a], [, b]) => b - a
        );
        const topViolation = sortedViolations[0];
        const topViolator = leaderboardData?.[0];

        // --- Slip Analysis ---
        const totalSlips = filteredSlipData.length;
        const slipCounts = filteredSlipData.reduce((acc, item) => {
            const key = item.type || "Uncategorized";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const sortedSlips = Object.entries(slipCounts).sort(
            ([, a], [, b]) => b - a
        );
        const topSlipType = sortedSlips[0];

        // --- Report Text ---
        let report = `Guidance Office Report for School Year ${schoolYear}\n\n`;

        if (totalViolations > 0 && topViolation) {
            const percentage = ((topViolation[1] / totalViolations) * 100).toFixed(1);
            report += `• A total of ${totalViolations} violation(s) were recorded. The most frequent violation is "${topViolation[0]}", making up ${percentage}% (${topViolation[1]} cases).\n`;
            if (topViolator) {
                report += `• The top violator is ${topViolator.name} with ${topViolator.violations} recorded case(s).\n\n`;
            }
        } else {
            report += "• No violations recorded this school year.\n\n";
        }

        if (totalSlips > 0 && topSlipType) {
            report += `• ${totalSlips} request slip(s) were processed. The most common type was "${topSlipType[0]}" (${topSlipType[1]} occurrences).\n\n`;
        } else {
            report += "• No request slips were processed this school year.\n\n";
        }

        setSummary(report);
        setTimeout(() => drawCharts(violationCounts, slipCounts), 100);
    };

    const drawCharts = (violationCounts, slipCounts) => {
        Chart.getChart("violationChart")?.destroy();
        Chart.getChart("slipChart")?.destroy();

        // Bar Chart — Violations
        const ctx1 = violationChartRef.current.getContext("2d");
        new Chart(ctx1, {
            type: "bar",
            data: {
                labels: Object.keys(violationCounts),
                datasets: [
                    {
                        label: "Violations",
                        data: Object.values(violationCounts),
                        backgroundColor: themeColor,
                        borderRadius: 6,
                    },
                ],
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Violations by Type" },
                },
                scales: { y: { beginAtZero: true } },
            },
        });

        // Pie Chart — Slips
        const ctx2 = slipChartRef.current.getContext("2d");
        new Chart(ctx2, {
            type: "pie",
            data: {
                labels: Object.keys(slipCounts),
                datasets: [
                    {
                        label: "Requests",
                        data: Object.values(slipCounts),
                        backgroundColor: [
                            "#FFD700",
                            "#1E90FF",
                            "#FF7F50",
                            "#9B59B6",
                            "#2ECC71",
                        ],
                    },
                ],
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            generateLabels: (chart) => {
                                const data = chart.data;
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => ({
                                    text: `${label} - ${data.datasets[0].data[i]} (${(
                                        (data.datasets[0].data[i] / total) *
                                        100
                                    ).toFixed(1)}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                }));
                            },
                        },
                    },
                    title: { display: true, text: "Request Slips by Type" },
                },
            },
        });
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF("p", "mm", "a4");
        const date = new Date().toLocaleDateString();

        doc.setFillColor(themeColor);
        doc.rect(0, 0, 210, 25, "F");
        doc.setTextColor("#FFFFFF");
        doc.setFontSize(16);
        doc.text("Guidance Office Summary Report", 105, 16, { align: "center" });

        doc.setTextColor("#000000");
        doc.setFontSize(10);
        doc.text(`Generated on: ${date}`, 105, 32, { align: "center" });

        let y = 42;
        doc.line(15, y, 195, y);
        y += 8;

        doc.setFontSize(12);
        const paragraphs = doc.splitTextToSize(summary, 180);
        doc.text(paragraphs, 15, y);
        y += paragraphs.length * 6 + 10;

        doc.setFontSize(14);
        doc.setTextColor(themeColor);
        doc.text("Visual Analytics", 105, y, { align: "center" });
        y += 6;
        doc.line(70, y, 140, y);
        y += 8;

        const vCanvas = violationChartRef.current;
        const sCanvas = slipChartRef.current;

        if (vCanvas && sCanvas) {
            const vImg = vCanvas.toDataURL("image/png", 1.0);
            const sImg = sCanvas.toDataURL("image/png", 1.0);
            doc.addImage(vImg, "PNG", 25, y, 160, 60);
            doc.addImage(sImg, "PNG", 25, y + 70, 160, 60);
            y += 140;
        }

        doc.setDrawColor(220, 220, 220);
        doc.line(15, 280, 195, 280);
        doc.setFontSize(9);
        doc.setTextColor("#555555");
        doc.text("Generated by Guidance Management System", 105, 287, { align: "center" });

        doc.save(`Guidance_Report_${schoolYear}.pdf`);
    };

    useEffect(() => {
        if (schoolYear) generateSummary();
    }, [schoolYear, filteredAllData, filteredSlipData, leaderboardData]);

    return (
        <>
            <canvas
                id="violationChart"
                ref={violationChartRef}
                width="320"
                height="160"
                style={{ display: "none" }}
            />
            <canvas
                id="slipChart"
                ref={slipChartRef}
                width="320"
                height="160"
                style={{ display: "none" }}
            />

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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 md:p-4">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto custom-scrollbar max-h-[80vh] transition-transform duration-300 animate-fadeIn">
                        <button
                            className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold transition"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-semibold text-[#0172b9] mb-4">
                            Detailed Summary Report ({schoolYear || "Loading..."})
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
