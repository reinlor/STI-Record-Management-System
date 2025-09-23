function OffenseDisplay({ offenseName, details, onBack }) {
    return (
        <div className="w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200 min-h-screen">
            <button
                onClick={onBack}
                className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
                ← Back to List
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
                {offenseName}
            </h1>

            {details.description && (
                <p className="mb-6 text-gray-700 leading-relaxed text-base sm:text-lg">
                    {details.description}
                </p>
            )}

            {details.descriptionExamples && (
                <ul className="list-disc list-inside mb-6 text-gray-600 space-y-2 text-sm sm:text-base">
                    {details.descriptionExamples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                    ))}
                </ul>
            )}

            <div className="space-y-4">
                {Object.entries(details).map(([key, value]) => {
                    if (key === "description" || key === "descriptionExamples") return null;

                    return (
                        <div
                            key={key}
                            className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                        >
                            <span className="font-semibold text-gray-800">{key}: </span>
                            <span className="text-gray-700">{value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OffenseDisplay;
