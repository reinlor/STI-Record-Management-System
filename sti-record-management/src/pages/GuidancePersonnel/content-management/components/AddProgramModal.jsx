import { X, Check } from "lucide-react";

export default function AddProgramModal({
  isOpen,
  modalType,
  setIsOpen,
  newItem,
  setNewItem,
  handleModalSubmit,
  isEditing = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#0172bd]">
            {isEditing
              ? `Edit ${modalType === "SHS" ? "Strand" : "Program"}`
              : `Add New ${modalType === "SHS" ? "Strand" : "Program"}`}
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleModalSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program/Strand
              </label>
              <input
                type="text"
                required
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            {/* Acronym */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Acronym
              </label>
              <input
                type="text"
                required
                value={newItem.acronym}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    acronym: e.target.value.toUpperCase(),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
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
              <span>{isEditing ? "Save Changes" : "Add"}</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
