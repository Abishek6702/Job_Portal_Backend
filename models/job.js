const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  companyName: { type: String, required: true },
  companyLogo: String,
  position: { type: String, required: true },
  applyMethod: String,
  location: String,
  workplace: String,
  whereYouWillDoIt: String,
  interviewProcess: String,
  tools: [String],
  reportingTo: [String],
  team: String,
  jobDescription: [{ title: String, content: [String] }],
  requirements: [{ title: String, content: [String] }],
  salaryRange: String,
  additionalBenefits: [String],
  companyOverview: {
    founded: { type: String },
    type: { type: String },
    industry: { type: String },
    sector: { type: String },
    revenue: { type: String },
    size: { type: String },
    companyImages: [{ type: String }],
  },
  deadlineToApply: { type: Date },
  postedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);