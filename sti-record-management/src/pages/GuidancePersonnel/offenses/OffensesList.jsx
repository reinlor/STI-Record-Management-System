import { useEffect, useState } from "react";
import axios from "axios";
import OffensesTab from "./OffensesTab";
import OffenseDisplay from "./OffenseDisplay";
import { toast } from "react-toastify";

function OffensesList() {
    const [offenses, setOffenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOffense, setSelectedOffense] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/content/offenses/get");

                let entries = Object.entries(response.data);

                // Minor Offenses first, then alphabetical
                entries.sort(([a], [b]) => {
                    if (a === "Minor Offenses") return -1;
                    if (b === "Minor Offenses") return 1;
                    return a.localeCompare(b);
                });

                setOffenses(entries);
            } catch (err) {
                setError(err.message || "Something went wrong");
                toast.error("Failed to fetch offenses.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectOffense = (offenseName, details) => {
        setSelectedOffense({ offenseName, details });
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
            {loading && <p className="text-gray-500">Loading offenses...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!selectedOffense && (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">
                        Student Offenses
                    </h1>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {offenses.map(([name, details]) => (
                            <OffensesTab
                                key={name}
                                offenseName={name}
                                onClick={() => handleSelectOffense(name, details)}
                            />
                        ))}
                    </div>
                </>
            )}

            {selectedOffense && (
                <OffenseDisplay
                    offenseName={selectedOffense.offenseName}
                    details={selectedOffense.details}
                    onBack={() => setSelectedOffense(null)}
                />
            )}
        </div>
    );
}

export default OffensesList;
