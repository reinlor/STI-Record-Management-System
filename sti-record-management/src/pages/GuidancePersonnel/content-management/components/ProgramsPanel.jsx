import { GraduationCap, Building, Plus, Edit2, Trash2 } from "lucide-react";

export default function ProgramsPanel({
  tertiaryPrograms,
  shsStrands,
  handleAddProgram,
  onEditProgram,
  onDeleteProgram,
}) {
  const renderProgramList = (list, type) => (
    <div className="flex flex-col space-y-2 h-full overflow-y-auto custom-scrollbar">
      {list.length > 0 ? (
        list.map((item, index) => (
          <div key={index} className="p-2 bg-gray-100 rounded-lg shadow-sm flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-800">{item.acronym}</p>
              <p className="text-sm text-gray-600">{item.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditProgram(item, type)}
                className="px-3 py-1 rounded-lg bg-white border hover:bg-gray-50 flex items-center gap-2"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Edit</span>
              </button>
              <button
                onClick={() => onDeleteProgram(item, type)}
                className="px-3 py-1 rounded-lg bg-white border hover:bg-gray-50 flex items-center gap-2"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="hidden md:inline text-sm text-red-500">Delete</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No items added yet.</p>
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row gap-4 h-full">

        {/* Tertiary Programs */}
        <div className="flex-1 flex flex-col bg-gray-50 rounded-xl shadow-md p-4 h-full">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-[#0172bd]">Tertiary Programs</h2>
            <GraduationCap className="w-6 h-6 text-[#0172bd]" />
          </div>
          <div className="flex-1">{renderProgramList(tertiaryPrograms, "Tertiary")}</div>
          <button
            onClick={() => handleAddProgram("Tertiary")}
            className="mt-4 px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Add Program</span>
          </button>
        </div>

        {/* SHS Strands */}
        <div className="flex-1 flex flex-col bg-gray-50 rounded-xl shadow-md p-4 h-full">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-[#0172bd]">SHS Strands</h2>
            <Building className="w-6 h-6 text-[#0172bd]" />
          </div>
          <div className="flex-1">{renderProgramList(shsStrands, "SHS")}</div>
          <button
            onClick={() => handleAddProgram("SHS")}
            className="mt-4 px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Add Strand</span>
          </button>
        </div>
      </div>
    </div>
  );
}