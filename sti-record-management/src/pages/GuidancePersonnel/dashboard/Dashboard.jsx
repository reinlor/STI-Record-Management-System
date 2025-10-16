// Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import StatCard from "./blocks/StatCard";
import ViolationFrequency from "./blocks/ViolationFrequency";
import RequestTypeFrequency from "./blocks/RequestTypeFrequency";
import Leaderboard from "./blocks/Leaderboard";
import Loading from "../../../component/Loading";
import SummaryReport from "./blocks/SummaryReport";
import ModuleShortcuts from "./blocks/ModuleShortcuts";
import TodoList from "./blocks/TodoList";

const tailwindScript = document.createElement("script");
tailwindScript.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tailwindScript);

const mockData = [
    {
        id: "studentCase",
        "2023-2024": [
            { sid: "02000288488", name: "Juan Dela Cruz", violation: "Uniform Violation", section: "4A", date: "2023-10-26" },
            { sid: "sid2", name: "Maria Clara", violation: "Tardiness", section: "3B", date: "2023-10-25" },
            { sid: "02000288488", name: "Juan Dela Cruz", violation: "Haircut Violation", section: "4A", date: "2023-10-24" },
            { sid: "sid3", name: "Crisostomo Ibarra", violation: "Disrespect", section: "4A", date: "2023-10-23" },
            { sid: "sid2", name: "Maria Clara", violation: "Tardiness", section: "3B", date: "2023-10-22" },
            { sid: "02000288488", name: "Juan Dela Cruz", violation: "Uniform Violation", section: "4A", date: "2023-10-21" },
            { sid: "sid2", name: "Maria Clara", violation: "Tardiness", section: "3B", date: "2023-10-20" },
        ],
    },
    { id: "slip-n-pass", "2023-2024": [] },
];

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allData, setAllData] = useState([]);
    const [slipData, setSlipData] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [schoolYear, setSchoolYear] = useState("");
    const [counters, setCounters] = useState({
        students: 0,
        shsCount: 0,
        tertiaryCount: 0,
        cases: 0,
        pendingSlips: 0,
        pendingForms: 0,
        onGoingCases: 0,
    });


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("/chartData/retrieve");
                const studentDataContainer = response.data.find((item) => item.id === "studentCase");
                const studentYearKey = studentDataContainer && Object.keys(studentDataContainer).find((k) => k !== "id");
                const fetchedStudentData = (studentDataContainer && studentDataContainer[studentYearKey]) || [];
                setAllData(fetchedStudentData || []);

                const slipDataContainer = response.data.find((item) => item.id === "slip-n-pass");
                const slipYearKey = slipDataContainer && Object.keys(slipDataContainer).find((k) => k !== "id");
                const fetchedSlipData = (slipDataContainer && slipDataContainer[slipYearKey]) || [];
                setSlipData(fetchedSlipData || []);

                const countersRes = await axios.get("/chartData/counters");
                setCounters(countersRes.data);

                const schoolyear = await axios.get("/content/schoolPeriod/get");
                setSchoolYear(schoolyear.data.schoolYear);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (allData.length > 0) {
            const violationCounts = {};
            allData.forEach((entry) => {
                const year = new Date(entry.date).getFullYear();
                const currentYear = new Date().getFullYear();

                if (year !== currentYear) return;

                const { sid, name, section } = entry;
                if (!violationCounts[sid]) {
                    violationCounts[sid] = { sid, name, section, violations: 0 };
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

    const { uniqueStudentsCount, casesCount, pendingSlipsCount, pendingFormsCount } = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentYearEntries = allData.filter((d) => {
            try {
                return new Date(d.date).getFullYear() === currentYear;
            } catch {
                return false;
            }
        });

        const uniqueStudents = new Set(currentYearEntries.map((e) => e.sid).filter(Boolean));
        const studentsCount = uniqueStudents.size;
        const cases = currentYearEntries.length;

        const pendingSlips = slipData && Array.isArray(slipData)
            ? (slipData.filter((s) => s?.status === "pending").length || slipData.length)
            : 0;

        let pendingForms = 0;
        if (Array.isArray(allData) && allData.length > 0) {
            pendingForms =
                allData.filter((d) => d?.formStatus === "pending").length ||
                allData.filter((d) => d?.status === "pending").length ||
                0;
        }

        return {
            uniqueStudentsCount: studentsCount,
            casesCount: cases,
            pendingSlipsCount: pendingSlips,
            pendingFormsCount: pendingForms,
        };
    }, [allData, slipData]);

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="bg-[#f3f4f6] p-4 h-full space-y-4 overflow-auto">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="No of Students"
                    value={counters.students}
                    note="Student Records"
                    to="/guidance/student-records"
                />
                <StatCard
                    title="No of Cases"
                    value={counters.cases}
                    note="Student Cases"
                    to="/guidance/student-cases"
                />
                <StatCard
                    title="Pending Slips"
                    value={counters.pendingSlips}
                    note={`Today: +${counters?.today?.pendingSlips ?? 0}`}
                    to="/guidance/request-slip"
                />
                <StatCard
                    title="Pending Forms"
                    value={counters.pendingForms}
                    note={`Today: +${counters?.today?.pendingForms ?? 0}`}
                    to="/guidance/referral-form"
                />
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column (Main Analytics & Shortcuts) */}
                <div className="lg:col-span-2 space-y-2 flex flex-col">
                    <ViolationFrequency allData={allData} />
                    <RequestTypeFrequency slipData={slipData} />
                    <div className="mt-auto pt-4">
                        <ModuleShortcuts />
                    </div>
                </div>

                {/* Right Column (Secondary Info & Actions) */}
                <div className="lg:col-span-1 space-y-4">
                    <TodoList counters={counters} />
                    <Leaderboard leaderboardData={leaderboardData} schoolYear={schoolYear} />
                    <SummaryReport allData={allData} slipData={slipData} leaderboardData={leaderboardData} />
                </div>
            </div>
        </div>
    );
};

export default App;
