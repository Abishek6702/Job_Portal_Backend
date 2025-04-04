// In Lesson.js
const mongoose = require("mongoose");
const Video = require("./Video");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  duration: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
  qnaSections: [{ type: String }],
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  isCompleted: { type: Boolean, default: false },
});

// ✅ Cascade delete videos when lesson is deleted
LessonSchema.pre("findOneAndDelete", async function (next) {
  const lessonId = this.getQuery()._id;
  const lesson = await this.model.findById(lessonId);

  if (lesson && lesson.videos.length > 0) {
    await Video.deleteMany({ _id: { $in: lesson.videos } });
  }

  next();
});

const Lesson = mongoose.model("Lesson", LessonSchema);

module.exports = { Lesson, LessonSchema };
