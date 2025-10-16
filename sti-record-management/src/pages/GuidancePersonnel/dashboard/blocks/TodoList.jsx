import { useNavigate } from "react-router-dom";
import { ClipboardList, FileEdit, FileText } from "lucide-react";

function TodoList({ counters }) {
    const navigate = useNavigate();

    const todoItems = [
        {
            title: "Pending Request Slips",
            count: counters?.pendingSlips ?? 0,
            to: "/guidance/request-slip",
            icon: <ClipboardList size={20} className="text-blue-600" />,
        },
        {
            title: "Pending Referral Forms",
            count: counters?.pendingForms ?? 0,
            to: "/guidance/referral-form",
            icon: <FileEdit size={20} className="text-green-600" />,
        },
        {
            title: "On-going Student Cases",
            count: counters?.onGoingCases ?? 0,
            to: "/guidance/student-cases",
            icon: <FileText size={20} className="text-red-600" />,
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#0172bd] mb-4">To-do List</h2>
            <div className="space-y-3">
                {todoItems.map((item) => (
                    <div
                        key={item.title}
                        onClick={() => navigate(item.to)}
                        className="group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">{item.icon}</div>
                            <h3 className="font-semibold text-gray-700 text-sm">{item.title}</h3>
                        </div>
                        <span className="font-bold text-gray-800 bg-gray-200 group-hover:bg-gray-300 rounded-full px-2.5 py-0.5 text-sm">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TodoList;