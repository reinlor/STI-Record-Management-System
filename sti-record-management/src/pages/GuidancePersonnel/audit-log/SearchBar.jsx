// SearchBar.jsx
import { ArrowDown, ArrowUp } from "lucide-react";

export default function SearchBar({ searchTerm, setSearchTerm, sortOrder, setSortOrder }) {
    const toggleSort = () => {
        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    };

    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-grow w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by name or employee ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0172bd] focus:border-[#0172bd] transition-all duration-200 ease-in-out placeholder-gray-400 bg-gray-50/50"
                    />
                </div>
                <button
                    onClick={toggleSort}
                    className="flex items-center justify-between w-full sm:w-auto px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0172bd] focus:border-[#0172bd] transition-all duration-200 ease-in-out"
                >
                    {sortOrder === "desc" ? (
                        <>
                            <ArrowDown className="w-4 h-4 mr-2 text-gray-500" />
                            Latest to Oldest
                        </>
                    ) : (
                        <>
                            <ArrowUp className="w-4 h-4 mr-2 text-gray-500" />
                            Oldest to Latest
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}