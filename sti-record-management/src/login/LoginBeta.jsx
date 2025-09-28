import React, { useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseClient";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthProvider.jsx";
import { Eye, EyeOff } from "lucide-react";
import stiBg from "../assets/dasma-sti.jpg";

function LoginBeta() {
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const { login } = useContext(AuthContext);

  // Load cooldown from localStorage
  useEffect(() => {
    const storedCooldown = localStorage.getItem("loginCooldown");
    if (storedCooldown) {
      const diff = Math.floor((+storedCooldown - Date.now()) / 1000);
      if (diff > 0) {
        setCooldown(diff);
      } else {
        localStorage.removeItem("loginCooldown");
      }
    }
  }, []);

  // Countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("loginCooldown");
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  // Trigger toast only once when cooldown starts
  useEffect(() => {
    if (cooldown === 30) {
      toast.error("Too many attempts. Please wait 30 seconds.");
    }
  }, [cooldown]);

  // Check if a login cookie exist then proceeds to login
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("/user/me", { withCredentials: true });
        const userData = response.data.user;
        const userRole = userData.role;
        const userDisplayName = userData.displayName;

        login(userData, userRole, userDisplayName);

        if (userRole === "Admin" || userRole === "Disciplinary" || userRole === "Super Admin") {
          navigate("/guidance", { replace: true });
        } else if (userRole === "Teacher") {
          navigate("/educator", { replace: true });
        } else if (userRole === "Student") {
          navigate("/pupil", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.log("No active session, stay on login.");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [login, navigate]);

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }


  const handleLogin = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, schoolId, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await axios.post(
        "/user/authenticate",
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          withCredentials: true,
          timeout: 7000,
        }
      );

      const { user: userData } = response.data;
      const userRole = userData.role;
      const userDisplayName = userData.displayName;

      console.log("Logged in user:", userData);

      setLoading(false);
      setAttempts(0); // reset attempts after success
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
      console.error("Login Error:", error.code);

      // Handle different errors
      if (error.code === "ECONNABORTED" || error.message.includes("Network Error")) {
        setErrorMsg("Server unreachable. Please try again later.");
      } else if (error.response) {
        setErrorMsg(error.response.data.error || "Authentication failed.");
      } 
      else if (error.code === 'auth/user-disabled'){
        setErrorMsg('Account is Disabled')
      }
      else {
        setErrorMsg("The email or password might be incorrect");
      }

      // Track login attempts
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= 3) {
          const cooldownTime = Date.now() + 30 * 1000; // 30 sec cooldown
          localStorage.setItem("loginCooldown", cooldownTime);
          setCooldown(30);
          return 0; // reset attempts after cooldown
        }
        return newAttempts;
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const resetResponse = await axios.post(`/user/reset-password`, {
        email: schoolId,
      });

      const newEmailMessage = {
        email: schoolId,
        link: resetResponse.data,
      };

      await axios.post(`/email/sendResetPassword`, newEmailMessage);

      setLoading(false);
      toast.success("Reset link sent to your email!");
      setIsForgotPassword(false);
      setSchoolId("");
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
    <div className="relative min-h-screen flex items-center justify-center font-sans p-4 md:p-8 overflow-hidden">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
        style={{ backgroundImage: `url(${stiBg})` }}
      ></div>

      {/* Main Card */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl rounded-3xl shadow-3xl bg-white/90 backdrop-blur-sm overflow-hidden">
        {/* Left branding */}
        <div className="md:w-1/2 w-full bg-[#0172B9] flex items-center justify-center p-8 md:p-12 text-white">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">STI GORMS</h2>
            <p className="font-light text-base md:text-lg opacity-90">
              Sign in to access your dashboard and manage your account.
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:px-16 bg-white/80 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800 tracking-tight">
            {isForgotPassword ? "Reset Your Password" : "Sign in to Your Account"}
          </h2>

          {isForgotPassword ? (
            <form className="w-full max-w-md flex flex-col items-center" onSubmit={handleForgotPassword}>
              <div className="w-full mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-600">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0172B9] transition-all duration-300 ease-in-out text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              <p className="text-sm text-center text-gray-500 mb-6">
                A password reset link will be sent to your email. Check your spam folder too!
              </p>
              <button
                className="w-full py-3 bg-[#0172B9] text-white font-semibold rounded-xl hover:bg-[#00426b] focus:outline-none focus:ring-2 focus:ring-[#FFFC6C] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:transform-none"
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
                className="mt-6 text-sm text-[#0172B9] font-medium hover:underline transition-colors duration-200"
              >
                Back to Login
              </button>
              {errorMsg && <p className="mt-4 text-red-500 text-sm text-center font-medium">{errorMsg}</p>}
            </form>
          ) : (
            <form className="w-full max-w-md flex flex-col items-center" onSubmit={handleLogin}>
              <div className="w-full mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-600">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0172B9] transition-all duration-300 ease-in-out text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-600">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0172B9] transition-all duration-300 ease-in-out text-gray-700 pr-12"
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
              <div className="w-full mb-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setErrorMsg("");
                    setPassword("");
                  }}
                  className="text-sm text-[#0172B9] font-medium hover:underline transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
              <button
                className="w-full py-3 bg-[#0172B9] text-white font-semibold rounded-xl hover:bg-[#00426b] 
                focus:outline-none focus:ring-2 focus:ring-[#FFFC6C] transition-all duration-300 ease-in-out 
                transform hover:scale-105 disabled:bg-gray-400 disabled:transform-none"
                type="submit"
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? `Try again in ${cooldown}s` : loading ? "Logging in..." : "Login"}
              </button>
              {errorMsg && <p className="mt-4 text-red-500 text-sm text-center font-medium">{errorMsg}</p>}
            </form>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginBeta;
