import { useNavigate } from "react-router-dom";
import { ClipboardList, FileEdit, FileText, AlertCircle, ChevronRight } from "lucide-react";

function TodoList({ counters }) {
    const navigate = useNavigate();

    // 🔹 Determine urgency level based on NEW thresholds
    const getUrgencyLevel = (count) => {
        if (count === 0) return "empty";
        if (count >= 1 && count <= 5) return "normal";
        if (count >= 6 && count <= 12) return "warning";
        if (count >= 13 && count <= 20) return "high";
        if (count >= 21) return "critical";
    };

    const getIconColor = (urgency) => {
        switch (urgency) {
            case "critical":
                return "text-red-600";
            case "high":
                return "text-orange-600";
            case "warning":
                return "text-yellow-600";
            case "normal":
                return "text-green-600";
            default: // empty
                return "text-gray-400";
        }
    };

    const todoItems = [
        {
            title: "On-going Student Cases",
            count: counters?.onGoingCases ?? 0,
            to: "/guidance/student-cases",
            icon: <FileText size={20} />,
            urgency: getUrgencyLevel(counters?.onGoingCases ?? 0),
        },
        {
            title: "Pending Request Slips",
            count: counters?.pendingSlips ?? 0,
            to: "/guidance/request-slip",
            icon: <ClipboardList size={20} />,
            urgency: getUrgencyLevel(counters?.pendingSlips ?? 0),
        },
        {
            title: "Pending Referral Forms",
            count: counters?.pendingForms ?? 0,
            to: "/guidance/referral-form",
            icon: <FileEdit size={20} />,
            urgency: getUrgencyLevel(counters?.pendingForms ?? 0),
        },
    ];

    const getUrgencyBgColor = (urgency) => {
        switch (urgency) {
            case "critical":
                return "bg-red-50 hover:bg-red-100 border-l-4 border-red-500";
            case "high":
                return "bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500";
            case "warning":
                return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500";
            case "normal":
                return "bg-green-50 hover:bg-green-100 border-l-4 border-green-500";
            default: // empty
                return "bg-white hover:bg-gray-50 border-l-4 border-gray-200";
        }
    };

    const getCountBgColor = (urgency) => {
        switch (urgency) {
            case "critical":
                return "bg-red-200 text-red-800";
            case "high":
                return "bg-orange-200 text-orange-800";
            case "warning":
                return "bg-yellow-200 text-yellow-800";
            case "normal":
                return "bg-green-200 text-green-800";
            default: // empty
                return "bg-gray-200 text-gray-800";
        }
    };

    const getUrgencyMessage = (urgency, count) => {
        switch (urgency) {
            case "critical":
                return "🚨 Critical load — immediate attention required";
            case "high":
                return "⚠️ High load — needs attention.";
            case "warning":
                return "⚠️ Growing queue — check soon";
            case "normal":
                return "✓ Normal activity";
            default: // empty
                return "✓ No pending items";
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#0172bd] mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Admin To-do List
            </h2>
            <div className="space-y-2">
                {todoItems.map((item) => (
                    <div
                        key={item.title}
                        onClick={() => navigate(item.to)}
                        className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${getUrgencyBgColor(item.urgency)}`}
                    >
                        <div className="flex items-center space-x-3 flex-1">
                            <div className={`flex-shrink-0 ${getIconColor(item.urgency)}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-700 text-sm">{item.title}</h3>
                                {item.urgency !== "empty" && (
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {getUrgencyMessage(item.urgency, item.count)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`font-bold text-sm rounded-full px-3 py-1 ${getCountBgColor(item.urgency)} group-hover:scale-110 transition-transform`}>
                                {item.count}
                            </span>
                            {(item.urgency === "critical" || item.urgency === "high") && (
                                <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TodoList;