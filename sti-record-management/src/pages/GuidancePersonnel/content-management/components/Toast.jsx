import { Check, X } from "lucide-react";

export default function Toast({ message, type, isVisible, onClose }) {
  if (!isVisible) return null;

  const baseClasses =
    "fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-2 transition-transform transform duration-300";
  const typeClasses = type === "success" ? "bg-green-500 translate-x-0" : "bg-red-500 translate-x-0";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {type === "success" ? <Check size={20} /> : <X size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <X size={20} />
      </button>
    </div>
  );
}
