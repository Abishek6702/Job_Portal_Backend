const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "master"],
    required: true,
  },
  postedAt: { type: Date, default: Date.now },
});

const Interview = mongoose.model("Interview", interviewSchema);
module.exports = Interview;
