// In Lesson.js
const mongoose = require("mongoose");
const { VideoSchema } = require("./Video");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  duration: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
  qnaSections: [{ type: String }],
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  isCompleted: { type: Boolean, default: false },
});

const Lesson = mongoose.model("Lesson", LessonSchema);

module.exports = { Lesson, LessonSchema };  
