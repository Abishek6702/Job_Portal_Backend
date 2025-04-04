const express = require("express");
const {
  createTheme,
  getThemes,
  getThemeById,
  updateTheme,
  deleteTheme,
} = require("../controllers/themeController");
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, authorizeRoles('admin'), createTheme); 
router.get("/", verifyToken, getThemes); 
router.get("/:id", verifyToken, getThemeById); 
router.put("/:id", verifyToken, authorizeRoles('admin'), updateTheme); 
router.delete("/:id", verifyToken, authorizeRoles('admin'), deleteTheme);

module.exports = router;
