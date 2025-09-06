import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

export default function ConsentModal({
  isFirstLogin, id
}) {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    if (!isFirstLogin) {
      setShowForm(false);
    }
  }, [])

  const [showForm, setShowForm] = useState(true)

  const handleContinue = async () => {
    // The button is already disabled if hasConsented is false, but this check
    // adds an extra layer of safety to prevent the API call.
    if (!hasConsented) {
      toast.error("Please read the consent form and check the box to continue.");
      return;
    }

    try {
      const response = await axios.put(`/user/update/${id}`, {
        isFirstLogin: false
      });
      toast.success("Consent granted");
      setShowForm(false)
      return response.data;
    } catch (error) {
      // It's good practice to log or show a user-friendly error message.
      console.error("Failed to update user consent:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
  <>
    {showForm ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 font-sans">
      <div className="bg-white rounded-3xl shadow-3xl overflow-hidden max-w-5xl w-full mx-4 my-8 md:my-12">
        <div className="p-8 md:p-12 overflow-y-auto max-h-[80vh]">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">STI Guidance and Counseling Office</h1>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mt-2">Client Consent Form</h2>
          </div>

          <div className="text-sm md:text-base text-gray-600 space-y-6 leading-relaxed">
            <h3 className="font-bold text-gray-700 text-lg md:text-xl">GUIDANCE AND COUNSELING</h3>
            <p>
              Guidance and Counseling is a process designed to help you gain a greater understanding of yourself, address your concerns, and learn effective academic, behavioral, personal and interpersonal coping strategies. It involves a helping relationship between you and a counseling staff (registered guidance counselor or trained guidance associate) who has the desire and willingness to help you accomplish your individual goals. Counseling involves sharing personal information with your guidance counselor. During the course of counseling, there may be periods of anxiety or confusion. The outcome of counseling is often positive; however, the level of satisfaction for any individual is not predictable. The success of the counseling goals is usually dependent on the participation of the client. Your counselor is available to support you throughout the counseling process. The termination of the counseling shall be after the goals are met, or if there is a need for a referral to other professionals, or the client expresses the intention to terminate such. All interactions with Guidance and Counseling Services, including scheduling of appointments, content of your sessions, progress in counseling, standardized test results, and individual personal records are strictly confidential. No record of counseling is contained in any academic, disciplinary, administrative, personnel, or career placement file. You may request in writing that the guidance and counseling staff release specific information about your counseling to persons you designate.
            </p>

            <h3 className="font-bold text-gray-700 text-lg md:text-xl">EXCEPTIONS TO CONFIDENTIALITY</h3>
            <p>
              Because counseling is based on a trusting relationship between the guidance counselor and the client, the former will keep information shared by the latter confidential, except in certain situations in which an ethical responsibility limits confidentiality.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The guidance and counseling staff works as a team. Your guidance counselor may consult with other counseling staff and allied professionals to provide the best possible care. These consultations are for professional and training purposes only.</li>
              <li>If there is evidence of clear and imminent danger of harm or abuse to self and/or from others, a guidance counselor is legally required to report this information to the authorities responsible for ensuring safety.</li>
              <li>A court order, issued by a judge, may require the Guidance and Counseling Services staff to release information contained in your record.</li>
            </ul>
          </div>

          <div className="my-8 border-t border-gray-300"></div>

          <div className="flex items-start">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-[#0172B9] focus:ring-[#0172B9] cursor-pointer"
            />
            <label htmlFor="consent-checkbox" className="ml-3 text-sm md:text-base text-gray-700">
              I have read and understood the above information on the nature and benefits of guidance and counseling and the scope and limits of confidentiality. By checking this box, I give my consent.
            </label>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!hasConsented}
            className={`w-full md:w-auto py-3 px-8 text-white font-semibold rounded-xl transition-all duration-300 ease-in-out ${hasConsented
              ? 'py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-200'
              : 'py-2.5 px-6 bg-gray-400 cursor-not-allowed'
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>) : null}
  </>
  );
}