const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: String,
    },
  ],
  isCompleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Quiz", QuizSchema);
