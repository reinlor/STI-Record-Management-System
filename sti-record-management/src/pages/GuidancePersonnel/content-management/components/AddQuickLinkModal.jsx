import React from "react";
import { X, Check } from "lucide-react";

export default function AddQuickLinkModal({
  isOpen,
  setIsOpen,
  newQuickLink,
  setNewQuickLink,
  handleQuickLinkUpload,
}) {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#0172bd]">Add New Quick Link</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleQuickLinkUpload}>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={newQuickLink.title}
                onChange={(e) => setNewQuickLink({ ...newQuickLink, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="e.g., Student Handbook"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">PDF File</label>
              <label className="block w-full cursor-pointer bg-gray-100 text-gray-700 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#0172bd] transition p-6 text-center">
                <span className="font-semibold">
                  {newQuickLink.file ? newQuickLink.file.name : "Choose PDF File"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setNewQuickLink({ ...newQuickLink, file: e.target.files[0] })
                  }
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#dc3545] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out cursor-pointer"
            >
              <span>Cancel</span>
              <X className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[#28a745] text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition duration-150 ease-in-out cursor-pointer"
            >
              <span>Upload</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
