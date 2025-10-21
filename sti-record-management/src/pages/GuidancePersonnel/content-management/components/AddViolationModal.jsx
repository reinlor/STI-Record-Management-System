import React, { useState, useEffect } from "react";
import { X, Check, Plus } from "lucide-react";

export default function AddViolationModal({
  isOpen,
  setIsOpen,
  newViolation,
  setNewViolation,
  onSave, 
  isEditing = false,
  offenses = [],
}) {
  const [itemInput, setItemInput] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setItemInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addItem = () => {
    const val = (itemInput || "").trim();
    if (!val) return;
    const next = { ...(newViolation || {}), violations: [...(newViolation.violations || []), val] };
    setNewViolation(next);
    setItemInput("");
  };

  const removeItem = (index) => {
    const confirmDel = window.confirm("Remove this violation item?");
    if (!confirmDel) return;
    const updated = (newViolation.violations || []).filter((_, i) => i !== index);
    setNewViolation({ ...newViolation, violations: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newViolation.category || !newViolation.priority) {
      alert("Please provide category name and priority.");
      return;
    }
    if (!newViolation.violations || newViolation.violations.length === 0) {
      const ok = window.confirm("No violation items added. Do you want to continue?");
      if (!ok) return;
    }
    await onSave(newViolation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40">
      <div 
        className="bg-white p-6 rounded-none sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:w-auto sm:max-w-lg transform transition-all scale-100 ease-out duration-300 sm:max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#0172bd]">
            {isEditing ? "Edit Violation Category" : "Add New Violation"}
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Violation Category Name</label>
              <input
                type="text"
                required
                value={newViolation.category}
                onChange={(e) => setNewViolation({ ...newViolation, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            {/* Offense */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Offense</label>
              <select
                required
                value={newViolation.offense || ""}
                onChange={(e) => setNewViolation({ ...newViolation, offense: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">-- Select offense --</option>
                {offenses.map((offenseName, idx) => (
                  <option key={idx} value={offenseName}>
                    {offenseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority Level (1-3, 3 is highest)</label>
              <select
                required
                value={newViolation.priority}
                onChange={(e) => setNewViolation({ ...newViolation, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>

            {/* Add violation items */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Add Violation Item</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  placeholder="e.g. Skipping class"
                  className="flex-1 rounded-md border-gray-300 p-2 shadow-sm"
                />
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-2 bg-[#0172bd] text-white rounded-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* List */}
              <div className="mt-3 max-h-32 overflow-y-auto custom-scrollbar">
                {(newViolation.violations || []).length > 0 ? (
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {newViolation.violations.map((it, idx) => (
                      <li key={idx} className="flex justify-between items-center gap-2 mb-1">
                        <span>{it}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-sm text-red-500 underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No items added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#dc3545] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
            >
              <span>Cancel</span>
              <X className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[#28a745] text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition duration-150 ease-in-out"
            >
              <span>{isEditing ? "Save changes" : "Add"}</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}