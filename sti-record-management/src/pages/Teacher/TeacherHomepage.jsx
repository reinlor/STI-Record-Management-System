import React, { useState } from "react";
import TeacherCard from "./modules/TeacherCard";
import TeacherTopbar from "./modules/TeacherTopbar";
import SubmitReferralForm from "./content/SubmitReferral";
import ViewRequest from "./content/ViewRequest";

function TeacherHomepage() {
    const [selected, setSelected] = useState(null);
    const [showSidebar, setShowSideBar] = useState(false);
    const sideBar = () => {
        if (showSidebar) {
            return (
                <div className="flex flex-col gap-6 ml-8">
                    <TeacherCard
                        goto="submit"
                        text="Submit Referral Form"
                        selected={selected === "submit"}
                        onClick={() => setSelected("submit")}
                    />
                    <TeacherCard
                        goto="view"
                        text="View Request History"
                        selected={selected === "view"}
                        onClick={() => setSelected("view")}
                    />
                </div>
            )
        }
    }

    return (
        <div className="min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
            <TeacherTopbar />
            <div className="flex pt-8">
                {/* Sidebar */}
                {sideBar()}
                {/* Animated Content Panel */}
                <div className="flex-1 flex justify-center items-start">
                    <div
                        className={`transition-all duration-500 ease-in-out w-full max-w-5xl`}
                    >
                        {selected === "submit" && (
                            <div className="animate-fade-in">
                                <SubmitReferralForm />
                            </div>
                        )}
                        {selected === "view" && (
                            <div className="animate-fade-in">
                                <ViewRequest />
                            </div>
                        )}
                        {!selected && (
                            <div className="flex justify-center items-center h-[500px]">
                                <div className="flex gap-8">
                                    <TeacherCard
                                        goto="submit"
                                        text="Submit Referral Form"
                                        selected={false}
                                        onClick={() => {
                                            setSelected("submit");
                                            setShowSideBar(true)
                                        }}
                                    />
                                    <TeacherCard
                                        goto="view"
                                        text="View Request History"
                                        selected={false}
                                        onClick={() => {
                                            setSelected("submit");
                                            setShowSideBar(true)
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Tailwind animation utility */}
            <style>
                {`
          .animate-fade-in {
            animation: fadeIn 0.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
            </style>
        </div>
    );
}

export default TeacherHomepage;
