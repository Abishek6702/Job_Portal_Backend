

const mongoose = require("mongoose");
const Course = require('../models/Course');
const User = require('../models/User');

const enrollUserToCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ message: 'Course or user not found' });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    user.enrolledCourses.push(courseId);
    course.studentsEnrolled.push(userId);

    await user.save();
    await course.save();

    res.status(200).json({ message: 'Enrollment successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('enrolledCourses');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ enrolledCourses: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const unenrollUserFromCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: 'Course or user not found' });
    }

    user.enrolledCourses = user.enrolledCourses.filter(
      id => id.toString() !== courseId
    );
    course.studentsEnrolled = course.studentsEnrolled.filter(
      id => id.toString() !== userId
    );

    await user.save();
    await course.save();

    res.status(200).json({ message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during unenrollment' });
  }
};

const getStudentsInCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).populate('studentsEnrolled', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({ students: course.studentsEnrolled });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { enrollUserToCourse, getMyCourses, unenrollUserFromCourse, getStudentsInCourse };