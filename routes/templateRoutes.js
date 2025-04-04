const express = require("express");
const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/templateController");
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, authorizeRoles('admin'), createTemplate); 
router.get("/", verifyToken, getTemplates); 
router.get("/:id", verifyToken, getTemplateById); 
router.put("/:id", verifyToken, authorizeRoles('admin'), updateTemplate); 
router.delete("/:id", verifyToken, authorizeRoles('admin'), deleteTemplate);

module.exports = router;
