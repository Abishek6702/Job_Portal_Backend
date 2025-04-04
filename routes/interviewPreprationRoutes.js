const express = require("express");
const {
  addInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewPreprationController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("answer"),
  addInterview
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("answer"),
  updateInterview
);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteInterview);

router.get("/", verifyToken, getAllInterviews);
router.get("/:id", verifyToken, getInterviewById);

module.exports = router;
