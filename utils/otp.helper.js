const bcrypt = require("bcryptjs");

// generate 6 digit OTP
exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// hash OTP
exports.hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// compare OTP
exports.compareOtp = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};