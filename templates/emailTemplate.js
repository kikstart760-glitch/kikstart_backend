// ================= BASE TEMPLATE =================
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, sans-serif;
  }

  .container {
    max-width: 600px;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }

  .header {
    background: linear-gradient(135deg, #ff416c, #ff4b2b);
    text-align: center;
    padding: 20px;
  }

  .header img {
    width: 120px;
  }

  .content {
    padding: 30px;
    color: #333;
  }

  .title {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .text {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .otp {
    font-size: 28px;
    letter-spacing: 8px;
    text-align: center;
    background: #f1f3f6;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    font-weight: bold;
  }

  .btn {
    display: inline-block;
    padding: 12px 25px;
    background: #ff416c;
    color: #fff !important;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
  }

  .footer {
    text-align: center;
    font-size: 12px;
    color: #888;
    padding: 20px;
    background: #fafafa;
  }
</style>
</head>

<body>
  <div class="container">
    <div class="header">
      <img src="cid:logo" />
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      Need help? support@kikstart.com
    </div>
  </div>
</body>
</html>
`;


// ================= AUTH EMAILS =================

// Register Success
export const registerSuccessTemplate = (name) =>
  baseTemplate(`
    <div class="title">Welcome to KikStart, ${name} 🎉</div>
    <p class="text">Your account has been successfully created.</p>
    <p class="text">Start exploring and enjoy 🚀</p>
    <a href="#" class="btn">Get Started</a>
  `);

// Register OTP
export const registerOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div class="title">Verify Your Account</div>
    <p class="text">Hi ${name}, use the OTP below:</p>
    <div class="otp">${otp}</div>
    <p class="text">Valid for 10 minutes. Do not share.</p>
  `);

// Login OTP
export const loginOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div class="title">Login Verification</div>
    <p class="text">Hello ${name}, your login OTP:</p>
    <div class="otp">${otp}</div>
    <p class="text">If not you, secure your account immediately.</p>
  `);

// Login Success
export const loginSuccessTemplate = (
  name,
  date,
  location,
  device,
  resetLink
) =>
  baseTemplate(`
    <div class="title">Login Successful, ${name} ✅</div>
    <p class="text">
      Hi ${name}, you have successfully logged into your KikStart account.
    </p>
    <p class="text">
      If this was you, you can safely continue using our platform and explore all features 🚀
    </p>
    <p class="text">
      <strong>Login Details:</strong><br/>
      📅 Date: ${date}<br/>
      🌍 Location: ${location}<br/>
      📱 Device: ${device}
    </p>
    <p class="text">
      If this wasn't you, please secure your account immediately by resetting your password.
    </p>
    <a href="${resetLink}" class="btn">Secure My Account</a>
  `);
  
// Forgot Password OTP
export const forgotPasswordOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div class="title">Password Reset OTP</div>
    <p class="text">Hello ${name}, your OTP:</p>
    <div class="otp">${otp}</div>
    <p class="text">Expires soon. Keep secure.</p>
  `);

// Reset Password Link
export const resetPasswordTemplate = (name, link) =>
  baseTemplate(`
    <div class="title">Reset Your Password</div>
    <p class="text">Hi ${name}, click below:</p>
    <a href="${link}" class="btn">Reset Password</a>
    <p class="text">Link expires in 15 minutes.</p>
  `);

// Password Changed
export const passwordChangedTemplate = (name) =>
  baseTemplate(`
    <div class="title">Password Changed Successfully</div>
    <p class="text">Hi ${name}, your password was updated.</p>
    <p class="text">If this wasn’t you, contact support immediately.</p>
    <a href="mailto:support@kikstart.com" class="btn">Contact Support</a>
  `);
// Resend OTP
export const resendOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div class="title">OTP Resent Successfully 🔄</div>
    <p class="text">
      Hi ${name}, as requested, we have resent your One-Time Password (OTP).
    </p>
    <div class="otp">${otp}</div>
    <p class="text">
      This OTP is valid for the next 10 minutes. Please use it to continue your verification process.
    </p>
    <p class="text">
      If you did not request this, please ignore this email or secure your account immediately.
    </p>
  `);