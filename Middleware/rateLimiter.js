const rateLimit = require("express-rate-limit");

exports.otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  message: "Too many OTP requests, try later"
});