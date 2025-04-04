const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true },
  userData: { type: Object, required: true },
  pdfPath: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

});

module.exports = mongoose.model('Resume', resumeSchema);
