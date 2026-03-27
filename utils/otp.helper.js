import bcrypt from "bcrypt";

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

exports.compareOtp = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};