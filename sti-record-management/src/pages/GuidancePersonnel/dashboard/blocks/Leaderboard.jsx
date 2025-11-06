import { useEffect, useState } from "react";
import axios from "axios";

function Leaderboard({ leaderboardData, availableYears = [], onChangeYear }) {
    const [localSchoolYear, setLocalSchoolYear] = useState("");

    // Fetch the official current school year
    useEffect(() => {
        const fetchSchoolYear = async () => {
            try {
                const res = await axios.get("/content/schoolPeriod/get");
                const current = res.data?.schoolYear;

                if (current) {
                    setLocalSchoolYear(current);
                    onChangeYear(current);
                    return;
                }
            } catch (error) {
                console.warn("Failed to fetch current school year, using fallback:", error);
            }

            // Fallback to latest available year if API fails
            if (availableYears.length > 0) {
                const latestYear = [...availableYears].sort((a, b) => {
                    const [startA] = a.split("-").map(Number);
                    const [startB] = b.split("-").map(Number);
                    return startB - startA;
                })[0];
                setLocalSchoolYear(latestYear);
                onChangeYear(latestYear);
            }
        };

        fetchSchoolYear();
    }, [availableYears, onChangeYear]);

    return (
        <div className="col-span-1 md:col-span-1 row-span-1 bg-white rounded-lg border border-gray-300 p-4 shadow-sm flex flex-col min-h-[400px]">
            <h2 className="text-lg font-bold mb-2 text-[#0172bd] flex justify-between items-center">
                <span>Violation Overview</span>
                <select
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                    value={localSchoolYear || ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        setLocalSchoolYear(value);
                        onChangeYear(value);
                    }}
                >
                    {availableYears
                        .sort((a, b) => {
                            const [startA] = a.split("-").map(Number);
                            const [startB] = b.split("-").map(Number);
                            return startB - startA; // newest first
                        })
                        .map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                </select>
            </h2>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-[#0172bd] border-b border-[#757575]">
                            <th className="text-left py-1">NAME</th>
                            <th className="text-center py-1">NO. OF VIOLATIONS</th>
                            <th className="text-right py-1">YEAR/SECTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.length > 0 ? (
                            leaderboardData.map((student) => (
                                <tr key={student.sid}>
                                    <td className="py-2">{student.name}</td>
                                    <td className="text-center">{student.violations}</td>
                                    <td className="text-right">{student.section}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center text-gray-400 py-4">
                                    No violation data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Leaderboard;
