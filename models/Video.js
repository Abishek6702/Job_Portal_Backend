const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  description: { type: String },
  videoFile: { type: String, required: true }, 
  duration: { type: String },
  sourceFile: { type: String }, 
  resources: [{ type: String }] 
});

module.exports = mongoose.model('Video', VideoSchema);
