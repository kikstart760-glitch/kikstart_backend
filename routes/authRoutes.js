const express = require("express");
const authController = require("../controller/authController");

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/signup-otp", authController.verifySignupOTP);
router.post("/login", authController.login);
router.post("/login-otp", authController.verifyLoginOTP);
router.post("/forgot-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);



module.exports = router;