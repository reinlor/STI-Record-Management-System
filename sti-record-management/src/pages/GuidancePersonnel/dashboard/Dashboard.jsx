import { useState, useEffect } from 'react';
import axios from 'axios';

// Mga separate na JSX Components
import ViolationFrequency from "./blocks/ViolationFrequency"
import RequestTypeFrequency from './blocks/RequestTypeFrequency';

const tailwindScript = document.createElement('script');
tailwindScript.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(tailwindScript);

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allData, setAllData] = useState([]);
    const [slipData, setSlipData] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);

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
            const violationCounts = {};

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
    }, [ allData, slipData]);

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
                <ViolationFrequency allData={allData}/>

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
                <RequestTypeFrequency slipData={slipData}/>

                {/* Empty Card (for future content) */}
                <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm min-h-[300px]">
                    <h2 className="text-lg font-semibold mb-2">Other Data</h2>
                </div>
            </div>
        </div>
    );
};

export default App;
