import axios from "axios";
import { useEffect, useState } from "react";

import WellnessTableList from "./components/WellnessTableList";
import WellnessContentManager from "./components/WellnessContentManager";

function WellnessForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [wellnessForm, setWellnessForm] = useState([]);
    const [theme, setTheme] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));

                const response = await axios.get('/exam/get');
                setWellnessForm(response.data.questions || []);

                const themeResponse = await axios.get('/exam/theme/get');
                setTheme(themeResponse.data || []);

            } catch (error) {
                console.error('Failed to fetch data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            Loading...
        </div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans text-red-500">
            {error}
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row gap-6 p-6">
            {/* Left panel - Questions */}
            <div className="flex-1 md:w-2/3 bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
                <WellnessTableList data={wellnessForm} />
            </div>

            {/* Right panel - Add form */}
            <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6">
                <WellnessContentManager data={wellnessForm} theme={theme} />
            </div>
        </div>
    );


}

export default WellnessForm;
