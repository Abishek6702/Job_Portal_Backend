const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-employee', authController.registerEmployee);
router.post('/register-employer', authController.registerEmployer);
router.post('/register-admin', authController.registerAdmin);
router.post('/register-instructor', authController.registerInstructor);

router.post('/login-instructor', authController.loginInstructor);

router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-verification-otp', authController.resendVerificationOTP);
router.post('/send-reset-otp', authController.sendResetOTP);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);
router.get('/:id', authController.getUserById);

module.exports = router;
