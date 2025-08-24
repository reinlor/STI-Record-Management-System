import React from "react";

export default function WellnessCheck() {
    return (
        <div className="animate-fade-in min-h-screen flex flex-col items-center pt-6 font-sans bg-gray-100">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-5xl">
                {/* Section Header */}
                <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4">
                    Wellness Check
                </h2>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Card 1: Online Survey */}
                    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">First Survey</h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            This is a placeholder description for the Wellness Check.
                            Explain why a user should take this test or what it is about.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg self-start mt-auto transition-colors duration-200">
                            Go to Survey
                        </button>
                    </div>

                    {/* Card 2: On-Website Survey */}
                    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Personality Test</h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            This is a placeholder description for the Personality Test.
                            Explain why a user should take this test or what it is about.
                        </p>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg self-start mt-auto transition-colors duration-200">
                            Start Test
                        </button>
                    </div>

                </div>
            </div>

            {/* Fade Animation */}
            <style>
                {`
                    .animate-fade-in {
                        animation: fadeIn 0.5s ease-in-out;
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
