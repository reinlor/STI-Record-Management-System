import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

export default function SurveyForm() {
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  {/** **API Call & Data Fetching** */}
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get("/exam/get");
        setSurvey(res.data);
      } catch (err) {
        console.error("Failed to load survey:", err);
        // You might want to show an error toast here as well
        toast.error("Failed to load survey. Please try again later.");
      }
    };
    fetchSurvey();
  }, []);

  {/** **Loading State** */}
  if (!survey)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="animate-spin text-blue-600 text-4xl" />
        <span className="ml-4 text-lg text-gray-700">Loading survey...</span>
      </div>
    );

  {/** **Event Handlers** */}
  const handleChange = (questionIndex, optionIndex) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length < survey.questions.length) {
      toast.warn("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = survey.questions.map((q, idx) => ({
        question: q.question,
        selectedAnswer: q.options[responses[idx]].answer,
        score: q.options[responses[idx]].score,
      }));

      await axios.post("/exam/submit", { responses: payload });
      toast.success("Survey submitted successfully!");
      setResponses({});
    } catch (err) {
      console.error("Failed to submit survey:", err);
      toast.error("Error submitting survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  {/** **Component JSX** */}
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <ToastContainer />
      <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-xl my-8">
        {/** **Header Section** */}
        <div className="text-left mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1">
            {survey.title || "Wellness Survey"}
          </h2>
          <p className="text-gray-500 text-base">{survey.description}</p>
        </div>

        {/** **Questions Section** */}
        <div className="space-y-6">
          {survey.questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className={`border border-gray-200 rounded-md p-4 transition-colors duration-200 ${
                responses[qIndex] !== undefined
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white"
              }`}
            >
              <p className="text-lg font-medium mb-3 text-gray-700">
                {q.question}
              </p>
              <div className="flex flex-col space-y-2">
                {q.options.map((opt, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                      responses[qIndex] === oIndex
                        ? "bg-blue-200 border-blue-500 text-blue-900 shadow-sm"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={responses[qIndex] === oIndex}
                      onChange={() => handleChange(qIndex, oIndex)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-base">{opt.answer}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/** **Submit Button** */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-8 w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-transform duration-200 transform-gpu
            ${
              isSubmitting
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send /> Submit Survey
            </>
          )}
        </button>
      </div>
    </div>
  );
}