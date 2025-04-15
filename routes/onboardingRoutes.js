const express = require('express');
const { updateOnboardingStep, saveOnboardingProgress, getOnboardingStatus } =require('../controllers/onboardingController.js');
const {verifyToken} = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/update', verifyToken, updateOnboardingStep);
router.post("/save-progress",verifyToken, saveOnboardingProgress);

// Route to get onboarding progress status
router.get("/onboarding-status/:userId",verifyToken, getOnboardingStatus);

module.exports = router;
