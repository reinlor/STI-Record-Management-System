import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";

function ViolationFrequency({ allData }) {
    const [lineChartData, setLineChartData] = useState(null);
    const [lineTimePeriod, setLineTimePeriod] = useState('monthly');

    const getColor = (label) => {
        const colors = {
            'color1': 'rgb(75, 192, 192)',
            'color2': 'rgb(75, 100, 192)',
            'color3': 'rgb(255, 99, 132)',
            'color4': 'rgb(54, 162, 235)',
            'color5': 'rgb(255, 206, 86)',
            'color6': 'rgb(153, 102, 255)',
            'color7': 'rgb(255, 159, 64)',
            'color8': 'rgb(201, 203, 207)',
        };
        return colors[label] || `hsl(${Math.random() * 360}, 70%, 50%)`;
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

    const handleLineTimePeriodChange = (event) => {
        setLineTimePeriod(event.target.value);
    };

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
        }
    }, [lineTimePeriod])

    return (
        <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Violation Frequency</h2>
                <div className="relative">
                    <select
                        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm cursor-pointer"
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
    )
}

export default ViolationFrequency;