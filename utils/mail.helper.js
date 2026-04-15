const nodemailer = require("nodemailer");
const path = require("path");

// ================= CREATE TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // avoids SSL issues in some environments
  },
});

// ================= VERIFY CONNECTION (OPTIONAL BUT PRO) =================
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP Error:", err);
  } else {
    console.log("SMTP Ready ✅");
  }
});

// ================= SEND EMAIL FUNCTION =================
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Escape Beyond Travel ✈️" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      html,

      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../utils/assets/logo.png"),
          cid: "logo",
        }
      ],
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};

module.exports = { sendEmail };