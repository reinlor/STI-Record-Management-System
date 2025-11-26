import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";
import LoadingDots from "../../../component/Loading.jsx";

export default function List({ searchTerm, sortOrder }) {
    const [auditList, setAuditList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        setIsLoading(true);

        const unsubscribe = onSnapshot(
            collection(db, "auditLog"),
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAuditList(list);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching audit log:", error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortOrder]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "-";

        if (typeof timestamp === "object" && timestamp !== null) {
            const secs = timestamp.seconds || timestamp._seconds;
            const nano = timestamp.nanoseconds || timestamp._nanoseconds || 0;

            if (typeof secs === "number") {
                const ms = secs * 1000 + nano / 1000000;
                return new Date(ms).toLocaleString("en-US", {
                    timeZone: "Asia/Manila",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                });
            }

            if (timestamp instanceof Date) {
                return timestamp.toLocaleString("en-US", {
                    timeZone: "Asia/Manila",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                });
            }
        }

        if (typeof timestamp === "string") return timestamp;

        return "-";
    };

    let filteredList = auditList;
    if (searchTerm) {
        filteredList = auditList.filter(
            (item) =>
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.employeeID && item.employeeID.toString().toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    const sortedList = [...filteredList].sort((a, b) => {
        const dateA = a.date ? a.date.seconds || 0 : 0;
        const dateB = b.date ? b.date.seconds || 0 : 0;
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const totalRows = sortedList.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    if (isLoading) {
        return <LoadingDots />;
    }

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = sortedList.slice(indexOfFirst, indexOfLast);

    return (
        <div className="overflow-hidden rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#0172bd] text-white">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                            <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Employee ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Action</th>
                            <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentRows.length > 0 ? (
                            currentRows.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`transition-colors duration-150 hover:bg-gray-100 cursor-pointer ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.name || "-"}
                                    </td>
                                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.employeeID || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-[150px]">
                                        {item.role || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 break-words">
                                        {item.action || "-"}
                                    </td>
                                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(item.date)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No audit logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center lg:justify-end items-center mt-4 px-4 pb-4">
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#0172bd] hover:bg-gray-50'
                        } border border-gray-300`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                currentPage === i + 1
                                    ? 'bg-[#0172bd] text-white'
                                    : 'bg-white text-[#0172bd] hover:bg-gray-50'
                            } border border-gray-300`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#0172bd] hover:bg-gray-50'
                        } border border-gray-300`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </nav>
            </div>
        </div>
    );
}