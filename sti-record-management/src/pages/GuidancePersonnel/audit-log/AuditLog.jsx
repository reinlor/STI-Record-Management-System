// AuditLog.jsx
import { useState } from "react";
import List from "./List";
import SearchBar from "./SearchBar";
import { History } from "lucide-react";

export default function AuditLog() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="h-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 md:p-6 lg:p-8">
                    <h1 className="flex items-center gap-3 mb-6">
                        <History className="h-10 w-10 text-[#0172bd]" />
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0172bd] mb-2">Audit Log</p>
                    </h1>
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                    />
                    <List searchTerm={searchTerm} sortOrder={sortOrder} />
                </div>
            </div>
        </div>
    );
}