const mongoose = require("mongoose");
const Job = require("../models/job");
const Company = require("../models/company");


const parseJson = (data, defaultValue = []) => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    return defaultValue;
  }
};

exports.createJob = async (req, res) => {
  try {
    const { companyId, companyOverview, tools, additionalBenefits, jobDescription, requirements, reportingTo, deadlineToApply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: "Invalid companyId" });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (req.user.role !== 'admin' && company.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to create jobs for this company" });
    }

    const jobData = {
      companyId,
      companyName: req.body.companyName,
      position: req.body.position,
      applyMethod: req.body.applyMethod,
      location: req.body.location,
      workplace: req.body.workplace,
      whereYouWillDoIt: req.body.whereYouWillDoIt,
      interviewProcess: req.body.interviewProcess,
      reportingTo: parseJson(reportingTo, []),
      team: req.body.team,
      jobDescription: parseJson(jobDescription, []),
      requirements: parseJson(requirements, []),
      salaryRange: req.body.salaryRange,
      tools: parseJson(tools, []),
      additionalBenefits: parseJson(additionalBenefits, []),
      companyOverview: parseJson(companyOverview, {}),
      deadlineToApply,
    };

    const job = await Job.create(jobData);
    await Company.findByIdAndUpdate(companyId, { $push: { jobs: job._id } });

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("companyId", "company_name company_logo location");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("companyId");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const job = await Job.findById(id).populate('companyId', 'createdBy');
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!job.companyId || !job.companyId.createdBy) {
      return res.status(400).json({ error: "Invalid Company data or createdBy missing" });
    }

    if (req.user.role !== 'admin' && job.companyId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to update this job" });
    }

    const updateData = {
      ...req.body,
      reportingTo: parseJson(req.body.reportingTo, []),
      jobDescription: parseJson(req.body.jobDescription, []),
      requirements: parseJson(req.body.requirements, []),
      tools: parseJson(req.body.tools, []),
      additionalBenefits: parseJson(req.body.additionalBenefits, []),
      companyOverview: parseJson(req.body.companyOverview, {}),
    };

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedJob) {
      return res.status(500).json({ error: "Job update failed" });
    }

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    const job = await Job.findById(id).populate('companyId', 'createdBy');
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!job.companyId || !job.companyId.createdBy) {
      return res.status(400).json({ error: "Invalid Company data or createdBy missing" });
    }

    if (req.user.role !== 'admin' && job.companyId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this job" });
    }

    await Job.findByIdAndDelete(id);
    await Company.findByIdAndUpdate(job.companyId._id, { $pull: { jobs: job._id } });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
