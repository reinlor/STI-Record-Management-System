const { getAssessmentExamCollection } = require("../models/assessmentExamModel");
const Joi = require('joi');

// AssessmenyExamForm Schema

// Papalitan pa
const wellnessAssessment = Joi.object({
  name: Joi.string().required(),
  options: Joi.array().required()
});

const wellnessUpdateAssessment = Joi.object({
  name: Joi.string().optional(),
  options: Joi.array().optional()
});
//

const questionSchema = Joi.object({
  questionID: Joi.string().required(),
  questionText: Joi.string().required(),
  questionType: Joi.string().required(),
  options: Joi.array().required(),
  score: Joi.number().default(1)
});
const assessmentExamSchema = Joi.object({
  examID: Joi.string().required(),
  examTitle: Joi.string().required().min(5).max(30),
  description: Joi.string().optional(),
  questions: Joi.array().required().items(questionSchema)
});
const updateSchema = Joi.object({
  examID: Joi.string().optional(),
  examTitle: Joi.string().optional().min(5).max(30),
  description: Joi.string().optional(),
  questions: Joi.array().optional()
});

// Controller Function for adding an assessment exam form
const addAssessmentExam = async (req, res) => {
  try {
    assessmentExamSchema.validate(req.body);
    const { error, value: newExam } = assessmentExamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    };
    await getAssessmentExamCollection().doc().set(newExam);

    res.status(200).send({
      message: `Assessment Exam Form added successfully!`,
    });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for deleting an assessment exam form
const deleteAssessmentExam = async (req, res) => {
  const { examID } = req.params;

  try {
    const assessmentExamDoc = await getAssessmentExamCollection()
      .where('examID', '==', examID)
      .limit(1)
      .get();

    if (assessmentExamDoc.empty) {
      return res.status(404).send({ error: `Exam assessment form with ID '${examID}' not found.` });
    }

    const assessmentToDelete = assessmentExamDoc.docs[0];
    await assessmentToDelete.ref.delete();
    const examName = assessmentToDelete.data().examTitle;

    res.status(200).send({ message: `Exam Assessment Form: '${examName}' deleted.` });
  } catch (error) {
    res.status(404).send({ error: `Failed to delete Exam Assessment Form.` });
  }
};


// Controller Function for updating an assessment exam form
const updateAssessmentExam = async (req, res) => {
  const { examID } = req.params;
  const updates = req.body;

  try {
    if (!examID) {
      return res.status(400).send({ error: 'Exam ID (field value) is required for update.' });
    }

    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    if (Object.keys(validatedUpdates).length === 0) {
      return res.status(400).json({ error: "No valid update data provided." });
    }

    const snapshot = await getAssessmentExamCollection()
      .where('examID', '==', examID)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).send({ error: `Exam Assessment Form with ID: '${examID}' not found.` });
    }

    const documentToUpdateRef = snapshot.docs[0].ref;
    const documentToUpdateData = snapshot.docs[0].data();

    await documentToUpdateRef.update(validatedUpdates);
    const examTitle = documentToUpdateData.examTitle || 'Unknown Title';

    res
      .status(200)
      .send({
        message: `Exam Assessment Form: '${examTitle}' updated successfully.`,
        updates: validatedUpdates
      });

  } catch (error) {
    console.error("Error updating assessment exam:", error);
    res.status(500).send({
      error: `Failed to update exam assessment form with field ID '${examID}'. Please try again.`,
      details: error.message
    });
  }
};

// Controller Function for retrieving assessmentExamForm by examID
const getAssessmentExamForm = async (req, res) => {
  const { examID } = req.params;

  try {
    const snapshot = await getAssessmentExamCollection()
      .where("examID", "==", examID)
      .get();

    if (snapshot.empty) {
      return res.status(404).send({
        error: `There is no available assessment exam forms available`,
      });
    }

    const assessmentExamForm = snapshot.docs.map((assessmentExam) => ({
      _id: assessmentExam.id,
      ...assessmentExam.data(),
    }));

    res.status(200).send(assessmentExamForm);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// Controller Function to retrieve all Assessment Exam Form
const getAllAssessmentExam = async (req, res) => {
  const snapshot = await getAssessmentExamCollection().get();

  try {

    if (snapshot.empty) {
      return res.status(404).send({ error: `There is no assessment exam forms available.` });
    }

    const assessmentExamForm = snapshot.docs.map((examForm) => ({
      _id: examForm.id,
      ...examForm.data(),
    }));

    res.status(200).send(assessmentExamForm);
  } catch (error) {
    res.status(404).send({ error: `Failed to retrieve assessment exam forms.` });
  }
};

module.exports = {
  addAssessmentExam,
  deleteAssessmentExam,
  updateAssessmentExam,
  getAssessmentExamForm,
  getAllAssessmentExam
}