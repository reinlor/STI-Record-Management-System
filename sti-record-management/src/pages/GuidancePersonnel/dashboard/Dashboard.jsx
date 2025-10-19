// Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { db } from "../../../firebaseClient.js";

import StatCard from "./blocks/StatCard";
import ViolationFrequency from "./blocks/ViolationFrequency";
import RequestTypeFrequency from "./blocks/RequestTypeFrequency";
import Leaderboard from "./blocks/Leaderboard";
import Loading from "../../../component/Loading";
import SummaryReport from "./blocks/SummaryReport";
import ModuleShortcuts from "./blocks/ModuleShortcuts";
import TodoList from "./blocks/TodoList";

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allData, setAllData] = useState([]);
    const [slipData, setSlipData] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [schoolYear, setSchoolYear] = useState("");
    const [availableYears, setAvailableYears] = useState([]);
    const [counters, setCounters] = useState({
        students: 0,
        cases: 0,
        pendingSlips: 0,
        pendingForms: 0,
        today: {
            pendingSlips: 0,
            pendingForms: 0,
        },
    });

    // 🔹 Listen to chartData collection (studentCase + slip-n-pass)
    useEffect(() => {
        setIsLoading(true);

        const unsub = onSnapshot(collection(db, "chartData"), (snapshot) => {
            snapshot.docs.forEach((doc) => {
                const id = doc.id;
                const docData = doc.data();

                if (id === "studentCase" && Array.isArray(docData.data)) {
                    const fetched = docData.data;
                    setAllData(fetched);

                    // collect unique school years dynamically
                    const years = [...new Set(fetched.map((d) => d.schoolYear).filter(Boolean))];
                    setAvailableYears(years);
                    if (!schoolYear && years.length > 0) setSchoolYear(years[0]);
                }

                if (id === "slip-n-pass" && Array.isArray(docData.data)) {
                    setSlipData(docData.data);
                }
            });

            setIsLoading(false);
        });

        return () => unsub();
    }, []);

    // 🔹 Compute leaderboard dynamically based on school year
    useEffect(() => {
        if (allData.length > 0 && schoolYear) {
            const filtered = allData.filter((entry) => entry.schoolYear === schoolYear);
            const violationCounts = {};

            filtered.forEach(({ sid, name, section }) => {
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

    // 🔹 Listen to counters in realtime
    useEffect(() => {
        // Helper for checking today's date
        const isToday = (timestamp) => {
            if (!timestamp) return false;
            const date =
                timestamp?.toDate?.() ||
                (timestamp._seconds ? new Date(timestamp._seconds * 1000) : null);
            if (!date) return false;
            const today = new Date();
            return (
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()
            );
        };

        // --- Students ---
        const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
            setCounters((prev) => ({ ...prev, students: snap.size }));
        });

        // --- All Cases ---
        const unsubCases = onSnapshot(collection(db, "studentCases"), (snap) => {
            setCounters((prev) => ({ ...prev, cases: snap.size }));
        });

        // --- On-going Cases ---
        const ongoingQuery = query(collection(db, "studentCases"), where("status", "==", "On-going"));
        const unsubOngoing = onSnapshot(ongoingQuery, (ongoingSnap) => {
            setCounters((prev) => ({ ...prev, onGoingCases: ongoingSnap.size }));
        });

        // --- Pending Absent Slips ---
        // --- Pending Absent Slips ---
        const absentQuery = query(collection(db, "absentSlips"), where("status", "==", "Pending"));
        const unsubAbsent = onSnapshot(absentQuery, (absentSnap) => {
            const pendingAbsent = absentSnap.size;
            const todayAbsent = absentSnap.docs.filter((d) => isToday(d.data().timeCreated)).length;

            setCounters((prev) => ({
                ...prev,
                pendingAbsent,
                todayAbsent,
                today: {
                    ...prev.today,
                    pendingSlips: (prev.todayIncident ?? 0) + todayAbsent,
                },
                pendingSlips: pendingAbsent + (prev.pendingIncident ?? 0),
            }));
        });

        // --- Pending Incident Reports ---
        const incidentQuery = query(collection(db, "incidentReport"), where("status", "==", "Pending"));
        const unsubIncident = onSnapshot(incidentQuery, (incidentSnap) => {
            const pendingIncident = incidentSnap.size;
            const todayIncident = incidentSnap.docs.filter((d) => isToday(d.data().timeCreated)).length;

            setCounters((prev) => ({
                ...prev,
                pendingIncident,
                todayIncident,
                today: {
                    ...prev.today,
                    pendingSlips: (prev.todayAbsent ?? 0) + todayIncident,
                },
                pendingSlips: (prev.pendingAbsent ?? 0) + pendingIncident,
            }));
        });


        // --- Pending Referral Forms ---
        const formQuery = query(collection(db, "referralForm"), where("status", "==", "Pending"));
        const unsubForms = onSnapshot(formQuery, (formSnap) => {
            const pendingForms = formSnap.size;
            const todayForms = formSnap.docs.filter((d) => isToday(d.data().preparedDate)).length;
            setCounters((prev) => ({
                ...prev,
                pendingForms,
                today: { ...prev.today, pendingForms: todayForms },
            }));
        });

        // Cleanup
        return () => {
            unsubStudents();
            unsubCases();
            unsubOngoing();
            unsubAbsent();
            unsubIncident();
            unsubForms();
        };
    }, []);


    // 🔹 Derived memoized stats (local)
    const { uniqueStudentsCount, casesCount, pendingSlipsCount, pendingFormsCount } = useMemo(() => {
        const uniqueStudents = new Set(allData.map((e) => e.sid).filter(Boolean));
        return {
            uniqueStudentsCount: uniqueStudents.size,
            casesCount: allData.length,
            pendingSlipsCount: slipData.length,
            pendingFormsCount: counters.pendingForms,
        };
    }, [allData, slipData, counters.pendingForms]);

    if (isLoading) return <Loading />;

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
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-2 flex flex-col">
                    <ViolationFrequency allData={allData} />
                    <RequestTypeFrequency slipData={slipData} />
                    <div className="mt-auto pt-4">
                        <ModuleShortcuts />
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-4">
                    <TodoList counters={counters} />
                    <Leaderboard
                        leaderboardData={leaderboardData}
                        schoolYear={schoolYear}
                        availableYears={availableYears}
                        onChangeYear={setSchoolYear}
                    />
                    <SummaryReport
                        allData={allData}
                        slipData={slipData}
                        leaderboardData={leaderboardData}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
