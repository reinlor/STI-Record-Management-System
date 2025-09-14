import { useState, useEffect } from 'react';
import axios from 'axios';

import ViolationFrequency from "./blocks/ViolationFrequency";
import RequestTypeFrequency from './blocks/RequestTypeFrequency';
import Leaderboard from './blocks/Leaderboard';

const tailwindScript = document.createElement('script');
tailwindScript.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(tailwindScript);

const mockData = [
  { id: 'studentCase', '2023-2024': [
    { sid: '02000288488', name: 'Juan Dela Cruz', violation: 'Uniform Violation', section: '4A', date: '2023-10-26' },
    { sid: 'sid2', name: 'Maria Clara', violation: 'Tardiness', section: '3B', date: '2023-10-25' },
    { sid: '02000288488', name: 'Juan Dela Cruz', violation: 'Haircut Violation', section: '4A', date: '2023-10-24' },
    { sid: 'sid3', name: 'Crisostomo Ibarra', violation: 'Disrespect', section: '4A', date: '2023-10-23' },
    { sid: 'sid2', name: 'Maria Clara', violation: 'Tardiness', section: '3B', date: '2023-10-22' },
    { sid: '02000288488', name: 'Juan Dela Cruz', violation: 'Uniform Violation', section: '4A', date: '2023-10-21' },
    { sid: 'sid2', name: 'Maria Clara', violation: 'Tardiness', section: '3B', date: '2023-10-20' },
  ]},
  { id: 'slip-n-pass', '2023-2024': [] }
];

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allData, setAllData] = useState([]);
    const [slipData, setSlipData] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [schoolYear, setSchoolYear] = useState('');

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

                const schoolyear = await axios.get('/content/schoolPeriod/get')
                setSchoolYear(schoolyear.data.schoolYear);

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

            allData.forEach(entry => {
                const year = new Date(entry.date).getFullYear();
                const currentYear = new Date().getFullYear();

                // Only process violations from the current year
                if (year !== currentYear) return;

                const { sid, name, section } = entry;

                if (!violationCounts[sid]) {
                    violationCounts[sid] = {
                        sid,
                        name,
                        section,
                        violations: 0
                    };
                }
                violationCounts[sid].violations += 1;
            });

            const computedLeaderboardData = Object.values(violationCounts)
                .sort((a, b) => b.violations - a.violations)
                .slice(0, 10);

            setLeaderboardData(computedLeaderboardData);
        } else {
            setLeaderboardData([]);
        }
    }, [allData, schoolYear]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-gray-500 text-lg font-medium">Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#f3f4f6] p-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
                <ViolationFrequency allData={allData} />
                <Leaderboard leaderboardData={leaderboardData} schoolYear={schoolYear} />
                <RequestTypeFrequency slipData={slipData} />
                <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm min-h-[300px]">
                    <h2 className="text-lg font-bold mb-2 text-[#0172bd]">Other Data</h2>
                </div>
            </div>
        </div>
    );
};

export default App;
