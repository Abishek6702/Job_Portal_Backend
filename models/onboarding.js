const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  postalcode: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  salaryperiod: {
    type: String,
    required: true
  },
  jobtitle: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Onboarding = mongoose.model('Onboarding', onboardingSchema);
module.exports = Onboarding;
