import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

function RequestTypeFrequency({ slipData }) {
    const navigate = useNavigate();

    const getColor = (label) => {
        const colors = {
            'Absent Slip': 'rgba(228, 222, 6, 1)',
            'Incident Report': 'rgb(26, 26, 46)',
        };
        return colors[label] || `hsl(${Math.random() * 360}, 70%, 50%)`;
    };

    const defaultChartData = {
        labels: ["Absent Slip", "Incident Report"],
        datasets: [
            {
                label: "Request Count",
                data: [0, 0],
                backgroundColor: [
                    getColor("Absent Slip"),
                    getColor("Incident Report"),
                ],
                borderRadius: 6,
            },
        ],
    };

    const [barChartData, setBarChartData] = useState(defaultChartData);
    const [barTimePeriod, setBarTimePeriod] = useState("monthly");

    const processBarChartData = (data, period) => {
        if (!data || data.length === 0) {
            return defaultChartData;
        }

        let filteredByDate = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (period === "daily") {
            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate.getTime() === today.getTime();
            });
        } else if (period === "weekly") {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 6);
            oneWeekAgo.setHours(0, 0, 0, 0);

            const endOfToday = new Date(today);
            endOfToday.setHours(23, 59, 59, 999);

            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= oneWeekAgo && itemDate <= endOfToday;
            });
        } else if (period === "monthly") {
            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                return (
                    itemDate.getFullYear() === today.getFullYear() &&
                    itemDate.getMonth() === today.getMonth()
                );
            });
        } else if (period === "yearly") {
            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === today.getFullYear();
            });
        }

        const counts = { "Absent Slip": 0, "Incident Report": 0 };
        filteredByDate.forEach(item => {
            if (counts[item.type] !== undefined) {
                counts[item.type] += 1;
            }
        });

        return {
            labels: Object.keys(counts),
            datasets: [
                {
                    label: "Request Count",
                    data: Object.values(counts),
                    backgroundColor: Object.keys(counts).map(label => getColor(label)),
                    borderRadius: 6,
                },
            ],
        };
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };

    useEffect(() => {
        setBarChartData(processBarChartData(slipData, barTimePeriod));
    }, [barTimePeriod, slipData]);

    return (
        <div className="col-span-1 md:col-span-1 row-span-1 bg-white rounded-lg border border-gray-300 p-4 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#0172bd]">Request Type Frequency</h2>
                <div className="relative">
                    <select
                        className="block appearance-none w-full bg-white text-[#0172bd] border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm cursor-pointer"
                        value={barTimePeriod}
                        onChange={(e) => setBarTimePeriod(e.target.value)}
                    >
                        <option value="total">Total</option>
                        <option value="yearly">This Year</option>
                        <option value="monthly">This Month</option>
                        <option value="weekly">This Week</option>
                        <option value="daily">This Day</option>
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

            {/* Chart area */}
            <div
                className="flex-1 flex items-center justify-center h-[200px] cursor-pointer hover:bg-gray-50 transition"
                onClick={() => navigate("/guidance/request-slip")}
                title="View Request Slips"
            >
                <Bar data={barChartData} options={barChartOptions} />
            </div>

            <div className="flex flex-col gap-1 mt-4 text-xs">
                {barChartData.labels.map((label, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span
                            className="w-4 h-3 rounded-sm"
                            style={{
                                backgroundColor: barChartData.datasets[0].backgroundColor[index],
                            }}
                        ></span>
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RequestTypeFrequency;
