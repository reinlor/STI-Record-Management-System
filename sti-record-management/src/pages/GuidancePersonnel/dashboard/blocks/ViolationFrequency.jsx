import { Line } from "react-chartjs-2";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ViolationFrequency({ allData }) {
    const [lineChartData, setLineChartData] = useState(null);
    const [lineTimePeriod, setLineTimePeriod] = useState("monthly");
    const navigate = useNavigate();

    // 🔹 Persistent color map (keeps same color for same type)
    const colorMapRef = useRef({});

    const parseDate = (raw) => {
        if (!raw) return null;
        if (raw._seconds) return new Date(raw._seconds * 1000);
        if (raw.seconds) return new Date(raw.seconds * 1000);
        if (raw.toDate && typeof raw.toDate === "function") return raw.toDate();
        return new Date(raw);
    };

    // 🔹 Consistent color assignment
    const getColor = (label) => {
        // if already assigned, reuse it
        if (colorMapRef.current[label]) return colorMapRef.current[label];

        // fixed palette of distinct colors
        const palette = [
            "#4BC0C0",
            "#4964C9",
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#9966FF",
            "#FF9F40",
            "#C9CBCF",
            "#28A745",
            "#E83E8C",
            "#20C997",
            "#6610F2",
        ];

        const assignedColors = Object.values(colorMapRef.current);
        const availableColors = palette.filter((c) => !assignedColors.includes(c));
        const color = availableColors.length
            ? availableColors[0]
            : `hsl(${Math.random() * 360}, 70%, 50%)`;

        colorMapRef.current[label] = color;
        return color;
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
    };

    const processLineChartData = (data, period) => {
        if (!data || data.length === 0) return null;

        const uniqueTypes = [...new Set(data.map((item) => item.type))];
        const datasets = uniqueTypes.map((type) => ({
            label: type,
            data: [],
            borderColor: getColor(type),
            tension: 0.1,
            fill: false,
        }));

        let labels = [];
        if (period === "daily") {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
                labels.push(d.getDate().toString());
            }
            datasets.forEach((dataset) => {
                dataset.data = labels.map((day) => {
                    const count = data.filter((item) => {
                        const itemDate = parseDate(item.date);
                        if (!itemDate) return false;
                        return (
                            itemDate.getFullYear() === today.getFullYear() &&
                            itemDate.getMonth() === today.getMonth() &&
                            itemDate.getDate() === parseInt(day) &&
                            item.type === dataset.label
                        );
                    }).length;
                    return count;
                });
            });
        } else if (period === "monthly") {
            labels = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            datasets.forEach((dataset) => {
                dataset.data = labels.map((_, index) => {
                    const count = data.filter((item) => {
                        const itemDate = parseDate(item.date);
                        if (!itemDate) return false;
                        return (
                            itemDate.getFullYear() === new Date().getFullYear() &&
                            itemDate.getMonth() === index &&
                            item.type === dataset.label
                        );
                    }).length;
                    return count;
                });
            });
        } else if (period === "yearly") {
            const years = [
                ...new Set(
                    data
                        .map((item) => {
                            const date = parseDate(item.date);
                            return date ? date.getFullYear() : null;
                        })
                        .filter(Boolean)
                ),
            ].sort();
            labels = years.length ? years : [new Date().getFullYear()];
            datasets.forEach((dataset) => {
                dataset.data = labels.map((year) => {
                    const count = data.filter((item) => {
                        const date = parseDate(item.date);
                        return date && date.getFullYear() === year && item.type === dataset.label;
                    }).length;
                    return count;
                });
            });
        } else if (period === "weekly") {
            labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
            datasets.forEach((dataset) => {
                const weeklyCounts = [0, 0, 0, 0, 0];
                data.forEach((item) => {
                    if (item.type === dataset.label) {
                        const date = parseDate(item.date);
                        if (!date) return;
                        const week = Math.floor(date.getDate() / 7);
                        if (week < 5) weeklyCounts[week]++;
                    }
                });
                dataset.data = weeklyCounts;
            });
        }

        return { labels, datasets };
    };

    const handleLineTimePeriodChange = (event) => {
        setLineTimePeriod(event.target.value);
    };

    useEffect(() => {
        if (allData.length > 0) {
            setLineChartData(processLineChartData(allData, lineTimePeriod));
        }
    }, [lineTimePeriod, allData]);

    return (
        <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-lg border border-gray-300 p-4 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#0172bd]">Violation Frequency</h2>
                <div className="relative">
                    <select
                        className="block appearance-none w-full bg-white text-[#0172bd] border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm cursor-pointer"
                        value={lineTimePeriod}
                        onChange={handleLineTimePeriodChange}
                    >
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div
                className="flex-1 flex items-center justify-center h-[200px] cursor-pointer hover:bg-gray-50 transition"
                onClick={() => navigate("/guidance/referral-form")}
                title="View Refferal Form"
            >
                {lineChartData ? (
                    <Line data={lineChartData} options={chartOptions} />
                ) : (
                    <span className="text-gray-400">No data available for this period.</span>
                )}
            </div>

            <div className="flex gap-4 mt-2 justify-center flex-wrap">
                {lineChartData?.datasets.map((dataset, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <span
                            className="w-4 h-3 inline-block rounded-sm"
                            style={{ backgroundColor: dataset.borderColor }}
                        ></span>
                        <span className="text-xs text-gray-700">{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViolationFrequency;
