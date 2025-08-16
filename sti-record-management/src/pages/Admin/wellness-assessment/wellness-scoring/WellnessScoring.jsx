import React, { useState, useEffect } from 'react';

function WellnessScoring() {
  const [totalScore, setTotalScore] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [newDistribution, setNewDistribution] = useState({ name: '', percentage: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = '/exam';

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get`);
        if (!response.ok) {
          if (response.status === 404) {
            setTotalScore(100);
            setMessage("No existing assessment form found. You can add new score distributions.");
            setDistributions([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTotalScore(data.totalScore || 0);
        setDistributions(data.scoreDistribution || []);
      } catch (e) {
        console.error("Error fetching assessment data:", e);
        setError("Failed to load assessment data. Please ensure your backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDistribution(prev => ({
      ...prev,
      [name]: name === 'percentage' ? parseFloat(value) : value,
    }));
  };

  const handleAddDistribution = () => {
    if (
      newDistribution.name.trim() === '' ||
      isNaN(newDistribution.percentage) ||
      newDistribution.percentage < 0 ||
      newDistribution.percentage > 100
    ) {
      setError('Please provide a name and a valid percentage between 0 and 100.');
      return;
    }
    setError('');
    if (distributions.some(dist => dist.name.toLowerCase() === newDistribution.name.toLowerCase().trim())) {
      setError('A condition with this name already exists.');
      return;
    }
    const newDistributions = [...distributions, { ...newDistribution, name: newDistribution.name.trim() }];
    setDistributions(newDistributions);
    setNewDistribution({ name: '', percentage: 0 });
  };

  const handleRemoveDistribution = (index) => {
    const newDistributions = distributions.filter((_, i) => i !== index);
    setDistributions(newDistributions);
  };

  const handleSave = async () => {
    if (totalScore === null) {
      setError("Cannot save. Total score not yet loaded.");
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const updates = { scoreDistribution: distributions };
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessage(result.message || 'Score distributions updated successfully!');
    } catch (e) {
      console.error("Error updating score distributions:", e);
      setError(`Failed to save. Details: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-8 font-sans">
      <div className="w-full bg-white shadow-xl rounded-2xl p-8 border-t-8 border-green-400">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Add Conditions</h1>
        <p className="text-gray-500 mb-6">Define conditions based on the total score.</p>

        {isLoading ? (
          <div className="text-center text-green-500 text-xl font-semibold p-8">
            <svg
              className="animate-spin h-8 w-8 text-green-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </div>
        ) : (
          <>
            <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 mb-6 rounded-lg">
              <p className="font-semibold">
                Current Total Score: <span className="text-2xl font-bold">{totalScore}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 mb-4 rounded-lg">{error}</div>
            )}

            {message && (
              <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 mb-4 rounded-lg">{message}</div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add a New Condition</h2>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  name="name"
                  value={newDistribution.name}
                  onChange={handleChange}
                  placeholder="e.g., 'You are doing well!'"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-400 transition-colors"
                />

                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="w-full md:w-2/3">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Percentage: <span className="font-bold text-green-600">{newDistribution.percentage}%</span>
                    </label>
                    <input
                      type="range"
                      name="percentage"
                      min="0"
                      max="100"
                      value={newDistribution.percentage}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-colors accent-green-400"
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Equivalent Score:</label>
                    <div className="text-xl font-bold text-green-600 p-3 bg-green-50 rounded-lg text-center">
                      {Math.round((newDistribution.percentage / 100) * totalScore)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddDistribution}
                  className="w-full md:w-auto self-end px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                >
                  Add Condition
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Existing Conditions</h2>
              {distributions.length === 0 ? (
                <p className="text-center text-gray-400 italic">No conditions added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {distributions.map((dist, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-green-50 p-4 rounded-lg shadow-sm border border-green-200"
                    >
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-800">{dist.name}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-green-600">{dist.percentage}%</span> of total score (
                          {totalScore}) which is {Math.round((dist.percentage / 100) * totalScore)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveDistribution(index)}
                        className="p-2 text-red-500 rounded-full hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold shadow-lg transition-colors ${
                  isSaving
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WellnessScoring;
