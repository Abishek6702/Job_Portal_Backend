const express = require("express");
const {
  generateResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");
const { verifyToken, authorizeRoles, checkResumeOwnership } = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/", verifyToken, authorizeRoles('employee'), generateResume); 
router.get("/", verifyToken, authorizeRoles('employee'), getAllResumes); 
router.get("/:id", verifyToken, authorizeRoles('employee'), checkResumeOwnership, getResumeById); 
router.put("/:id", verifyToken, authorizeRoles('employee'), checkResumeOwnership, updateResume); 
router.delete("/:id", verifyToken, authorizeRoles('employee'), checkResumeOwnership, deleteResume);

module.exports = router;
