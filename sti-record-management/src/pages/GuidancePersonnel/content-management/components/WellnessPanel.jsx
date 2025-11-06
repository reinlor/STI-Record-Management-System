import { Link2 } from "lucide-react";

export default function WellnessPanel({ tempWellnessLink, setTempWellnessLink, handleSetWellnessLink }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#0172bd]">Wellness Program</h2>
        <Link2 className="w-6 h-6 text-[#0172bd]" />
      </div>

      {/* Input */}
      <input
        type="url"
        placeholder="https://linkNgWellnessProgram.com"
        value={tempWellnessLink}
        onChange={(e) => setTempWellnessLink(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
      />

      {/* Submit Button */}
      <button
        onClick={handleSetWellnessLink}
        className="mt-4 px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out self-end cursor-pointer"
      >
        Set
      </button>
    </div>
  );
}
