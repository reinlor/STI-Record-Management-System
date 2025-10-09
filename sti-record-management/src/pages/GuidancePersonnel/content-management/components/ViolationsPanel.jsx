import React from "react";
import { ShieldAlert, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function ViolationsPanel({
  violations,
  onOpenAddModal,
  onEditCategory,
  onDeleteCategory,
}) {
  const [expanded, setExpanded] = React.useState({});

  const toggleExpand = (key) => {
    setExpanded((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#0172bd]">Violations</h2>
        <ShieldAlert className="w-6 h-6 text-[#0172bd]" />
      </div>

      {/* Add button */}
      <button
        onClick={onOpenAddModal}
        className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2 mb-4"
      >
        <Plus size={18} />
        <span>Add Violation</span>
      </button>

      {/* Violations list */}
      <div className="mt-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-[#0172bd] mb-2">Predefined Violations</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-1">
          {violations && violations.length > 0 ? (
            violations.map((v) => (
              <div key={v.category} className="p-4 bg-white rounded-lg shadow-sm mb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-[#0172bd] text-lg">{v.category}</h4>
                    <p className="text-sm text-gray-600">
                      Offense: <span className="font-medium">{v.offense || "N/A"}</span>{" "}
                      • Priority: <span className="font-medium">{v.priority}</span>
                      {" • "}Items: <span className="font-medium">{(v.violations || []).length}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditCategory(v)}
                      className="px-3 py-1 rounded-lg bg-white border hover:bg-gray-50 flex items-center gap-2"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden md:inline text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteCategory(v)}
                      className="px-3 py-1 rounded-lg bg-white border hover:bg-gray-50 flex items-center gap-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="hidden md:inline text-sm text-red-500">Delete</span>
                    </button>
                    <button
                      onClick={() => toggleExpand(v.category)}
                      className="px-2 py-1 rounded-lg bg-white border hover:bg-gray-50 flex items-center gap-1"
                      title="Toggle items"
                    >
                      {expanded[v.category] ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                </div>

                {expanded[v.category] && (
                  <div className="mt-3">
                    {v.violations && v.violations.length > 0 ? (
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        {v.violations.map((item, idx) => (
                          <li key={idx} className="mb-1">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No violations listed.</p>
                    )}
                  </div>
                )}
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
