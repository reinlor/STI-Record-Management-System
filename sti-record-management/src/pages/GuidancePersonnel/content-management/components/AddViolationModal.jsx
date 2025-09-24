import React from "react";
import { X, Check } from "lucide-react";

export default function AddViolationModal({
  isOpen,
  setIsOpen,
  newViolation,
  setNewViolation,
  handleViolationModalSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-2xl h-78 w-full max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#0172bd]">Add New Violation</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleViolationModalSubmit}>
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

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority Level (1-3, 3 is highest)
              </label>
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
              <span>Add</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
