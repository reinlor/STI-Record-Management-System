import { useRef } from "react";
import { fieldDefinitions } from "./StudentUtils.jsx";

// Helper to detect if value is a Cloudinary/URL or array of URLs/objects
const getMedicalCertFiles = (medicalCert) => {
    // Accepts: array of strings (urls), array of {url, id}, or {urls:[], ids:[]}
    if (!medicalCert) return [];
    if (Array.isArray(medicalCert)) {
        // Array of urls or objects
        return medicalCert.map((item, idx) =>
            typeof item === "string"
                ? { url: item, name: `Medical Certificate ${idx + 1}` }
                : item
        );
    }
    if (Array.isArray(medicalCert.urls)) {
        // {urls:[], ids:[]}
        return medicalCert.urls.map((url, idx) => ({
            url,
            id: Array.isArray(medicalCert.ids) ? medicalCert.ids[idx] : undefined,
            name: `Medical Certificate ${idx + 1}`,
        }));
    }
    return [];
};

// Helper to extract filename from URL
const getFilenameFromUrl = (url) => {
    try {
        // Try to extract after last slash, before query/hash
        const cleanUrl = url.split("?")[0].split("#")[0];
        return decodeURIComponent(cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1));
    } catch {
        return "Medical Certificate";
    }
};

