import React from "react";
import { CalendarDays } from "lucide-react";

export default function SchoolYearPanel({
  tempSchoolYearData,
  setTempSchoolYearData,
  schoolYearData,
  handleSetSchoolYear,
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#0172bd]">School Year & Academic Period</h2>
        <CalendarDays className="w-6 h-6 text-[#0172bd]" />
      </div>

      {/* Select inputs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* School Year */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select School Year</label>
            <select
              value={tempSchoolYearData.schoolYear}
              onChange={(e) =>
                setTempSchoolYearData({ ...tempSchoolYearData, schoolYear: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
            >
              <option>2024-2025</option>
              <option>2025-2026</option>
              <option>2026-2027</option>
            </select>
          </div>

          {/* College Semester */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">College Semester</label>
            <select
              value={tempSchoolYearData.tertiary}
              onChange={(e) =>
                setTempSchoolYearData({ ...tempSchoolYearData, tertiary: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
            >
              <option>1st Semester</option>
              <option>2nd Semester</option>
            </select>
          </div>

          {/* SHS Quarter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">SHS Quarter</label>
            <select
              value={tempSchoolYearData.seniorHigh}
              onChange={(e) =>
                setTempSchoolYearData({ ...tempSchoolYearData, seniorHigh: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
            >
              <option>1st Quarter</option>
              <option>2nd Quarter</option>
              <option>3rd Quarter</option>
              <option>4th Quarter</option>
            </select>
          </div>
        </div>

        {/* Current Academic Period */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Current Academic Period:</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 p-4 bg-white rounded-lg shadow-sm">
              <h5 className="font-semibold text-gray-800">College</h5>
              <p className="text-xl font-bold text-[#0172bd]">
                {schoolYearData.schoolYear} - {schoolYearData.tertiary}
              </p>
            </div>
            <div className="flex-1 p-4 bg-white rounded-lg shadow-sm">
              <h5 className="font-semibold text-gray-800">SHS</h5>
              <p className="text-xl font-bold text-[#0172bd]">
                {schoolYearData.schoolYear} - {schoolYearData.seniorHigh}
              </p>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleSetSchoolYear}
          className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out"
        >
          Update
        </button>
      </div>
    </div>
  );
}
