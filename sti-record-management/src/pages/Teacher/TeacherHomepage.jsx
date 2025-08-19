import React, { useState, useEffect, useContext } from "react";
import TeacherCard from "./modules/TeacherCard";
import TeacherTopbar from "./modules/TeacherTopbar";
import SubmitReferralForm from "./content/SubmitReferral";
import ViewRequest from "./content/ViewRequest";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";

function TeacherHomepage() {
    const { authData, logout } = useContext(AuthContext);
    const [selected, setSelected] = useState(null);
    const [showSidebar, setShowSideBar] = useState(false);
    const [teacherData, setTeacherData] = useState(null);
    const [referralData, setReferralData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleCancel = () => {
        setSelected(null);
        setShowSideBar(false);
    };

    const fetchReferral = async (teacherID) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`/referral/get/employee/${teacherID}`);
            setReferralData(res.data);
        } catch (error) {
            console.error("Error fetching referral data:", error);
            setReferralData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchData = async (teacherID) => {
        try {
            const res = await axios.get(`/user/get/${teacherID}`);
            setTeacherData(res.data);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
            setTeacherData({});
        }
    };

    useEffect(() => {
        if (!authData) {
            console.log("Auth data not ready yet:", authData);
            return;
        }

        const teacherID = authData.user?.uid;
        console.log("Mounted teacher ID: ", authData.uid);

        fetchData(teacherID);
        fetchReferral(teacherID);
    }, [authData]);

    return (
        <div className="min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
            <TeacherTopbar onLogout ={logout}/>
            <div className="flex pt-8">
                {showSidebar && (
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
                )}

                <div className="flex-1 flex justify-center items-start">
                    <div className={`transition-all duration-500 ease-in-out w-full max-w-5xl`}>
                        {selected === "submit" && teacherData && (
                            <div className="animate-fade-in">
                                <SubmitReferralForm
                                    teacher={teacherData}
                                    onCancel={handleCancel}
                                    onSuccess={fetchReferral}
                                />
                            </div>
                        )}
                        {selected === "view" && (
                            <div className="animate-fade-in">
                                <ViewRequest
                                    referralData={referralData}
                                    isLoading={isLoading}
                                    onCancel={handleCancel}
                                />
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
                                            setShowSideBar(true);
                                        }}
                                    />
                                    <TeacherCard
                                        goto="view"
                                        text="View Request History"
                                        selected={false}
                                        onClick={() => {
                                            setSelected("view");
                                            setShowSideBar(true);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
