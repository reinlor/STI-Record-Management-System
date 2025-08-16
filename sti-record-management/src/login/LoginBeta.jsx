import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseClient";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginBeta() {
    const [schoolId, setSchoolId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            // Firebase login
            const userCredential = await signInWithEmailAndPassword(auth, schoolId, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Axios request to backend
            const response = await axios.post(
                "/user/authenticate",
                { idToken },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    withCredentials: true,
                }
            );

            const { user: userData } = response.data;
            const userRole = userData.role;

            setLoading(false);
            toast.success("Welcome!");

            // Redirect by role
            if (userRole === "Admin") {
                navigate("/admin");
            } else if (userRole === "Disciplinary") {
                navigate("/disciplinary");
            } else if (userRole === "Teacher") {
                navigate("/teacher");
            } else if (userRole === "Student") {
                navigate("/student");
            } else {
                navigate("/");
            }
        } catch (error) {
            setLoading(false);
            if (error.response) {
                // Error from backend
                setErrorMsg(error.response.data.error || "Authentication failed.");
            } else {
                // Network or other error
                setErrorMsg("The email or password might be incorrect");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#e3eef2]">
            <div className="flex w-[600px] h-[370px] rounded-lg shadow-lg overflow-hidden">
                <div className="w-1/2 bg-[#232b3e] flex items-center justify-center"></div>
                <div className="w-1/2 bg-white flex flex-col justify-center items-center px-10">
                    <h2 className="text-3xl font-bold mb-8 text-center text-black">Login</h2>
                    <form className="w-full flex flex-col items-center" onSubmit={handleLogin}>
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium mb-1 text-black">Email</label>
                            <input
                                type="text"
                                placeholder="Email"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                className="w-full px-3 py-2 border border-[#232b3e] rounded focus:outline-none focus:ring-2 focus:ring-[#232b3e] text-black"
                                required
                            />
                        </div>
                        <div className="w-full mb-6">
                            <label className="block text-sm font-medium mb-1 text-black">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-[#232b3e] rounded focus:outline-none focus:ring-2 focus:ring-[#232b3e] text-black"
                                required
                            />
                        </div>
                        <button
                            className="w-32 py-2 bg-[#232b3e] text-white rounded hover:bg-[#1a2232] transition text-center"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <ToastContainer />
                        {errorMsg && (
                            <p className="mt-4 text-red-600 text-sm text-center">{errorMsg}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginBeta;
