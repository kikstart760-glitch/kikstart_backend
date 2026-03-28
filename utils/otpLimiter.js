exports.applyOtpSecurity = (user, limit = 5) => {
  const now = new Date();

  const isSameDay =
    user.otpRequestDate &&
    new Date(user.otpRequestDate).toDateString() === now.toDateString();

  // 🔄 Reset if new day
  if (!isSameDay) {
    user.otpRequestCount = 0;
    user.otpRequestDate = now;
  }

  // 🚫 Daily limit check
  if (user.otpRequestCount >= limit) {
    throw new Error("Daily OTP limit reached. Try again tomorrow.");
  }

  // 🚫 1 MINUTE COOLDOWN CHECK
  if (user.otpCooldown && user.otpCooldown > Date.now()) {
    const seconds = Math.ceil((user.otpCooldown - Date.now()) / 1000);
    throw new Error(`Wait ${seconds}s before retry`);
  }

  // ✅ UPDATE STATE HERE (IMPORTANT)
  user.otpRequestCount += 1;
  user.otpCooldown = Date.now() + 60 * 1000;
};