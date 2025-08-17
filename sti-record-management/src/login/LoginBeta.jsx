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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex w-[700px] h-[450px] rounded-3xl shadow-3xl bg-white overflow-hidden">
                <div className="w-1/2 bg-[#0172B9] flex items-center justify-center p-8">
                    <div className="text-white text-center">
                        <h2 className="text-4xl font-extrabold mb-4">Welcome</h2>
                        <p className="text-gray-100 font-light text-sm">
                            Sign in to access your dashboard and manage your account.
                        </p>
                    </div>
                </div>
                <div className="w-1/2 flex flex-col justify-center items-center px-12 bg-white">
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-tight">Sign in to Your Account</h2>
                    <form className="w-full flex flex-col items-center" onSubmit={handleLogin}>
                        <div className="w-full mb-5">
                            <label className="block text-sm font-medium mb-2 text-gray-600">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0172B9] focus:border-[#0172B9] transition-all duration-300 ease-in-out text-gray-700 placeholder-gray-400"
                                required
                            />
                        </div>
                        <div className="w-full mb-7">
                            <label className="block text-sm font-medium mb-2 text-gray-600">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0172B9] focus:border-[#0172B9] transition-all duration-300 ease-in-out text-gray-700"
                                required
                            />
                        </div>
                        <button
                            className="w-full py-3 bg-[#0172B9] text-white font-semibold rounded-xl hover:bg-[#00426b] focus:outline-none focus:ring-2 focus:ring-[#FFFC6C] transition-all duration-300 ease-in-out transform hover:scale-105"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <ToastContainer />
                        {errorMsg && (
                            <p className="mt-4 text-red-500 text-sm text-center font-medium">{errorMsg}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginBeta;