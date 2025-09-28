export default function ViolationPanel({
    rawStudent = {},
    isEditing = false,
    updateEditedStudent,
    replaceEditedStudentViolations,
}) {
    const violations = rawStudent?.violations || {};
    const keys = Object.keys(violations);

    const handleDegreeChange = (key, value) =>
        updateEditedStudent?.(`violations.${key}.degree`, value);

    const handleSanctionChange = (key, value) =>
        updateEditedStudent?.(`violations.${key}.sanction`, value);

    const handleAdd = () => {
        // Create a unique key for new violation
        const newKey = `Custom Violation ${new Date().getTime()}`;
        const newViolations = {
            ...violations,
            [newKey]: { degree: "", sanction: "" },
        };
        replaceEditedStudentViolations?.(newViolations);
    };

    const handleDelete = (key) => {
        const next = { ...violations };
        delete next[key];
        replaceEditedStudentViolations?.(next);
    };

    return (
        <div className="mt-3 w-full">
            {keys.length === 0 && (
                <div className="text-sm text-gray-500">No violations recorded.</div>
            )}

            <div className="grid gap-3">
                {keys.map((k) => {
                    const v = violations[k] || {};
                    const degree = v.degree || "";
                    const sanction = v.sanction || "";

                    return (
                        <div
                            key={k}
                            className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-2"
                        >
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <div className="font-semibold text-[#0172bd] truncate">{k}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="text-sm">{degree || "N/A"}</span>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(k)}
                                            className="px-2 py-1 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                            title="Remove violation"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">
                                            Degree
                                        </label>
                                        <input
                                            className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm"
                                            value={degree}
                                            onChange={(e) => handleDegreeChange(k, e.target.value)}
                                            placeholder="e.g. First Offense / Second Offense / Committed"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">
                                            Sanction
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm resize-y"
                                            value={sanction}
                                            onChange={(e) => handleSanctionChange(k, e.target.value)}
                                            placeholder="Describe the sanction (if any)"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs font-semibold text-gray-600">Degree</div>
                                        <div className="mt-1 text-sm text-gray-700">{degree || "N/A"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-600">Sanction</div>
                                        <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                                            {sanction || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isEditing && (
                <div className="mt-3">
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-lg font-semibold bg-[#0172bd] text-white hover:bg-blue-600"
                    >
                        + Add Violation
                    </button>
                </div>
            )}
        </div>
    );
}
