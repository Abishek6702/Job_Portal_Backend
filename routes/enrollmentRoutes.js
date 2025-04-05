const express = require("express");
const router = express.Router();
const {
  enrollUserToCourse,
  getMyCourses,
  unenrollUserFromCourse,
  getStudentsInCourse,
} = require("../controllers/enrollmentController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/enroll", verifyToken, enrollUserToCourse);
router.get("/my-courses", verifyToken, getMyCourses);
router.post("/unenroll", verifyToken, unenrollUserFromCourse);
router.get("/:courseId/students", verifyToken, getStudentsInCourse);

module.exports = router;
