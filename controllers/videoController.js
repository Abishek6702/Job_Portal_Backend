const mongoose = require("mongoose");
const Video = require("../models/Video");
const { Lesson } = require("../models/Lesson");
const Course = require("../models/Course");

exports.uploadVideo = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, duration } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findOne({ courseContent: { $in: [lessonId] } });
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found for the given lesson" });
    }

    if (
      req.user.role !== "admin" &&
      course.instructorDetails.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to upload video for this lesson" });
    }

    const videoFilePath = req.files?.video?.[0]?.path;
    const resourceFiles = req.files?.resources?.map((file) => file.path) || [];

    if (!videoFilePath) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const video = await Video.create({
      title,
      description,
      duration,
      lessonId,
      videoFile: videoFilePath,
      resources: resourceFiles,
    });

    lesson.videos.push(video._id);
    await lesson.save();

    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const videos = await Video.find({ lessonId });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const lesson = await Lesson.findById(video.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findOne({ courseContent: video.lessonId });
    if (!course) {
      return res.status(404).json({ message: "Associated course not found" });
    }

    if (
      req.user.role !== "admin" &&
      course.instructorDetails.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this video" });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.duration = duration || video.duration;

    if (req.files?.video?.[0]) {
      video.videoFile = req.files.video[0].path;
    }

    if (req.files?.resources) {
      video.resources = req.files.resources.map((file) => file.path);
    }

    await video.save();

    res.status(200).json({ message: "Video updated successfully", video });
  } catch (error) {
    console.error("[UPDATE] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const lesson = await Lesson.findById(video.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findOne({ courseContent: video.lessonId });
    if (!course) {
      return res.status(404).json({ message: "Associated course not found" });
    }

    if (
      req.user.role !== "admin" &&
      course.instructorDetails.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this video" });
    }

    lesson.videos = lesson.videos.filter(
      (vid) => vid.toString() !== video._id.toString()
    );
    await lesson.save();

    await Video.findByIdAndDelete(id);

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("[DELETE] Error:", error);
    res.status(500).json({ error: error.message });
  }
};
