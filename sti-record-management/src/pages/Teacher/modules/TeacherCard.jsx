import React from "react";

function TeacherCard({ goto = "", text = "", selected = false, onClick }) {
  // Choose icon based on card type
  const icon =
    goto === "submit" ? (
      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" />
        <path d="M7 8h10M7 12h10M7 16h4" stroke="currentColor" />
      </svg>
    ) : (
      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
        <path d="M12 6v6l4 2" stroke="currentColor" />
      </svg>
    );

  return (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-4 bg-white rounded-xl shadow transition-all duration-300
        ${selected ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"}
        text-lg font-medium cursor-pointer`}
      style={{ minWidth: "240px" }}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

export default TeacherCard;