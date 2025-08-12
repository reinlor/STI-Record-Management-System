import React from "react";

export default function WellnessCheck() {
    return (
        <div className="animate-fade-in min-h-screen flex flex-col items-center pt-4 font-sans">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Wellness Check</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1 : Redirect to Online Survey */}
                    <div className="bg-gray-50 rounded-lg shadow p-6 flex flex-col justify-between border border-gray-200">
                        <div>
                            <h3 className="text-xl font-bold mb-2">First Survey</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                This is a placeholder description for the first survey.
                                Explain why a user should take this test or what it is about.
                            </p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg mt-auto transition-colors duration-200">
                            Go to Survey
                        </button>
                    </div>

                    {/* Card 2 : Redirect to On-Website Survey */}
                    <div className="bg-gray-50 rounded-lg shadow p-6 flex flex-col justify-between border border-gray-200">
                        <div>
                            <h3 className="text-xl font-bold mb-2">On-Website Survey</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                This is a placeholder description for the on-website survey.
                                Explain why a user should take this test or what it is about.
                            </p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg mt-auto transition-colors duration-200">
                            Start Survey
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
                    .animate-fade-in {
                        animation: fadeIn 0.5s;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
}