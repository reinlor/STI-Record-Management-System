import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";


function RequestTypeFrequency({ slipData }) {
    const [pieChartData, setPieChartData] = useState(null);
    const [pieTimePeriod, setPieTimePeriod] = useState('monthly');

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

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
    };

    useEffect(() => {
        if (slipData.length > 0) {
            setPieChartData(processPieChartData(slipData, pieTimePeriod));
        }
    }, [pieTimePeriod]);

    const handlePieTimePeriodChange = (event) => {
        setPieTimePeriod(event.target.value);
    };

    return (
        <div className="col-span-1 md:col-span-1 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Request Type Frequency</h2>
                <div className="relative">
                    <select
                        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-lg shadow leading-tight focus:outline-none focus:shadow-outline text-sm cursor-pointer"
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
    )
}

export default RequestTypeFrequency;