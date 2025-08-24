import React from 'react';

const ModalForm = ({
  editingIndex,
  newQuestion,
  setNewQuestion,
  newOptions,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSubmit,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 bg-opacity-30 flex items-center justify-center p-4 z-50 animate-fade-in"
      style={{ backdropFilter: 'blur(10px)' }}
      onClick={onCancel}
    >
      <div
        className="p-6 my-4 bg-white rounded-lg shadow-lg border border-blue-400 max-w-lg w-full relative animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-blue-600">
          {editingIndex !== null ? 'Edit Question' : 'Create a New Question'}
        </h3>
        <input
          type="text"
          placeholder="Enter your question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {newOptions.map((option) => (
          <div key={option.id} className="flex gap-4 mb-2 items-center">
            <input
              type="text"
              name="answer"
              placeholder="Option"
              value={option.answer}
              onChange={(e) => onOptionChange(option.id, e)}
              className="w-2/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="score"
              placeholder="Score"
              value={option.score}
              onChange={(e) => {
                let value = e.target.value === "" ? "" : Math.min(5, Math.max(1, Number(e.target.value)));
                onOptionChange(option.id, { target: { name: "score", value } });
              }}
              max={5}
              min={1}
              step={1}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />


            {newOptions.length > 1 && (
              <button
                onClick={() => onRemoveOption(option.id)}
                className="bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                type="button"
              >
                &times;
              </button>
            )}
          </div>
        ))}

        <button
          onClick={onAddOption}
          className="w-full mt-4 py-2 px-4 bg-blue-100 text-blue-700 font-semibold rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
          type="button"
        >
          Add More Option
        </button>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onSubmit}
            className="flex-1 py-2 px-4 mr-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors cursor-pointer"
            type="button"
          >
            {editingIndex !== null ? 'Save Changes' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 ml-2 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;