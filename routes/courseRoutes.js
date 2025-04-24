const express = require("express");
const router = express.Router();
const {
  createCourse,
  updateCourse,
  getCourseById,
  deleteCourse,
  approveCourse,
  getAllCourses,
} = require("../controllers/courseController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles("instructor", "admin"),
  createCourse
);
router.put("/:id", verifyToken, updateCourse);
router.get("/:id", verifyToken, getCourseById);
router.delete("/:id", verifyToken, deleteCourse);
router.patch(
  "/:id/approve",
  verifyToken,
  authorizeRoles("admin"),
  approveCourse
);
router.get("/", verifyToken, getAllCourses);

module.exports = router;
