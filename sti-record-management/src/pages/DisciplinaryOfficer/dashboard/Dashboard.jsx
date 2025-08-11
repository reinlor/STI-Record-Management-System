import Card from '../../../component/Card.jsx';

function Dashboard() {
    return (
        <div className="bg-gray-100 p-2">
                <div className="grid grid-cols-3 grid-rows-2 gap-2 h-210">
                    {/* Violation Frequency (Line Chart) */}
                    <div className="col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col h-full">
                    <h2 className="text-lg font-semibold mb-2">Violation Frequency</h2>
                    {/* Replace below with your chart component */}
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-gray-400">[Line Chart Here]</span>
                        
                    </div>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                        <span className="w-4 h-3 bg-orange-600 inline-block rounded-sm"></span>
                        <span className="text-xs text-gray-700">Absentees</span>
                        </div>
                        <div className="flex items-center gap-1">
                        <span className="w-4 h-3 bg-green-600 inline-block rounded-sm"></span>
                        <span className="text-xs text-gray-700">Improper Uniform</span>
                        </div>
                    </div>
                    </div>

                    {/* Leaderboards */}
                    <div className="col-span-1 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-full">
                    <h2 className="text-lg font-semibold mb-2">Leaderboards</h2>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-xs text-gray-500 border-b">
                            <th className="text-left py-1">NAME</th>
                            <th className="text-center py-1">NO. OF VIOLATIONS</th>
                            <th className="text-right py-1">YEAR/ SECTION</th>
                        </tr>
                        </thead>
                        
                    </table>
                    </div>

                    {/* Request Type Frequency (Pie Chart) */}
                    <div className="col-span-1 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col h-full">
                    <h2 className="text-lg font-semibold mb-2">Request Type Frequency</h2>
                    {/* Replace below with your pie chart component */}
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-gray-400">[Pie Chart Here]</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-2 text-xs">
                        <div className="flex items-center gap-2">
                        <span className="w-4 h-3 bg-cyan-400 inline-block rounded-sm"></span>
                        Absent Slip
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="w-4 h-3 bg-blue-700 inline-block rounded-sm"></span>
                        Late Slip
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="w-4 h-3 bg-orange-500 inline-block rounded-sm"></span>
                        Uniform Pass
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="w-4 h-3 bg-blue-900 inline-block rounded-sm"></span>
                        ID Pass
                        </div>
                    </div>
                    </div>

                    {/* Empty Card (for future content) */}
                    <div className="col-span-2 row-span-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-full"></div>
                </div>
                </div>
    );
}

export default Dashboard;