const InfoSection = ({ infoType, student = {}, isEditing, onFieldChange }) => {
    const fieldsToDisplay = fieldDefinitions[infoType] || [];

    // File input ref for medical cert upload
    const fileInputRef = useRef();

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

    // --- Custom Hospitalization/Reason Renderer ---
    const renderHospitalizationRecords = () => {
        const hospitalized = Array.isArray(student.hospitalized) ? student.hospitalized : [];
        const reason = Array.isArray(student.reason) ? student.reason : [];

        if (isEditing) {
            return (
                <div className="col-span-2">
                    <label className="font-semibold text-gray-800 text-base mb-2 block">
                        Hospitalization Records
                    </label>
                    <div className="flex flex-col gap-2">
                        {hospitalized.length === 0 && (
                            <div className="text-gray-400 italic p-4 text-center bg-white rounded-xl border border-gray-200">
                                Click '+ Add Entry' to begin.
                            </div>
                        )}
                        {hospitalized.map((event, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-3 mb-1">
                                <input
                                    type="text"
                                    value={event}
                                    onChange={e => {
                                        const next = [...hospitalized];
                                        next[idx] = e.target.value;
                                        onFieldChange("health", "hospitalized", next);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                    placeholder="Event/Condition (e.g., Broken Leg)"
                                />
                                <input
                                    type="text"
                                    value={reason[idx] || ""}
                                    onChange={e => {
                                        const next = [...reason];
                                        next[idx] = e.target.value;
                                        onFieldChange("health", "reason", next);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Reason (e.g., Bike Accident)"
                                />
                                <button
                                    type="button"
                                    className="text-red-500 hover:text-red-700 text-sm mt-2"
                                    onClick={() => {
                                        const nextHosp = [...hospitalized];
                                        const nextReason = [...reason];
                                        nextHosp.splice(idx, 1);
                                        nextReason.splice(idx, 1);
                                        onFieldChange("health", "hospitalized", nextHosp);
                                        onFieldChange("health", "reason", nextReason);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="mt-2 px-3 py-1 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200 w-fit"
                            onClick={() => {
                                onFieldChange("health", "hospitalized", [...hospitalized, ""]);
                                onFieldChange("health", "reason", [...reason, ""]);
                            }}
                        >
                            + Add Entry
                        </button>
                    </div>
                </div>
            );
        }

        // --- VIEW MODE: Show as paired cards ---
        return (
            <div className="col-span-2">
                <label className="font-semibold text-gray-800 text-base mb-2 block">
                    Hospitalization Records
                </label>
                {hospitalized.length === 0 && reason.length === 0 ? (
                    <div className="text-gray-400 italic">No hospitalization records.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hospitalized.map((event, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="font-bold text-gray-900">{event || "N/A"}</div>
                                <div className="text-gray-700 text-sm">{reason[idx] || "N/A"}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Special handler for medicalCert removal (for admin)
    const handleRemoveMedicalCert = (index) => {
        const files = getMedicalCertFiles(student.medicalCert);
        const newCerts = [...files];
        newCerts.splice(index, 1);
        onFieldChange("health", "medicalCert", newCerts);
    };

    // Special handler for medicalCert upload (admin)
    const handleMedicalCertUpload = (e) => {
    const files = Array.from(e.target.files);
    const current = getMedicalCertFiles(student.medicalCert);
    const newCerts = [
        ...current,
        ...files.map((file) => ({
            name: file.name,
            file,
            type: file.type,
            url: URL.createObjectURL(file),
        })),
    ];
    onFieldChange("health", "medicalCert", newCerts);
    if (fileInputRef.current) fileInputRef.current.value = "";
};

    // Special renderer for medicalCert field
    const renderMedicalCertField = (fieldDef) => {
        const files = getMedicalCertFiles(student.medicalCert);

        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium mb-1">
                    {fieldDef.label}:
                </label>
                {isEditing ? (
                    <>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                type="button"
                                className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                                + Add
                            </button>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleMedicalCertUpload}
                            />
                        </div>
                        {files.length === 0 && (
                            <span className="text-gray-400 text-sm">No certificates uploaded.</span>
                        )}
                        {files.map((file, idx) => (
                            <div key={file.url || idx} className="flex items-center gap-3 mb-2">
                                {file.url && file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={file.url}
                                                alt={file.name || `Medical Certificate ${idx + 1}`}
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                        </a>
                                        <span className="text-xs text-gray-700 break-all">
                                            {file.name || getFilenameFromUrl(file.url)}
                                        </span>
                                    </>
                                ) : file.url && file.url.endsWith(".pdf") ? (
                                    <>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 underline"
                                        >
                                            {file.name || getFilenameFromUrl(file.url)} (PDF)
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 underline"
                                        >
                                            {file.name || getFilenameFromUrl(file.url)}
                                        </a>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                                    onClick={() => handleRemoveMedicalCert(idx)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {files.length === 0 && (
                            <span className="text-gray-400 text-sm">No certificates uploaded.</span>
                        )}
                        {files.map((file, idx) => (
                            <div key={file.url || idx} className="flex items-center gap-3 mb-2">
                                {file.url && file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={file.url}
                                                alt={file.name || `Medical Certificate ${idx + 1}`}
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                        </a>
                                        <span className="text-xs text-gray-700 break-all">
                                            {file.name || getFilenameFromUrl(file.url)}
                                        </span>
                                    </>
                                ) : file.url && file.url.endsWith(".pdf") ? (
                                    <>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 underline"
                                        >
                                            {file.name || getFilenameFromUrl(file.url)} (PDF)
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 underline"
                                        >
                                            {file.name || getFilenameFromUrl(file.url)}
                                        </a>
                                    </>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        );
    };

    // --- Last Doctor Visit: only one, editable, no add button ---
    const renderDoctorLastSeenField = (fieldDef) => {
        const value = Array.isArray(student[fieldDef.key]) ? student[fieldDef.key][0] || "" : student[fieldDef.key] || "";
        const inputId = `${infoType}-${fieldDef.key}`;
        return (
            <div className="flex flex-col col-span-2">
                <label htmlFor={inputId} className="text-sm text-gray-600 font-medium mb-1">
                    {fieldDef.label}:
                </label>
                {isEditing ? (
                    <input
                        id={inputId}
                        type="text"
                        value={value}
                        onChange={e => onFieldChange(infoType, fieldDef.key, [e.target.value])}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Date and purpose (e.g., 2024-01-01 - Annual Checkup)"
                    />
                ) : (
                    <span className="text-lg font-semibold text-gray-900 break-words">
                        {value || "N/A"}
                    </span>
                )}
            </div>
        );
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
                {/* Custom hospitalization+reason view for health section */}
                {infoType === "health" && renderHospitalizationRecords()}

                {fieldsToDisplay.map((fieldDef) => {
                    // Skip hospitalized/reason in health section (handled above)
                    if (
                        infoType === "health" &&
                        (fieldDef.key === "hospitalized" || fieldDef.key === "reason")
                    ) {
                        return null;
                    }

                    // Special case for medicalCert
                    if (fieldDef.key === "medicalCert") {
                        return (
                            <div key={fieldDef.key} className="flex flex-col col-span-2">
                                {renderMedicalCertField(fieldDef)}
                            </div>
                        );
                    }

                    // Special case for Last Doctor Visit (no add, only one editable)
                    if (infoType === "health" && fieldDef.key === "doctorLastSeen") {
                        return (
                            <div key={fieldDef.key} className="flex flex-col col-span-2">
                                {renderDoctorLastSeenField(fieldDef)}
                            </div>
                        );
                    }

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
                                            {/* Remove add button for doctorLastSeen */}
                                            {!(infoType === "health" && fieldDef.key === "doctorLastSeen") && (
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
                                                    onClick={() => handleAddArrayItem(fieldDef.key)}
                                                >
                                                    + Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : fieldDef.type === "radio" ? (
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
