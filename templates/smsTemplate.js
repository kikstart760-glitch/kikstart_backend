const otpSMS = ({ otp, type, appName = "EscapeTravel", expiry = 5 }) => {
  const brand = `[${appName}]`;

  switch (type) {
    case "signup":
      return `${brand} Welcome! Your verification code is ${otp}. It expires in ${expiry} minutes. Do not share this code with anyone.`;

    case "login":
      return `${brand} Your login verification code is ${otp}. It is valid for ${expiry} minutes. If this wasn't you, please ignore this message.`;

    case "reset":
      return `${brand} Password reset code: ${otp}. This code will expire in ${expiry} minutes. Do not share it. If you didn't request this, secure your account immediately.`;

    case "resend":
      return `${brand} Your OTP has been resent: ${otp}. It is valid for ${expiry} minutes. Do not share this code. If you did not request this, please ignore this message.`;

    default:
      return `${brand} Your OTP is ${otp}. Valid for ${expiry} minutes. Do not share this code.`;
  }
};

module.exports = { otpSMS };