import React from 'react';
import { caseFieldDefinitions } from './CaseUtils.jsx';

const CaseInfoSection = ({ infoType, caseData, isEditing, onFieldChange }) => {
    const fieldsToDisplay = caseFieldDefinitions[infoType] || [];

    const infoTypeTitles = {
        caseDetails: "Case Details",
        proof: "Proof",
        actionsTaken: "Actions Taken",
        counselorNotes: "Counselor's Notes",
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                {infoTypeTitles[infoType]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fieldsToDisplay.map((fieldDef) => {
                    const value = caseData && caseData[fieldDef.key] !== undefined ? caseData[fieldDef.key] : 'N/A';
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
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                    />
                                ) : fieldDef.type === 'select' ? (
                                    <select
                                        id={inputId}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out cursor-pointer"
                                    >
                                        {fieldDef.options.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : fieldDef.type === 'file' ? (
                                    <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer relative group">
                                        {value && value !== 'N/A' ? (
                                            <img
                                                src={value}
                                                alt="Proof Preview"
                                                className="max-h-full max-w-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l1.5-1.5a.75.75 0 011.06 0L10.5 20.25m-8.25-4.5h16.5m-4.5 0v4.5m-4.5-4.5V21m12-8.25V1.5m0 0a2.25 2.25 0 00-2.25-2.25h-6A2.25 2.25 0 003 1.5V6" />
                                            </svg>
                                        )}
                                        <input
                                            id={inputId}
                                            name={fieldDef.key}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <span className="absolute bottom-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Upload Image</span>
                                    </div>
                                ) : (
                                    <input
                                        id={inputId}
                                        type={fieldDef.type}
                                        value={value === 'N/A' ? '' : value}
                                        onChange={(e) => onFieldChange(infoType, fieldDef.key, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                    />
                                )
                            ) : (
                                <span className="text-lg font-semibold text-gray-900 break-words">
                                    {fieldDef.type === 'file' && value && value !== 'N/A' ? (
                                        <img
                                            src={value}
                                            alt="Proof"
                                            className="max-h-48 max-w-full rounded-md border border-gray-300"
                                            style={{ marginTop: '8px' }}
                                        />
                                    ) : (
                                        value
                                    )}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CaseInfoSection;