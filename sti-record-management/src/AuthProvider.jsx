import React, { createContext, useState, useEffect, useRef } from "react";
import { signOut, onAuthStateChanged, onIdTokenChanged, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth, db } from "./firebaseClient";
import { doc, onSnapshot } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);
const SESSION_TIMEOUT = 15 * 60 * 1000;

const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user: null,
    role: null,
    uid: null,
    displayName: null,
    isAuthenticated: false,
    loading: true,
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "", notif: null });
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const activityTimer = useRef(null);
  const navigate = useNavigate();

  const resetInactivityTimer = () => {
    clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(() => {
      setShowTimeoutModal(true);
      logout();
    }, SESSION_TIMEOUT);
  };

  const setupActivityListeners = () => {
    ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
      window.addEventListener(e, resetInactivityTimer)
    );
    resetInactivityTimer();
  };

  const cleanupActivityListeners = () => {
    ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
      window.removeEventListener(e, resetInactivityTimer)
    );
    clearTimeout(activityTimer.current);
  };

  const login = (userData, userRole, displayName) => {
    setAuthData({
      user: userData,
      role: userRole,
      displayName,
      isAuthenticated: true,
      loading: false,
    });
    setupActivityListeners();
  };

  const logout = async () => {
  try {
    await signOut(auth);
    await axios.post("/user/logout", {}, { withCredentials: true });

    await setPersistence(auth, browserLocalPersistence);
    await auth.signOut();
  } catch (err) {
    console.error("Logout error:", err);
  }

  cleanupActivityListeners();
  setAuthData({
    user: null,
    role: null,
    uid: null,
    displayName: null,
    isAuthenticated: false,
    loading: false,
  });
};

  // Session check
  useEffect(() => {
    // Keep axios Authorization header in sync with Firebase ID token
    const unsubId = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    });

    // React to auth state changes and call /user/me
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // no user -> clear state
        delete axios.defaults.headers.common["Authorization"];
        setAuthData({
          user: null,
          role: null,
          displayName: null,
          isAuthenticated: false,
          loading: false,
        });
        cleanupActivityListeners();
        return;
      }

      try {
        // ensure axios has a token (onIdTokenChanged also keeps it updated)
        const token = await user.getIdToken();
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // call backend to get user session data
        const res = await axios.get("/user/me");
        const userInfo = res.data.user;
        setAuthData({
          user: userInfo,
          role: userInfo.role,
          displayName: userInfo.displayName,
          isAuthenticated: true,
          loading: false,
        });
        setupActivityListeners();
      } catch (err) {
        // backend rejected token or no session
        delete axios.defaults.headers.common["Authorization"];
        setAuthData({
          user: null,
          role: null,
          displayName: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    });

    return () => {
      unsubId();
      unsubAuth();
      cleanupActivityListeners();
    };
  }, []);

  // Real-time notifications
  useEffect(() => {
    if (authData.role !== "Admin" && authData.role !== "Super Admin") return;

    const requestRef = doc(db, "notification", "request");
    const referralRef = doc(db, "notification", "referral");
    const casesRef = doc(db, "notification", "cases");
    const recordsRef = doc(db, "notification", "records");

    let prevRequestIds = new Set();
    let prevReferralIds = new Set();
    let prevCasesIds = new Set();
    let prevRecordsIds = new Set();
    let initialized = { request: false, referral: false, cases: false, records: false };

    const showToastQueue = (() => {
      const queue = [];
      let showing = false;
      const delay = 3500;

      const process = () => {
        if (showing || queue.length === 0) return;
        showing = true;
        const notif = queue.shift();

        setToast({
          show: true,
          message: `${notif.from}: ${notif.subject}`,
          type: notif.collectionType,
          notif,
        });

        new Audio("/notification-sound.mp3").play().catch(() => { });

        setTimeout(() => {
          setToast({ show: false, message: "", type: "", notif: null });
          showing = false;
          setTimeout(process, delay);
        }, 4000);
      };

      return (notif) => {
        queue.push(notif);
        process();
      };
    })();

    const handleSnapshot = (snap, prevIds, setPrevIds, collectionType) => {
      if (!snap.exists()) return;
      const data = snap.data().data || [];

      if (!initialized[collectionType]) {
        setPrevIds(new Set(data.map((n) => n.notifID)));
        initialized[collectionType] = true;
        return;
      }

      const currentIds = new Set(data.map((n) => n.notifID));
      const newNotifs = data.filter((n) => !prevIds.has(n.notifID));

      newNotifs.forEach((notif) => showToastQueue({ ...notif, collectionType }));
      setPrevIds(currentIds);
    };

    const unsubReq = onSnapshot(requestRef, (snap) =>
      handleSnapshot(snap, prevRequestIds, (ids) => (prevRequestIds = ids), "request")
    );
    const unsubRef = onSnapshot(referralRef, (snap) =>
      handleSnapshot(snap, prevReferralIds, (ids) => (prevReferralIds = ids), "referral")
    );
    const unsubCase = onSnapshot(casesRef, (snap) =>
      handleSnapshot(snap, prevCasesIds, (ids) => (prevCasesIds = ids), "cases")
    );
    const unsubRecord = onSnapshot(recordsRef, (snap) =>
      handleSnapshot(snap, prevRecordsIds, (ids) => (prevRecordsIds = ids), "records")
    );

    return () => {
      unsubReq();
      unsubRef();
      unsubCase();
      unsubRecord();
    };
  }, [authData.role]);

  const handleToastClick = () => {
    if (!toast.notif) return;
    if (toast.type === "referral") navigate("/guidance/referral-form");
    else if (toast.type === "request") navigate("/guidance/request-slip");
    else if (toast.type === "cases") navigate("/guidance/student-cases");
    else if (toast.type === "records") navigate("/guidance/student-records");
    setToast({ show: false, message: "", type: "", notif: null });
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[90%] max-w-sm text-center animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Session Timeout
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your session expired due to inactivity. Please log in again.
            </p>
            <button
              onClick={() => setShowTimeoutModal(false)}
              className="bg-[#0172b9] text-white px-4 py-2 rounded-lg hover:bg-[#025f98] transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          onClick={handleToastClick}
          className="fixed bottom-6 left-6 bg-[#0B5793] hover:bg-[#0c6fbf] transition text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-slideUp z-[9999] cursor-pointer"
        >
          <span className="text-lg">🔔</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
