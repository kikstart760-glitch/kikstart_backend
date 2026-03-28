exports.checkOtpBlock = (user) => {
  // 🚫 If blocked
  if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) {
    const seconds = Math.ceil(
      (user.otpBlockedUntil - Date.now()) / 1000
    );

    throw new Error(`Too many wrong attempts. Try again in ${seconds}s`);
  }
};