import { fieldDefinitions } from './StudentUtils.jsx';

const InfoSection = ({ infoType, student, isEditing, onFieldChange }) => {
    const fieldsToDisplay = fieldDefinitions[infoType] || [];

    const infoTypeTitles = {
        basic: "Basic Information",
        personal: "Personal Information",
        contact: "Contact Information",
        family: "Family Background",
        educational: "Educational Background",
        work: "Work Experience (Optional)",
        interests: "Interests and Recreational Activities",
        health: "Health",
        life: "Life Circumstances",
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0172bd] border-b pb-2 mb-4">
                {infoTypeTitles[infoType]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fieldsToDisplay.map((fieldDef) => {
                    const value =
                        student && student[fieldDef.key] !== undefined && student[fieldDef.key] !== null
                            ? student[fieldDef.key]
                            : 'N/A';
                    const inputId = `${infoType}-${fieldDef.key}`;

                    return (
                        <div key={fieldDef.key} className="flex flex-col">
                            <label htmlFor={inputId} className="text-sm text-gray-600 font-medium mb-1">
                                {fieldDef.label}:
                            </label>

                            {isEditing ? (
                                fieldDef.type === 'textarea' ? (
                                    <textarea
                                        id={inputId}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        rows={fieldDef.multiline ? 3 : 1}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : fieldDef.type === 'radio' ? (
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {fieldDef.options.map((option) => (
                                            <label key={option} className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`${infoType}-${fieldDef.key}`}
                                                    value={option}
                                                    checked={value === option}
                                                    onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                                    className="form-radio text-blue-600 h-4 w-4"
                                                />
                                                <span className="ml-2 text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : fieldDef.type === 'array' ? (
                                    <textarea
                                        id={inputId}
                                        value={Array.isArray(value) ? value.join('\n') : value === 'N/A' ? '' : value}
                                        onChange={(e) =>
                                            onFieldChange(infoType, fieldDef.key, e.target.value.split('\n').map((s) => s.trim()))
                                        }
                                        rows={4}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter each item on a new line"
                                    />
                                ) : (
                                    <input
                                        id={inputId}
                                        type={fieldDef.type}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )
                            ) : fieldDef.type === 'array' ? (
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
                                    {value}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InfoSection;
