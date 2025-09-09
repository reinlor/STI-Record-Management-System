import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

import ModalForm from './ModalForm.jsx';
import DeleteConfirmationModal from './DeleteConfirmationModal.jsx';
import QuestionList from './QuestionList.jsx';

const uniqueId = () => Date.now() + Math.random();

function WellnessGeneration() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [wellnessForm, setWellnessForm] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState([])

  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState([{ id: uniqueId(), answer: '', score: '' }]);

  const resetForm = () => {
    setNewQuestion('');
    setNewOptions([{ id: uniqueId(), answer: '', score: '' }]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await axios.get('/exam/get');
        setWellnessForm(response.data.questions || []);

        const themeResponse = await axios.get('/exam/theme/get');
        setTheme(themeResponse.data.questions || []);

      } catch (error) {
        console.error('Failed to fetch wellness data:', error);
        setError('Failed to load questions. Please try again later.');
        toast.error('Failed to load questions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateFormOnServer = async (updatedQuestions) => {
    try {
      await axios.put('/exam/update', { questions: updatedQuestions });
      toast.success('Form saved successfully!');
      const response = await axios.get('/exam/get');
      setWellnessForm(response.data.questions || []);
    } catch (error) {
      console.error('Failed to update wellness form:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion || newOptions.some(opt => !opt.answer || opt.score === '')) {
      toast.error('Please fill out the question and all options.');
      return;
    }

    const newQuestionData = {
      question: newQuestion,
      options: newOptions.map(opt => ({
        answer: opt.answer,
        score: parseInt(opt.score),
      })),
    };

    const updatedForm = [...wellnessForm, newQuestionData];
    setWellnessForm(updatedForm);
    updateFormOnServer(updatedForm);
    resetForm();
    setShowModal(false);
  };

  const handleEditQuestion = () => {
    if (!newQuestion || newOptions.some(opt => !opt.answer || opt.score === '')) {
      toast.error('Please fill out the question and all options.');
      return;
    }

    const updatedForm = [...wellnessForm];
    updatedForm[editingIndex] = {
      question: newQuestion,
      options: newOptions.map(opt => ({
        answer: opt.answer,
        score: parseInt(opt.score),
      })),
    };

    setWellnessForm(updatedForm);
    updateFormOnServer(updatedForm);
    setEditingIndex(null);
    resetForm();
    setShowModal(false);
  };

  const handleDeleteQuestion = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedForm = wellnessForm.filter((_, i) => i !== deleteIndex);
    setWellnessForm(updatedForm);
    updateFormOnServer(updatedForm);
    toast.success('Question deleted successfully!');
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setDeleteIndex(null);
    resetForm();
    setShowModal(false);
    setShowDeleteModal(false);
    toast.info('Operation canceled.');
  };

  const handleAddOption = () => {
    setNewOptions(prev => [...prev, { id: uniqueId(), answer: '', score: '' }]);
  };

  const handleRemoveOption = (id) => {
    setNewOptions(prev => prev.filter(option => option.id !== id));
  };

  const handleOptionChange = (id, event) => {
    setNewOptions(prevOptions => prevOptions.map(option => {
      if (option.id === id) {
        const { name, value } = event.target;
        if (name === 'answer') {
          return { ...option, answer: value };
        } else if (name === 'score' && (value === '' || /^-?\d*$/.test(value))) {
          return { ...option, score: value };
        }
      }
      return option;
    }));
  };

  const startEditing = (questionIndex) => {
    const questionToEdit = wellnessForm[questionIndex];
    setNewQuestion(questionToEdit.question);
    const optionsWithIds = questionToEdit.options.map(opt => ({
      ...opt,
      id: uniqueId(),
      score: String(opt.score ?? ''),
    }));
    setNewOptions(optionsWithIds);
    setEditingIndex(questionIndex);
    setShowModal(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <QuestionList
        questions={wellnessForm}
        likertScale={theme}
        isLoading={isLoading}
        error={error}
        onEdit={startEditing}
        onDelete={handleDeleteQuestion}
      />

      <button
        onClick={() => {
          setShowModal(true);
          setEditingIndex(null);
          resetForm();
        }}
        className="w-full mt-8 py-3 px-6 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-colors cursor-pointer"
        type="button"
      >
        Add New Question
      </button>

      {showModal && (
        <ModalForm
          editingIndex={editingIndex}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          newOptions={newOptions}
          onOptionChange={handleOptionChange}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
          onSubmit={editingIndex !== null ? handleEditQuestion : handleAddQuestion}
          onCancel={handleCancel}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={confirmDelete}
          onCancel={handleCancel}
          questionText={wellnessForm[deleteIndex]?.question}
        />
      )}
      <ToastContainer position="top-right" />
    </div>
  );
}

export default WellnessGeneration;