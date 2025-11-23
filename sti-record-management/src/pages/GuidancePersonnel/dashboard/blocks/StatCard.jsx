import { useNavigate } from "react-router-dom";
import { AlertCircle, TrendingUp } from "lucide-react";

function StatCard({ title, value, note, to, urgency = "normal", todayCount = 0 }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
    };

    // Color coding based on urgency
    const getUrgencyStyles = () => {
        switch (urgency) {
            case "critical": // 21+ items
                return {
                    bg: "bg-red-50",
                    border: "border-red-400",
                    titleColor: "text-red-700",
                    valueColor: "text-red-600",
                    badgeBg: "bg-red-100",
                    badgeText: "text-red-800",
                    icon: "text-red-500"
                };
            case "high": // 13-20 items
                return {
                    bg: "bg-orange-50",
                    border: "border-orange-400",
                    titleColor: "text-orange-700",
                    valueColor: "text-orange-600",
                    badgeBg: "bg-orange-100",
                    badgeText: "text-orange-800",
                    icon: "text-orange-500"
                };
            case "warning": // 6-12 items
                return {
                    bg: "bg-yellow-50",
                    border: "border-yellow-400",
                    titleColor: "text-yellow-700",
                    valueColor: "text-yellow-600",
                    badgeBg: "bg-yellow-100",
                    badgeText: "text-yellow-800",
                    icon: "text-yellow-500"
                };
            case "normal": // 1-5 items
                return {
                    bg: "bg-green-50",
                    border: "border-green-400",
                    titleColor: "text-green-700",
                    valueColor: "text-green-600",
                    badgeBg: "bg-green-100",
                    badgeText: "text-green-800",
                    icon: "text-green-500"
                };
            default: // 0 items (empty)
                return {
                    bg: "bg-white",
                    border: "border-gray-200",
                    titleColor: "text-gray-600",
                    valueColor: "text-gray-800",
                    badgeBg: "bg-gray-100",
                    badgeText: "text-gray-700",
                    icon: "text-gray-400"
                };
        }
    };

    const styles = getUrgencyStyles();

    return (
        <div
            onClick={handleClick}
            className={`${styles.bg} rounded-lg border-2 ${styles.border} p-4 shadow-sm flex flex-col justify-between items-start h-32 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
        >
            <div className="w-full flex items-start justify-between">
                <div className="flex-1">
                    <div className={`text-xs font-semibold ${styles.titleColor}`}>{title}</div>
                    <div className={`text-3xl font-bold ${styles.valueColor} mt-2`}>{value ?? 0}</div>
                </div>
                {urgency !== "empty" && value > 0 && (
                    <AlertCircle className={`${styles.icon} w-6 h-6 flex-shrink-0 ml-2`} />
                )}
            </div>

            <div className="w-full flex items-center justify-between mt-2">
                {note && (
                    <div className={`text-xs font-medium ${styles.badgeText} ${styles.badgeBg} px-2 py-1 rounded`}>
                        {note}
                    </div>
                )}
                {todayCount > 0 && (
                    <div className="ml-auto flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        +{todayCount} today
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatCard;