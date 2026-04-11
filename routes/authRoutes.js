const express = require("express");
const authController = require("../controller/authController");
const { otpLimiter } = require("../Middleware/rateLimiter");

const router = express.Router();

// Auth routes
router.post("/sign-up", otpLimiter, authController.signUp);
router.post("/login", otpLimiter, authController.login);
router.post("/forgot-password", otpLimiter, authController.forgetPassword);
router.post("/resend-otp", otpLimiter, authController.resendOtp);

// OTP verification routes
router.post("/signup-otp", authController.verifySignupOTP);
router.post("/login-otp", authController.verifyLoginOTP);
router.post("/verify-otp", authController.verifyOtp);

// Password reset route
router.post("/reset-password", authController.resetPassword);

// Token refresh route
router.post("/refresh-token", authController.refreshSession);

// Logout route
router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAll);


module.exports = router;