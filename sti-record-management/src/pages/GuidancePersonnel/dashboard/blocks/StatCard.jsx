import { useNavigate } from "react-router-dom";

function StatCard({ title, value, note, to }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col justify-center items-start h-24 cursor-pointer hover:shadow-md transition"
        >
            <div className="text-xs text-gray-500">{title}</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{value ?? 0}</div>
            {note && <div className="text-xs text-[#0172bd] mt-1">{note}</div>}
        </div>
    );
}

export default StatCard