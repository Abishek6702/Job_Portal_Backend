const mongoose = require("mongoose");

const Course = require("../models/Course");
const { Lesson } = require("../models/Lesson");
const  Video  = require("../models/Video");

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, language, instructorDetails, ...rest } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(instructorDetails)) {
      return res
        .status(400)
        .json({ error: "Invalid instructorDetails ObjectId" });
    }

    const newCourse = new Course({
      title,
      description,
      price,
      language,
      instructorDetails,
      createdBy: req.user.id,
      status: "Pending",
      ...rest,
    });

    await newCourse.save();
    res
      .status(201)
      .json({
        message: "Course created successfully and pending admin approval",
        course: newCourse,
      });
  } catch (error) {
    console.error("Validation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (
      req.user.role !== "admin" &&
      course.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this course" });
    }

    Object.assign(course, req.body);
    course.status = "Pending";
    await course.save();

    res
      .status(200)
      .json({ message: "Course updated and pending admin approval", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id)
      .populate("instructorDetails", "name")
      .populate("studentsEnrolled", "name")
      .populate("userReviews.user", "name");

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.status !== "Approved" && req.user.role === "employee") {
      return res
        .status(403)
        .json({ message: "Access denied. Course is not approved yet." });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).populate("courseContent");

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (
      req.user.role !== "admin" &&
      course.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized to delete this course" });
    }

    // Delete all videos inside each lesson
    for (const lesson of course.courseContent) {
      if (lesson.videos && lesson.videos.length > 0) {
        await Video.deleteMany({ _id: { $in: lesson.videos } });
      }
      await Lesson.findByIdAndDelete(lesson._id); // ✅ this will now work
    }

    // Delete the course
    await Course.findByIdAndDelete(id);

    res.status(200).json({ message: "Course and associated lessons/videos deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const course = await Course.findById(id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    course.status = status;
    await course.save();

    res
      .status(200)
      .json({ message: `Course ${status.toLowerCase()} successfully`, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const courses = await Course.find(filter)
      .populate("instructorDetails", "name")
      .sort({ lastUpdated: -1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
