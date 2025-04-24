const mongoose = require("mongoose");
const Job = require("../models/job");
const Company = require("../models/company");

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Only employers can create jobs" });
    }

    const parseJson = (data, fallback) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data || fallback;
      } catch (err) {
        return fallback;
      }
    };

    const companyLogo = req.files?.["companyLogo"]?.[0]?.path || null;
    const companyImages =
      req.files?.["companyImages"]?.map((file) => file.path) || [];

    let {
      companyId,
      companyName,
      position,
      applyMethod,
      location,
      workplace,
      whereYouWillDoIt,
      interviewProcess,
      tools,
      reportingTo,
      team,
      jobDescription,
      requirements,
      salaryRange,
      additionalBenefits,
      companyOverview,
      deadlineToApply,
    } = req.body;

    // Parse fields if needed
    tools = parseJson(tools, []);
    reportingTo = parseJson(reportingTo, []);
    jobDescription = parseJson(jobDescription, []);
    requirements = parseJson(requirements, []);
    additionalBenefits = parseJson(additionalBenefits, []);
    companyOverview = parseJson(companyOverview, {});

    companyOverview.companyImages = companyImages;

    const job = await Job.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      companyName,
      position,
      applyMethod,
      location,
      workplace,
      whereYouWillDoIt,
      interviewProcess,
      tools,
      reportingTo,
      team,
      jobDescription,
      requirements,
      salaryRange,
      additionalBenefits,
      companyOverview,
      companyLogo,
      deadlineToApply,
      postedAt: new Date(),
    });
    await Company.findByIdAndUpdate(
      companyId,
      { $push: { jobs: job._id } },
      { new: true }
    );

    res.status(201).json(job);
  } catch (error) {
    console.error("Create Job Error:", error.stack || error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
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
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Fetch the company to get the createdBy
    const company = await Company.findById(job.companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found for this job" });
    }

    if (
      req.user.role !== "admin" &&
      company.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const parseJson = (data, fallback) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data || fallback;
      } catch (err) {
        return fallback;
      }
    };

    const companyLogo = req.files?.["companyLogo"]?.[0]?.path || null;
    const companyImages =
      req.files?.["companyImages"]?.map((file) => file.path) || [];

    let {
      companyName,
      position,
      applyMethod,
      location,
      workplace,
      whereYouWillDoIt,
      interviewProcess,
      tools,
      reportingTo,
      team,
      jobDescription,
      requirements,
      salaryRange,
      additionalBenefits,
      companyOverview,
      deadlineToApply,
    } = req.body;

    tools = parseJson(tools, []);
    reportingTo = parseJson(reportingTo, []);
    jobDescription = parseJson(jobDescription, []);
    requirements = parseJson(requirements, []);
    additionalBenefits = parseJson(additionalBenefits, []);
    companyOverview = parseJson(companyOverview, {});
    companyOverview.companyImages = companyImages;

    const updateData = {
      companyName,
      position,
      applyMethod,
      location,
      workplace,
      whereYouWillDoIt,
      interviewProcess,
      tools,
      reportingTo,
      team,
      jobDescription,
      requirements,
      salaryRange,
      additionalBenefits,
      companyOverview,
      deadlineToApply,
    };

    if (companyLogo) updateData.companyLogo = companyLogo;

    // Clean up undefined/nulls
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error("Update Job Error:", error.stack || error.message);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Fetch the related company
    const company = await Company.findById(job.companyId);
    if (!company) {
      return res.status(404).json({ message: "Associated company not found" });
    }

    // Check permission
    if (
      req.user.role !== 'admin' &&
      company.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    // Remove job ID from company.jobs array
    company.jobs = company.jobs.filter(
      (jobId) => jobId.toString() !== req.params.id
    );
    await company.save();

    res.status(200).json({ message: "Job deleted and reference removed from company" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
