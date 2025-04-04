// controllers/lessonController.js
const mongoose = require("mongoose");
const { Lesson } = require("../models/Lesson");
const Course = require("../models/Course");

exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, duration, qnaSections, videoIds } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const newLesson = new Lesson({
      title,
      duration,
      qnaSections,
      videos: videoIds,
    });

    await newLesson.save();

    course.courseContent.push(newLesson._id);
    await course.save();

    res
      .status(201)
      .json({ message: "Lesson created successfully", lesson: newLesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, qnaSections, videos } = req.body;

    const lessonId = new mongoose.Types.ObjectId(id);

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findOne({ courseContent: lessonId });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found for this lesson" });
    }
    if (!course.instructorDetails) {
      console.error("Error: instructorDetails is missing in course");
      return res
        .status(500)
        .json({ message: "Instructor ID is missing in course data" });
    }

    if (
      req.user.role !== "admin" &&
      course.instructorDetails.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this lesson" });
    }

    if (title) lesson.title = title;
    if (duration) lesson.duration = duration;
    if (qnaSections) lesson.qnaSections = qnaSections;
    if (videos) lesson.videos = videos;

    lesson.lastUpdated = Date.now();
    await lesson.save();

    res.status(200).json({ message: "Lesson updated successfully", lesson });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    console.log("Lesson found:", lesson);

    const course = await Course.findOne({ courseContent: id });
    console.log("Course associated with the lesson:", course);

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course associated with this lesson not found" });
    }

    if (!course.instructorDetails) {
      console.error("Error: instructorDetails is missing in course");
      return res
        .status(500)
        .json({ message: "Instructor ID is missing in course data" });
    }

    console.log("Course Instructor ID:", course.instructorDetails);
    console.log("Logged-in User ID:", req.user._id);

    if (
      course.instructorDetails.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this lesson" });
    }

    course.courseContent = course.courseContent.filter(
      (contentId) => !contentId.equals(id)
    );
    console.log("Updated Course Content:", course.courseContent);
    await course.save();
    await Lesson.findByIdAndDelete(id);

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("courseContent");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ lessons: course.courseContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate("videos");
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({ lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
