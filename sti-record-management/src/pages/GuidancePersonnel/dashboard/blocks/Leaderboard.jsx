function Leaderboard({ leaderboardData }) {
    return (
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
    )
}

export default Leaderboard;
