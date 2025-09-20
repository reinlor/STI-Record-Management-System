import { ShieldAlert, Plus } from "lucide-react";

export default function ViolationsPanel({ violations, setIsViolationModalOpen }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#0172bd]">Violations</h2>
        <ShieldAlert className="w-6 h-6 text-[#0172bd]" />
      </div>

      {/* Add button */}
      <button
        onClick={() => setIsViolationModalOpen(true)}
        className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2 mb-4"
      >
        <Plus size={18} />
        <span>Add Violation</span>
      </button>

      {/* Violations list */}
      <div className="mt-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-[#0172bd] mb-2">Predefined Violations</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-1">
          {violations.length > 0 ? (
            violations.map((v) => (
              <div key={v.id} className="p-4 bg-white rounded-lg shadow-sm mb-2">
                <h4 className="font-bold text-[#0172bd]">{v.category}</h4>
                <p className="text-sm text-gray-600">Priority: {v.priority}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No violations defined yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
