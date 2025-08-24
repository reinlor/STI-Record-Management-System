import React from 'react';

const QuestionList = ({ questions, isLoading, error, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-8">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center text-gray-500 text-xl mt-8">Wellness form is empty. Add a new question to get started.</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Wellness Questions</h2>
      {questions.map((wellness, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-300 rounded-md bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{wellness.question}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(index)}
                className="py-1 px-3 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(index)}
                className="py-1 px-3 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
          <ul className="list-inside mt-2 space-y-2">
            {wellness.options.map((option, optionIndex) => (
              <li key={optionIndex} className="text-gray-600 flex justify-between">
                <span>{option.answer}</span>
                <span className="font-medium text-gray-900 w-20 text-right">Score: {option.score}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;