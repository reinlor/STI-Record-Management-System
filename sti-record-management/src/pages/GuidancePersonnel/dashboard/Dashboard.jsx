import { useState, useEffect } from 'react';
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import axios from 'axios';

const tailwindScript = document.createElement('script');
tailwindScript.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(tailwindScript);

// Define the main App component that will contain all the logic and UI
const App = () => {
    // State for chart data
    const [lineChartData, setLineChartData] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lineTimePeriod, setLineTimePeriod] = useState('monthly');
    const [pieTimePeriod, setPieTimePeriod] = useState('monthly');
    const [allData, setAllData] = useState([]);
    const [slipData, setSlipData] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);

    // Helper function to get a consistent color for each label
    const getColor = (label) => {
        const colors = {
            'Violation': 'rgb(75, 192, 192)',
            'Absent Slip': 'rgb(75, 100, 192)',
            'Late Slip': 'rgb(255, 99, 132)',
            'Uniform Pass': 'rgb(54, 162, 235)',
            'ID Pass': 'rgb(255, 206, 86)',
            'Disciplinary Report': 'rgb(153, 102, 255)',
            'misc': 'rgb(255, 159, 64)',
            'betlog': 'rgb(201, 203, 207)',
        };
        return colors[label] || `hsl(${Math.random() * 360}, 70%, 50%)`;
    };

    // Helper function to process data for the line chart
    const processLineChartData = (data, period) => {
        if (!data || data.length === 0) return null;

        const uniqueTypes = [...new Set(data.map(item => item.type))];
        const datasets = uniqueTypes.map(type => ({
            label: type,
            data: [],
            borderColor: getColor(type),
            tension: 0.1,
            fill: false,
        }));

        let labels = [];
        if (period === 'daily') {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
                labels.push(d.getDate().toString());
            }
            datasets.forEach(dataset => {
                dataset.data = labels.map(day => {
                    const count = data.filter(item => {
                        const itemDate = new Date(item.date);
                        return itemDate.getFullYear() === today.getFullYear() &&
                            itemDate.getMonth() === today.getMonth() &&
                            itemDate.getDate() === parseInt(day) &&
                            item.type === dataset.label;
                    }).length;
                    return count;
                });
            });
        } else if (period === 'monthly') {
            labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            datasets.forEach(dataset => {
                dataset.data = labels.map((_, index) => {
                    const count = data.filter(item => {
                        const itemDate = new Date(item.date);
                        return itemDate.getFullYear() === new Date().getFullYear() &&
                            itemDate.getMonth() === index &&
                            item.type === dataset.label;
                    }).length;
                    return count;
                });
            });
        } else if (period === 'yearly') {
            const years = [...new Set(data.map(item => new Date(item.date).getFullYear()))].sort();
            labels = years.length ? years : [new Date().getFullYear()];
            datasets.forEach(dataset => {
                dataset.data = labels.map(year => {
                    const count = data.filter(item => new Date(item.date).getFullYear() === year && item.type === dataset.label).length;
                    return count;
                });
            });
        } else if (period === 'weekly') {
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
            datasets.forEach(dataset => {
                const weeklyCounts = [0, 0, 0, 0, 0];
                data.forEach(item => {
                    if (item.type === dataset.label) {
                        const week = Math.floor(new Date(item.date).getDate() / 7);
                        if (week < 5) weeklyCounts[week]++;
                    }
                });
                dataset.data = weeklyCounts;
            });
        }

        return { labels, datasets };
    };

    const processPieChartData = (data, period) => {
        if (!data || data.length === 0) return null;

        let filteredByDate = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (period === 'daily') {
            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate.getTime() === today.getTime();
            });
        } else if (period === 'weekly') {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 6); // include today + last 6 days

            // Normalize to midnight
            oneWeekAgo.setHours(0, 0, 0, 0);

            const endOfToday = new Date(today);
            endOfToday.setHours(23, 59, 59, 999);

            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= oneWeekAgo && itemDate <= endOfToday;
            });
        } else if (period === 'monthly') {
            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === today.getFullYear() &&
                    itemDate.getMonth() === today.getMonth();
            });
        } else if (period === 'yearly') {
            filteredByDate = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getFullYear() === today.getFullYear();
            });
        } else { // 'total'
            filteredByDate = data;
        }

        const filteredByType = filteredByDate.filter(item =>
            ['Absent Slip', 'ID Pass', 'Uniform Pass', 'Late Slip'].includes(item.type)
        );

        const counts = {};
        filteredByType.forEach(item => {
            counts[item.type] = (counts[item.type] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const chartData = Object.values(counts);
        const backgroundColors = labels.map(label => getColor(label));

        return {
            labels: labels,
            datasets: [{
                data: chartData,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('/chartData/retrieve');

                const studentDataContainer = response.data.find(item => item.id === 'studentCase');
                const studentYearKey = Object.keys(studentDataContainer).find(key => key !== 'id');
                const fetchedStudentData = studentDataContainer[studentYearKey] || [];
                setAllData(fetchedStudentData);

                const slipDataContainer = response.data.find(item => item.id === 'slip-n-pass');
                const slipYearKey = Object.keys(slipDataContainer).find(key => key !== 'id');
                const fetchedSlipData = slipDataContainer[slipYearKey] || [];
                setSlipData(fetchedSlipData);

                console.log("Data fetched successfully from API.");
            } catch (error) {
                console.error("Error fetching data:", error);
                console.log("Using mock data as a fallback.");

                const studentDataContainer = mockData.find(item => item.id === 'studentCase');
                const studentYearKey = Object.keys(studentDataContainer).find(key => key !== 'id');
                const fetchedStudentData = studentDataContainer[studentYearKey] || [];
                setAllData(fetchedStudentData);

                const slipDataContainer = mockData.find(item => item.id === 'slip-n-pass');
                const slipYearKey = Object.keys(slipDataContainer).find(key => key !== 'id');
                const fetchedSlipData = slipDataContainer[slipYearKey] || [];
                setSlipData(fetchedSlipData);

            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (allData.length > 0) {
            setLineChartData(processLineChartData(allData, lineTimePeriod));

            const violationCounts = {};
            allData.forEach(item => {
                if (item.type === 'Violation' || item.type === 'betlog' || item.type === 'misc') {
                    const studentId = item.sid;
                    violationCounts[studentId] = (violationCounts[studentId] || 0) + 1;
                }
            });

            // Mock student data for leaderboard names and sections
            const mockStudents = {
                '02000288488': { name: 'Juan Dela Cruz', section: '4A' },
                'sid2': { name: 'Maria Clara', section: '3B' },
                'sid3': { name: 'Crisostomo Ibarra', section: '4A' },
            };

            const computedLeaderboardData = Object.keys(violationCounts).map(sid => ({
                name: mockStudents[sid]?.name || 'Unknown Student',
                violations: violationCounts[sid],
                section: mockStudents[sid]?.section || 'N/A'
            })).sort((a, b) => b.violations - a.violations);

            setLeaderboardData(computedLeaderboardData);

        }

        if (slipData.length > 0) {
            setPieChartData(processPieChartData(slipData, pieTimePeriod));
        }
    }, [lineTimePeriod, pieTimePeriod, allData, slipData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
    };

    const handleLineTimePeriodChange = (event) => {
        setLineTimePeriod(event.target.value);
    };

    const handlePieTimePeriodChange = (event) => {
        setPieTimePeriod(event.target.value);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-gray-500 text-lg font-medium">Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-4 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
                {/* Violation Frequency (Line Chart) */}
                <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Violation Frequency</h2>
                        <div className="relative">
                            <select
                                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm"
                                value={lineTimePeriod}
                                onChange={handleLineTimePeriodChange}
                            >
                                <option value="yearly">Yearly</option>
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="daily">Daily</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center h-[200px]">
                        {lineChartData ? (
                            <Line data={lineChartData} options={chartOptions} />
                        ) : (
                            <span className="text-gray-400">No data available for this period.</span>
                        )}
                    </div>
                    <div className="flex gap-4 mt-2 justify-center flex-wrap">
                        {lineChartData?.datasets.map((dataset, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <span className="w-4 h-3 inline-block rounded-sm" style={{ backgroundColor: dataset.borderColor }}></span>
                                <span className="text-xs text-gray-700">{dataset.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboards */}
                <div className="col-span-1 md:col-span-1 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col min-h-[400px]">
                    <h2 className="text-lg font-semibold mb-2">Leaderboards</h2>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b">
                                    <th className="text-left py-1">NAME</th>
                                    <th className="text-center py-1">NO. OF VIOLATIONS</th>
                                    <th className="text-right py-1">YEAR/SECTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.length > 0 ? (
                                    leaderboardData.map((student, index) => (
                                        <tr key={index}>
                                            <td className="py-2">{student.name}</td>
                                            <td className="text-center">{student.violations}</td>
                                            <td className="text-right">{student.section}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center text-gray-400 py-4">No violation data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Request Type Frequency (Doughnut Chart) */}
                <div className="col-span-1 md:col-span-1 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Request Type Frequency</h2>
                        <div className="relative">
                            <select
                                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm"
                                value={pieTimePeriod}
                                onChange={handlePieTimePeriodChange}
                            >
                                <option value="total">Total</option>
                                <option value="yearly">This Year</option>
                                <option value="monthly">This Month</option>
                                <option value="weekly">This Week</option>
                                <option value="daily">This Day</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center h-[200px]">
                        {pieChartData ? (
                            <Doughnut data={pieChartData} options={pieChartOptions} />
                        ) : (
                            <span className="text-gray-400">No slip data available for this period.</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 mt-4 text-xs">
                        {pieChartData && pieChartData.labels.map((label, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="w-4 h-3 rounded-sm" style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index] }}></span>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty Card (for future content) */}
                <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm min-h-[300px]">
                    <h2 className="text-lg font-semibold mb-2">Other Data</h2>
                </div>
            </div>
        </div>
    );
};

export default App;
