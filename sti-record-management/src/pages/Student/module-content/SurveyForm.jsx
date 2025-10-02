import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../../../firebaseClient";
import LoadingDots from "../../../component/Loading";

export default function SurveyForm({ surveyName }) {
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSurveyAndStatus = async () => {
      try {
        // 1) Always fetch the survey definition from your existing backend route
        //    (your server exposes: GET /exam/survey/get/:surveyName)
        const surveyRes = await axios.get(`/exam/survey/get/${encodeURIComponent(surveyName)}`);
        if (!mounted) return;
        setSurvey(surveyRes.data);

        // optional: if you want students to only see released surveys
        // (your survey object has isReleased boolean)
        if (surveyRes.data.isReleased === false) {
          // survey exists but not released — stop here
          setLoading(false);
          return;
        }

        // 2) If user is logged in, check whether they already answered
        const uid = auth.currentUser?.uid;
        if (uid) {
          const checkRes = await axios.get(
            `/exam/check/${encodeURIComponent(surveyName)}/${uid}`
          );
          if (!mounted) return;
          setHasAnswered(Boolean(checkRes.data.hasAnswered));
          if (checkRes.data.hasAnswered) {
            // they've already answered — we can bail out early
            setLoading(false);
            return;
          }
        }

      } catch (err) {
        console.error("Error loading survey:", err);
        toast.error("Failed to load survey. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSurveyAndStatus();

    return () => {
      mounted = false;
    };
  }, [surveyName]);


  if (loading) return <LoadingDots />;

  if (hasAnswered) {
    return (
      <div className="p-6 bg-white rounded-xl shadow text-center">
        <h2 className="text-xl font-semibold text-green-600">✅ Survey Completed</h2>
        <p className="text-gray-600 mt-2">
          You’ve already submitted this survey. Thank you!
        </p>
      </div>
    );
  }

  // Group questions by category
  const getGroupedQuestions = () => {
    if (!survey?.questions) return {};
    return survey.questions.reduce((groups, q, idx) => {
      const cat = q.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ ...q, _surveyIndex: idx });
      return groups;
    }, {});
  };

  // Loading state
  if (!survey)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="animate-spin text-[#0B5793] text-4xl" />
        <span className="ml-4 text-lg text-gray-700">Loading survey...</span>
      </div>
    );

  // No questions state
  if (!survey.questions || survey.questions.length === 0)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <span className="text-2xl text-gray-700 mb-4">
          No survey questions available.
        </span>
        <span className="text-gray-500">Please wait for the Survey to be Released.</span>
      </div>
    );

  // Event Handlers
  const handleChange = (surveyIndex, optionIndex) => {
    setResponses((prev) => ({
      ...prev,
      [surveyIndex]: optionIndex,
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
        selectedAnswer:
          q.options && q.options[responses[idx]]
            ? q.options[responses[idx]].answer || q.options[responses[idx]]
            : "",
        score:
          q.options && q.options[responses[idx]]
            ? q.options[responses[idx]].score !== undefined
              ? q.options[responses[idx]].score
              : null
            : null,
      }));

      await axios.post("/exam/submit", {
        surveyName,
        responses: payload,
        studentId: auth.currentUser?.uid,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit survey:", err);
      toast.error("Error submitting survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render grouped questions
  const grouped = getGroupedQuestions();
  const categories = Object.keys(grouped);

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#E8E9EF] p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Thank you for completing the survey!
        </h2>
        <p className="text-gray-600">
          Your responses have been submitted successfully.
        </p>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  const questions = grouped[currentCategory];

  return (
    <div className="min-h-screen bg-[#E8E9EF] flex flex-col items-center p-4 font-sans">
      <ToastContainer />

      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-8 border-[#0B5793]">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {survey.title || survey.surveyName || surveyName}
          </h2>
          <p className="text-gray-600 text-lg">{survey.description || ""}</p>
        </div>

        {/* Category Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-8 border-[#0B5793]">
          <h3 className="text-2xl font-semibold text-gray-800">
            {currentCategory}
          </h3>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q._surveyIndex}
              className={`bg-white rounded-lg shadow-md p-6 border transition-colors duration-200 ${responses[q._surveyIndex] !== undefined
                ? "border-[#3473A4]"
                : "border-gray-200"
                }`}
            >
              <p className="text-lg font-bold mb-4 text-gray-800">
                {q.question}
              </p>
              <div className="flex flex-col space-y-2">
                {(q.options || []).map((opt, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors duration-200 ${responses[q._surveyIndex] === oIndex
                      ? "bg-[#3473A4]/10 border-[#3473A4] text-gray-900 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q._surveyIndex}`}
                      checked={responses[q._surveyIndex] === oIndex}
                      onChange={() => handleChange(q._surveyIndex, oIndex)}
                      className="w-4 h-4 accent-[#0B5793] cursor-pointer"
                    />
                    <span className="text-base">
                      {typeof opt === "string" ? opt : opt.answer}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentCategoryIndex > 0 ? (
            <button
              onClick={() =>
                setCurrentCategoryIndex((prev) => Math.max(0, prev - 1))
              }
              className="py-2.5 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-lg hover:bg-gray-300 transform transition-all duration-200"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentCategoryIndex < categories.length - 1 ? (
            <button
              onClick={() =>
                setCurrentCategoryIndex((prev) =>
                  Math.min(categories.length - 1, prev + 1)
                )
              }
              className="py-2.5 px-6 bg-[#0B5793] text-white font-semibold rounded-xl shadow-lg hover:bg-[#3473A4] transform transition-all duration-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transform transition-all duration-200
                ${isSubmitting
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : ""
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}