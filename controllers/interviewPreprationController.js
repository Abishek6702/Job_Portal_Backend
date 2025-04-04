const Interview = require("../models/interviewPrepration");
exports.addInterview = async (req, res) => {
  try {
    const { topic, question, answer, level } = req.body;
    let finalAnswer = answer;

    if (req.file) {
      finalAnswer = `/uploads/${req.file.filename}`;
    }

    const interview = new Interview({
      topic,
      question,
      answer: finalAnswer,
      level,
    });
    await interview.save();
    res
      .status(201)
      .json({ message: "Interview question added successfully", interview });
  } catch (error) {
    res.status(500).json({ message: "Error adding interview question", error });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const { topic, question, answer, level } = req.body;
    let updateData = { topic, question, level };

    if (req.file) {
      updateData.answer = `/uploads/${req.file.filename}`;
    } else if (answer) {
      updateData.answer = answer;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedInterview)
      return res.status(404).json({ message: "Interview question not found" });

    res
      .status(200)
      .json({
        message: "Interview question updated successfully",
        updatedInterview,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating interview question", error });
  }
};

exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.status(200).json(interviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching interview questions", error });
  }
};

exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview)
      return res.status(404).json({ message: "Interview question not found" });
    res.status(200).json(interview);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching interview question", error });
  }
};

exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview)
      return res.status(404).json({ message: "Interview question not found" });
    res
      .status(200)
      .json({ message: "Interview question deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting interview question", error });
  }
};
