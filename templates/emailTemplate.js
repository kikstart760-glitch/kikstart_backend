// ================= BASE TEMPLATE =================
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#eaf2f7; font-family:Arial, sans-serif;">

  <!-- PREHEADER -->
  <div style="display:none; max-height:0; overflow:hidden;">
    Your luxury journey starts here ✈️
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eaf2f7;">
    <tr>
      <td align="center">

        <!-- MAIN CONTAINER -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding:30px 20px; background:#0f2f3a; color:#ffffff;">
              <img src="cid:logo" width="120" style="margin-bottom:10px;" />
              
              <div style="font-size:24px; font-weight:bold;">
                Escape Beyond Travel
              </div>

              <div style="font-size:14px; margin-top:8px;">
                Luxury Travel Reimagined
              </div>
            </td>
          </tr>

          <!-- CONTENT (CENTERED + CARD) -->
          <tr>
            <td align="center" style="background:#eaf2f7; padding:30px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #e3e8ee;">
                <tr>
                  <td align="center" style="padding:30px; color:#333; text-align:center;">
                    ${content}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#2bb3c0" style="padding:12px 25px;">
                    <a href="#" style="color:#ffffff; text-decoration:none; font-size:14px;">
                      Explore Destinations
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="
              background:#0f2f3a;
              color:#cfd8dc;
              text-align:center;
              padding:20px;
              font-size:12px;
            ">
              <div>Escape Beyond Travel</div>
              <div style="margin-top:5px;">Luxury journeys tailored for you</div>
              <div style="margin-top:8px; font-size:11px;">
                support@escapetravel.com
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;


// ================= COMMON STYLES =================
const titleStyle = `
  font-size:20px;
  font-weight:bold;
  margin-bottom:12px;
  color:#0f2f3a;
  text-align:center;
`;

const textStyle = `
  font-size:14px;
  line-height:1.7;
  color:#555;
  margin-bottom:15px;
  text-align:center;
`;

const otpStyle = `
  font-size:30px;
  letter-spacing:10px;
  text-align:center;
  background:#f0f4f8;
  padding:18px;
  margin:25px auto;
  font-weight:bold;
  color:#0f2f3a;
  display:inline-block;
`;

const btnStyle = `
  display:inline-block;
  padding:12px 25px;
  background:#2bb3c0;
  color:#ffffff;
  text-decoration:none;
  font-size:14px;
  margin-top:10px;
`;


// ================= AUTH EMAILS =================

// Register Success
const registerSuccessTemplate = (name) =>
  baseTemplate(`
    <div style="${titleStyle}">Welcome to Escape Beyond Travel, ${name} 🎉</div>
    <p style="${textStyle}">Your account has been successfully created.</p>
    <p style="${textStyle}">Start exploring premium destinations and experiences.</p>
  `);

// Register OTP
const registerOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div style="${titleStyle}">Verify Your Account</div>
    <p style="${textStyle}">Hi ${name}, use the OTP below:</p>
    <div style="${otpStyle}">${otp}</div>
    <p style="${textStyle}">Valid for 10 minutes. Do not share.</p>
  `);

// Login OTP
const loginOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div style="${titleStyle}">Login Verification</div>
    <p style="${textStyle}">Hello ${name}, your login OTP:</p>
    <div style="${otpStyle}">${otp}</div>
    <p style="${textStyle}">If this wasn't you, secure your account immediately.</p>
  `);

// Login Success
const loginSuccessTemplate = (name, date, location, device, resetLink) =>
  baseTemplate(`
    <div style="${titleStyle}">Login Successful, ${name} ✅</div>

    <p style="${textStyle}">
      You have successfully logged into your account.
    </p>

    <p style="${textStyle}">
      <strong>Login Details:</strong><br/>
      📅 Date: ${date}<br/>
      🌍 Location: ${location}<br/>
      📱 Device: ${device}
    </p>

    <p style="${textStyle}">
      If this wasn't you, secure your account immediately.
    </p>

    <a href="${resetLink}" style="${btnStyle}">
      Secure My Account
    </a>
  `);

// Forgot Password OTP
const forgotPasswordOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div style="${titleStyle}">Password Reset OTP</div>
    <p style="${textStyle}">Hello ${name}, your OTP:</p>
    <div style="${otpStyle}">${otp}</div>
    <p style="${textStyle}">Expires soon. Keep secure.</p>
  `);

// Reset Password Link
const resetPasswordTemplate = (name, link) =>
  baseTemplate(`
    <div style="${titleStyle}">Reset Your Password</div>
    <p style="${textStyle}">Hi ${name}, click below:</p>
    <a href="${link}" style="${btnStyle}">Reset Password</a>
    <p style="${textStyle}">Link expires in 15 minutes.</p>
  `);

// Password Changed
const passwordChangedTemplate = (name) =>
  baseTemplate(`
    <div style="${titleStyle}">Password Changed Successfully</div>
    <p style="${textStyle}">Hi ${name}, your password was updated.</p>
    <p style="${textStyle}">
      If this wasn’t you, contact support immediately.
    </p>
    <a href="mailto:support@escapetravel.com" style="${btnStyle}">
      Contact Support
    </a>
  `);

// Resend OTP
const resendOtpTemplate = (name, otp) =>
  baseTemplate(`
    <div style="${titleStyle}">OTP Resent Successfully 🔄</div>

    <p style="${textStyle}">
      Hi ${name}, we have resent your OTP.
    </p>

    <div style="${otpStyle}">${otp}</div>

    <p style="${textStyle}">
      Valid for 10 minutes. Do not share.
    </p>
  `);


// ================= EXPORT =================
module.exports = {
  registerSuccessTemplate,
  registerOtpTemplate,
  loginOtpTemplate,
  loginSuccessTemplate,
  forgotPasswordOtpTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  resendOtpTemplate,
};