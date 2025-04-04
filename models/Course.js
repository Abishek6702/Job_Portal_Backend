const mongoose = require("mongoose");
const { LessonSchema } = require("./Lesson");  

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  ranking: [
    {
      type: { type: String, enum: ["BestSeller", "TopRanking", "Trending"] },
      value: { type: Number },
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastUpdated: { type: Date, default: Date.now },
  language: [{ type: String, required: true }],
  totalRatings: { type: Number, default: 0 },
  totalLearners: { type: Number, default: 0 },
  relatedTopics: [{ type: String }],
  whatYouWillLearn: [{ type: String }],
  includes: [{ type: String }],
  companiesOffering: [{ type: String }],
  demoVideo: { type: String },
  courseContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  requirements: [{ type: String }],
  description: { type: String, required: true },
  coveringTopics: [{ type: String }],
  targetAudience: { type: String },
  instructorDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  userReviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
      comment: { type: String },
    },
  ],
});

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;
