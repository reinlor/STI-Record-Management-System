import React, { useState } from "react";
import StudentTopBar from './components/StudentTopbar.jsx';
import StudentCard from './components/StudentCard.jsx';
import ProfileView from './module-content/ProfileView.jsx';
import StudentRequestSlip from './module-content/StudentRequestSlip.jsx'; 
import StudentViewRequest from './module-content/StudentViewRequest.jsx';

import WellnessCheck from './module-content/WellnessCheck.jsx';

export default function StudentHomepage() {
    const [selected, setSelected] = useState(null);

    const handleSelect = (module) => setSelected(module);
    const handleCancel = () => setSelected(null);

    const modules = [
        { id: "profile", text: "Profile" },
        { id: "request", text: "Request Slips" },
        { id: "history", text: "View Request History" },
        { id: "wellness", text: "Wellness Check" },
    ];

    const renderModule = () => {
        switch (selected) {
            case "profile":
                return <ProfileView />;
            case "wellness":
                return <WellnessCheck />;
            case "request":
                return <StudentRequestSlip />;
            case "history":
                return <StudentViewRequest />;
            default:
                return (
                    <div className="animate-fade-in text-center mt-12">
                        <p className="text-gray-600">Module content will appear here.</p>
                        <button
                            onClick={handleCancel}
                            className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            aria-label="Cancel and return to homepage"
                        >
                            Cancel
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
            <StudentTopBar />

            <div className="flex pt-8">
                {/* Sidebar */}
                {selected && (
                    <div className="flex flex-col gap-6 ml-8">
                        {modules.map((mod) => (
                            <StudentCard
                                key={mod.id}
                                goto={mod.id}
                                text={mod.text}
                                selected={selected === mod.id}
                                onClick={() => handleSelect(mod.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex justify-center items-start">
                    <div className="w-full max-w-5xl transition-all duration-500 ease-in-out">
                        {selected ? renderModule() : (
                            <div className="flex justify-center items-center h-[500px]">
                                <div className="flex gap-6 flex-wrap justify-center">
                                    {modules.map((mod) => (
                                        <StudentCard
                                            key={mod.id}
                                            goto={mod.id}
                                            text={mod.text}
                                            selected={false}
                                            onClick={() => handleSelect(mod.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fade-in animation */}
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
