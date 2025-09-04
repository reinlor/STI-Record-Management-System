import React, { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseClient";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthProvider.jsx";
import { Eye, EyeOff } from 'lucide-react';

function LoginBeta() {
    const [schoolId, setSchoolId] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false); // New state to toggle views between login and forgot password

    const { login } = useContext(AuthContext);

    // Existing handleLogin function...
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, schoolId, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            const response = await axios.post(
                "/user/authenticate", {
                    idToken
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    withCredentials: true,
                }
            );

            const {
                user: userData
            } = response.data;
            const userRole = userData.role;
            const userDisplayName = userData.displayName;

            console.log("Logged in user:", userData);
            console.log("Role:", userRole);
            console.log("Display Name:", userDisplayName);
            console.log("UID:", userData.uid);

            setLoading(false);
            toast.success("Welcome!");

            login(userData, userRole, userDisplayName);

            if (userRole === "Admin" || userRole === "Disciplinary" || userRole === "Super Admin") {
                navigate("/guidance");
            } else if (userRole === "Teacher") {
                navigate("/educator");
            } else if (userRole === "Student") {
                navigate("/pupil");
            } else {
                navigate("/");
            }
        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);
            if (error.response) {
                setErrorMsg(error.response.data.error || "Authentication failed.");
            } else {
                setErrorMsg("The email or password might be incorrect");
            }
        }
    };

    // NOTE: New function to handle forgot password
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); //Papalitan nalang ng actual request pag meron na.
            
            setLoading(false);
            toast.success("Reset link sent to your email!");
            setIsForgotPassword(false); // Switch back to login view
            setSchoolId(""); // Clear the email field
        } catch (error) {
            setLoading(false);
            console.error("Password Reset Error:", error);
            setErrorMsg("Failed to send password reset email. Please try again.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
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
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-tight">
                        {isForgotPassword ? "Reset Your Password" : "Sign in to Your Account"}
                    </h2>
                    
                    {/* Toggle between login and forgot password views based on isForgotPassword state */}
                    {isForgotPassword ? (
                        // Forgot Password Form
                        <form className="w-full flex flex-col items-center" onSubmit={handleForgotPassword}>
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
                            <p className="text-sm text-center text-gray-500 mb-4">
                                A password reset link will be sent to your email address. Be sure to check your spam folder!
                            </p>
                            <button
                                className="w-full py-3 bg-[#0172B9] text-white font-semibold rounded-xl hover:bg-[#00426b] focus:outline-none focus:ring-2 focus:ring-[#FFFC6C] transition-all duration-300 ease-in-out transform hover:scale-105"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setErrorMsg("");
                                    setSchoolId("");
                                }}
                                className="mt-4 text-sm text-gray-600 hover:text-[#0172B9] underline"
                            >
                                Back to Login
                            </button>
                            <ToastContainer />
                            {errorMsg && (
                                <p className="mt-4 text-red-500 text-sm text-center font-medium">{errorMsg}</p>
                            )}
                        </form>
                    ) : (
                        // Regular Login Form
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
                            <div className="w-full mb-2">
                                <label className="block text-sm font-medium mb-2 text-gray-600">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0172B9] focus:border-[#0172B9] transition-all duration-300 ease-in-out text-gray-700 pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="w-full mb-7 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setErrorMsg("");
                                    }}
                                    className="text-sm text-gray-600 hover:text-[#0172B9] underline"
                                >
                                    Forgot Password?
                                </button>
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginBeta;