// components/WellnessCardModal.jsx
import { useState, useEffect } from "react";

function WellnessCardModal({
    display,
    onClose,
    isAdd,
    name,
    description,
    onCreate,
    onDelete,
    onRelease,
    onModify,
    surveys = {},
    loading = false,
}) {
    const [localName, setLocalName] = useState(name || "");
    const [localDesc, setLocalDesc] = useState(description || "");
    const [isReleasedState, setIsReleasedState] = useState(false);

    useEffect(() => {
        setLocalName(name || "");
        setLocalDesc(description || "");
        if (name && surveys[name]) {
            setIsReleasedState(!!surveys[name].isReleased);
        } else {
            setIsReleasedState(false);
        }
    }, [display, name, description, surveys]);

    if (!display) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                    ✕
                </button>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isAdd) {
                            onCreate && onCreate(localName.trim(), localDesc.trim());
                        }
                    }}
                >
                    {/* Survey Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Survey name:</label>
                        {!isAdd ? (
                            <p className="mt-1 text-gray-900">{localName}</p>
                        ) : (
                            <input
                                type="text"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter survey name"
                            />
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description:</label>
                        {!isAdd ? (
                            <p className="mt-1 text-gray-900">{localDesc}</p>
                        ) : (
                            <input
                                type="text"
                                value={localDesc}
                                onChange={(e) => setLocalDesc(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter description"
                            />
                        )}
                    </div>

                    {/* Buttons */}
                    {isAdd ? (
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !localName}
                                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                            >
                                {loading ? "Creating..." : "Create"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => onDelete && onDelete(localName)}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Delete
                            </button>

                            <button
                                type="button"
                                onClick={() => onRelease && onRelease(localName, isReleasedState)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg ${isReleasedState ? "bg-red-500" : "bg-green-500"} text-white hover:opacity-90 transition`}
                            >
                                {loading ? "Processing..." : isReleasedState ? "Disable" : "Release"}
                            </button>

                            <button
                                type="button"
                                onClick={() => onModify && onModify(localName, { description: localDesc })}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition"
                            >
                                Modify
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default WellnessCardModal;
