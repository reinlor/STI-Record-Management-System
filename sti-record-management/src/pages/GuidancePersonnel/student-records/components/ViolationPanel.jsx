export default function ViolationPanel({
    rawStudent = {},
    isEditing = false,
    updateEditedStudent,
    replaceEditedStudentViolations,
}) {
    const violations = rawStudent?.violations || {};
    const keys = Object.keys(violations);

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

                            </div>

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

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
