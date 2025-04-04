const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: String,
  description: String,
  submissionLink: String,
  isCompleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Project", ProjectSchema);
