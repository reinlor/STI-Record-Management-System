import React, { useState, useEffect, useContext } from "react";
import TeacherTopbar from "./modules/TeacherTopbar";
import SubmitReferralForm from "./content/SubmitReferral";
import ViewRequest from "./content/ViewRequest";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";

export default function TeacherHomepage() {
    const { authData, logout } = useContext(AuthContext);
    const [selected, setSelected] = useState("submit");
    const [teacherData, setTeacherData] = useState(null);
    const [referralData, setReferralData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        if (!authData) return;
        const teacherID = authData.user?.uid;
        fetchData(teacherID);
        fetchReferral(teacherID);
    }, [authData]);

    const renderModule = () => {
        switch (selected) {
            case "submit":
                return teacherData && (
                    <SubmitReferralForm
                        teacher={teacherData}
                        onSuccess={() => fetchReferral(authData.user?.uid)}
                    />
                );
            case "view":
                return (
                    <ViewRequest
                        referralData={referralData}
                        isLoading={isLoading}
                    />
                );
            default:
                return (
                    <div className="animate-fade-in text-center mt-12">
                        <p className="text-gray-600 text-xl">Module content will appear here.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen text-black bg-white bg-[url('/grid.svg')] bg-repeat">
            <TeacherTopbar selected={selected} setSelected={setSelected} onLogout={logout} />
            <div className="px-0 w-full">
                {renderModule()}
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