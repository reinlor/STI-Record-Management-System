import { fieldDefinitions } from "./StudentUtils.jsx";

const InfoSection = ({ infoType, student = {}, isEditing, onFieldChange }) => {
    const fieldsToDisplay = fieldDefinitions[infoType] || [];

    // helpers for array fields
    const handleArrayChangeAtIndex = (fieldKey, index, newValue) => {
        const current = Array.isArray(student[fieldKey]) ? [...student[fieldKey]] : [];
        current[index] = newValue;
        onFieldChange(infoType, fieldKey, current);
    };

    const handleAddArrayItem = (fieldKey) => {
        const current = Array.isArray(student[fieldKey]) ? [...student[fieldKey]] : [];
        current.push("");
        onFieldChange(infoType, fieldKey, current);
    };

    const handleRemoveArrayItem = (fieldKey, index) => {
        const current = Array.isArray(student[fieldKey]) ? [...student[fieldKey]] : [];
        current.splice(index, 1);
        onFieldChange(infoType, fieldKey, current);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0172bd] border-b pb-2 mb-4">
                {
                    {
                        basic: "Basic Information",
                        personal: "Personal Information",
                        contact: "Contact Information",
                        family: "Family Background",
                        educational: "Educational Background",
                        work: "Work Experience (Optional)",
                        interests: "Interests and Recreational Activities",
                        health: "Health",
                        life: "Life Circumstances",
                        violation: "Violation",
                    }[infoType] ?? infoType
                }
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fieldsToDisplay.map((fieldDef) => {
                    const rawVal =
                        student && student[fieldDef.key] !== undefined && student[fieldDef.key] !== null
                            ? student[fieldDef.key]
                            : fieldDef.type === "array"
                                ? []
                                : "N/A";

                    const value = rawVal === "N/A" ? "" : rawVal;
                    const inputId = `${infoType}-${fieldDef.key}`;

                    return (
                        <div key={fieldDef.key} className="flex flex-col">
                            <label htmlFor={inputId} className="text-sm text-gray-600 font-medium mb-1">
                                {fieldDef.label}:
                            </label>

                            {/* Edit Mode */}
                            {isEditing ? (
                                fieldDef.type === "textarea" ? (
                                    <textarea
                                        id={inputId}
                                        value={String(value)}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        rows={fieldDef.multiline ? 4 : 2}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        readOnly={!!fieldDef.readOnly}
                                    />
                                ) : fieldDef.type === "array" ? (
                                    <div>
                                        {Array.isArray(value) && value.length > 0 ? (
                                            value.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 mb-2">
                                                    <input
                                                        id={`${inputId}-${i}`}
                                                        type="text"
                                                        value={item ?? ""}
                                                        onChange={(e) => handleArrayChangeAtIndex(fieldDef.key, i, e.target.value)}
                                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                                                        onClick={() => handleRemoveArrayItem(fieldDef.key, i)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500 mb-2">No items yet</div>
                                        )}

                                        <div>
                                            <button
                                                type="button"
                                                className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
                                                onClick={() => handleAddArrayItem(fieldDef.key)}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                ) : fieldDef.type === "radio" ? (
                                    // render radio options as a select for simplicity and consistent editing
                                    <select
                                        id={inputId}
                                        value={value ?? ""}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!!fieldDef.readOnly}
                                    >
                                        <option value="">Select</option>
                                        {(fieldDef.options || []).map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    // normal single-line input (text / date / tel / email)
                                    <input
                                        id={inputId}
                                        type={fieldDef.type === "date" ? "date" : fieldDef.type}
                                        value={value ?? ""}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        readOnly={!!fieldDef.readOnly}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )
                            ) : (
                                // READ-ONLY DISPLAY
                                fieldDef.type === "array" ? (
                                    Array.isArray(value) && value.length > 0 ? (
                                        <ul className="list-disc list-inside text-lg font-semibold text-gray-900 space-y-1">
                                            {value.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-lg font-semibold text-gray-900">N/A</span>
                                    )
                                ) : (
                                    <span className="text-lg font-semibold text-gray-900 break-words">
                                        {value === "" ? "N/A" : String(value)}
                                    </span>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InfoSection;
