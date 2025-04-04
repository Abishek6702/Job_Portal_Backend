const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    videoIndex: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", ProgressSchema);
