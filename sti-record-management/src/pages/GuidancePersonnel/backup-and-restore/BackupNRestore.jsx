import React, { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RefreshCcw, Clock, Database, Play } from "lucide-react";
import LoadingDots from "../../../component/Loading";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";


const AuthContext = React.createContext({
    authData: { user: { access: { backupRestore: { canView: true } } } },
    logout: () => { },
});

function BackNRestore() {
    const { authData } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [schedule, setSchedule] = useState("none");
    const [nextBackup, setNextBackup] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        let logsInitialized = false;
        let scheduleInitialized = false;

        const logsQuery = query(collection(db, "backupLogs"), orderBy("time", "desc"));
        const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
            const newLogs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLogs(newLogs);
            logsInitialized = true;
            if (scheduleInitialized) setIsLoading(false);
        });

        const unsubscribeSchedule = onSnapshot(
            collection(db, "backupSettings"),
            (snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.id === "schedule") {
                        const data = doc.data();
                        if (data?.schedule) setSchedule(data.schedule);
                        if (data?.nextBackup) setNextBackup(data.nextBackup);
                    }
                });
                scheduleInitialized = true;
                if (logsInitialized) setIsLoading(false);
            }
        );

        return () => {
            unsubscribeLogs();
            unsubscribeSchedule();
        };
    }, []);


    const handleScheduleChange = async (e) => {
        const value = e.target.value;
        setSchedule(value);
        try {
            await axios.post("/backup/schedule", { schedule: value });
            toast.success(`Backup schedule set to ${value}`);
        } catch (error) {
            console.error("Error updating schedule:", error);
            toast.error("Failed to update schedule");
        }
    };

    const backupNow = async () => {
        setIsExporting(true);
        try {
            await axios.post("/backup/export-now");
            toast.success("Backup completed successfully");
            const scheduleRes = await axios.get("/backup/schedule");
            if (scheduleRes.data?.nextBackup) setNextBackup(scheduleRes.data.nextBackup);
        } catch (error) {
            console.error("Error during backup:", error);
            toast.error("Backup failed");
        } finally {
            setIsExporting(false);
        }
    };

    const restoreLatestBackup = async () => {
        setIsRestoring(true);
        const toastId = toast.loading("Restoring backup... Please wait.");
        try {
            await axios.post("/restore/");
            toast.update(toastId, {
                render: "Restore completed successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Restore failed:", error);
            toast.update(toastId, {
                render: "Restore failed.",
                type: "error",
                isLoading: false,
                autoClose: 4000,
            });
        } finally {
            setIsRestoring(false);
        }
    };


    if (!authData?.user?.access?.backupRestore) {
        return <Navigate to="/error401" replace />;
    }

    if (isLoading) {
        return <LoadingDots />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <ToastContainer position="top-right" autoClose={4000} />

            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-6 sm:p-10 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-3 border-b pb-4">
                    <RefreshCcw className="h-8 w-8 text-[#0172bd]" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0172bd]">
                        Backup & Restore
                    </h1>
                </div>

                {/* Schedule Section */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <label className="font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Backup Schedule:
                        </label>
                        <select
                            value={schedule}
                            onChange={handleScheduleChange}
                            className="border rounded-lg p-2 w-full sm:w-60"
                        >
                            <option value="none">Manual only</option>
                            <option value="3hours">Every 3 hours</option>
                            <option value="12hours">Every 12 hours</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    {nextBackup && (
                        <p className="text-sm text-gray-600">
                            Next backup scheduled on:{" "}
                            <span className="font-semibold text-gray-800">
                                {new Date(nextBackup).toLocaleString()}
                            </span>
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        disabled={isExporting}
                        onClick={backupNow}
                        className="flex-1 bg-[#0172bd] hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Play className="w-5 h-5" />
                        {isExporting ? "Backing up..." : "Backup Now"}
                    </button>
                    <button
                        onClick={restoreLatestBackup}
                        disabled={isRestoring}
                        className={`flex-1 bg-[#fef201] hover:bg-green-500 text-black font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Database className="w-5 h-5" />
                        {isRestoring ? "Restoring..." : "Restore Backup"}
                    </button>
                </div>

                {/* Logs */}
                <div>
                    <h2 className="text-lg font-bold text-[#0172bd] mb-3">Backup Logs</h2>
                    <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-sm">
                            <thead className="bg-[#0172bd] text-white">
                                <tr>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map((log, idx) => {
                                        const dt = log.time?.toDate ? log.time.toDate() : null;
                                        return (
                                            <tr key={idx} className="border-t hover:bg-gray-50 transition">
                                                <td className="p-3">
                                                    {dt ? dt.toLocaleDateString("en-US") : "-"}
                                                </td>
                                                <td className="p-3">
                                                    {dt ? dt.toLocaleTimeString("en-US") : "-"}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-md text-xs font-semibold ${log.status === "success"
                                                                ? "bg-green-100 text-green-700"
                                                                : log.status === "restored"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-4 text-center text-gray-500 italic">
                                            No backups yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BackNRestore;
