const user = require('../models/authModel');
const Session = require('../models/sessionModel');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../Middleware/Middleware');
const bcrypt = require('bcryptjs')
const { 
  generateOtp,
  hashOtp,
  compareOtp
} = require('../utils/otp.helper');
const { applyOtpSecurity } = require('../utils/otpLimiter');
const { checkOtpBlock } = require('../utils/otpGuard');
const { sendEmail } = require('../utils/mail.helper');
const { formatPhone } = require("../utils/phone");
const { sendSMS } = require('../utils/sms.helper');
const { otpSMS } = require("../templates/smsTemplate");
const {
  registerSuccessTemplate,
  registerOtpTemplate,
  loginOtpTemplate,
  loginSuccessTemplate,
  forgotPasswordOtpTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  resendOtpTemplate
} = require('../templates/emailTemplate');
const {
  getDevice,
  getIP,
  getLocation,
} = require("../utils/info.helper");


exports.signUp = async (req, res, next) => {
  try {
    const { name, email, phone, location, passcode, password } = req.body;
    if (!name || !email || !phone || !location || !passcode || !password) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide all required fields!!!"
        })
      );
    }


    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    
    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (checkexist) {
      return next(
        res.status(409).json({
          status: "fail",
          message: "User already exist with this email or phone number"
        })
      );
    }

    try {
      applyOtpSecurity(checkexist || { email, phone: formattedPhone });
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password, salt);
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);


    const userData = new user({
      name,
      email,
      phone: formattedPhone,
      location,
      passcode,
      password: hashpassword,
      otp: hashedOtp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
      otpRequestDate: new Date(),
      otpRequestCount: 1,
      otpCooldown: Date.now() + 60 * 1000,
    });
    await userData.save();

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to KikStart! Verify Your Account",
        html: registerOtpTemplate(name, otp)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    const message = otpSMS({
      otp: otp,
      type: "signup", // signup | login | reset | resend
    });

    await sendSMS({
      to: formattedPhone,
      message,
    });

    res.status(201).json({
      status: "success",
      message: "OTP sent for verification Process",
      data: userData
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

exports.verifySignupOTP = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;
    if ((!email && !phone) || !otp) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide email or phone and otp!!!"
        })
      );
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist with this email or phone number"
        })
      );
    }

    try {
      await checkOtpBlock(checkexist);
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    if (checkexist.otpExpiry < Date.now()) {
      return next(
        res.status(410).json({
          status: "fail",
          message: "OTP has expired. Please request a new one."
        })
      );
    }

    const cleanOtp = otp.trim();

    if (!checkexist.otp) {
      return res.status(400).json({
        status: "fail",
        message: "OTP not found. Please request again.",
      });
    }

    const isOtpValid = await compareOtp(cleanOtp, checkexist.otp);

    if (!isOtpValid) {
      checkexist.otpAttempts += 1;

      if (checkexist.otpAttempts >= 5) {
        checkexist.otpBlockedUntil = Date.now() + 30 * 60 * 1000;
        checkexist.otpAttempts = 0;
      }

      await checkexist.save();

      return res.status(401).json({
        status: "fail",
        message: "Invalid OTP. Please try again.",
      });
    }

    checkexist.isverified = true;
    checkexist.otp = null;
    checkexist.otpExpiry = null;
    checkexist.deleteAt = null;
    checkexist.otpRequestCount = 0;
    checkexist.otpCooldown = null;
    checkexist.otpAttempts = 0;
    checkexist.otpBlockedUntil = null;
    await checkexist.save();


    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "Welcome to KikStart - Registration Successful 🎉",
        html: registerSuccessTemplate(checkexist.name)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      data: checkexist,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};



exports.login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide email or phone and password!!!",
        })
      );
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist with this email or phone number",
        })
      );
    }

    if (!checkexist.isverified) {
      return next(
        res.status(403).json({
          status: "fail",
          message: "Please verify your account first",
        })
      );
    }

    const checkpassword = await bcrypt.compare(password, checkexist.password);
    if (!checkpassword) {
      return (
        res.status(401).json({
          status: "fail",
          message: "Invalid password. Please provide the correct password to login.",
        })
      );
    }

    try {
      applyOtpSecurity(checkexist);
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
  
    checkexist.otp = hashedOtp;
    checkexist.otpExpiry = Date.now() + 10 * 60 * 1000;
    await checkexist.save();

    try {
      await sendEmail({
        to: checkexist.email,
        subject: "KikStart Login OTP - Verify Your Identity 🔐",
        html: loginOtpTemplate(checkexist.name, otp)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    const message = otpSMS({
      otp: otp,
      type: "login", // signup | login | reset | resend
    });

    await sendSMS({
      to: checkexist.phone,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent for verification Process",
      data: checkexist
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};


exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;
    if ((!email && !phone) || !otp) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide email or phone and otp!!!"
        })
      );
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist with this email or phone number"
        })
      );
    }

    try {
      await checkOtpBlock(checkexist);
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    if (checkexist.otpExpiry < Date.now()) {
      return next(
        res.status(410).json({
          status: "fail",
          message: "OTP has expired. Please request a new one."
        })
      );
    }

    const cleanOtp = otp.trim();
    const isOtpValid = await compareOtp(cleanOtp, checkexist.otp);
    if (!isOtpValid) {
      checkexist.otpAttempts += 1;
      if (checkexist.otpAttempts >= 5) {
        checkexist.otpBlockedUntil = Date.now() + 30 * 60 * 1000; // Block for 30 minutes
        checkexist.otpAttempts = 0; // Reset attempts after blocking
      }
      await checkexist.save();
      return next(
        res.status(401).json({
          status: "fail",
          message: "Invalid OTP provided or wrong OTP entered multiple times. Please try again later."
        })
      );
    }


    checkexist.otp = null;
    checkexist.otpExpiry = null;
    checkexist.otpRequestCount = 0;
    checkexist.otpCooldown = null;
    checkexist.otpAttempts = 0;
    checkexist.otpBlockedUntil = null;
    await checkexist.save();

    const device = getDevice(req);
    const ip = getIP(req);
    const location = await getLocation(ip);

    console.log (device, ip, location)


    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "KikStart Login Successful - New Device Alert ✅",
        html: loginSuccessTemplate(
          checkexist.name,
          new Date().toLocaleString(),
          device,
          location,
          "#"
        )
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }


    const payload = {
      _id: checkexist._id , 
      role: checkexist.role,
    }
    const accessToken = generateAccessToken(payload);
    const refreshPayload = {
      _id: checkexist._id,
      role: checkexist.role
    }
    const refreshToken = generateRefreshToken(refreshPayload);

    // ✅ Create session with role
    await Session.create({
      userId: checkexist._id,
      role: checkexist.role,
      refreshToken,
      device,
      ip,
      location,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      accessToken,
      role: checkexist.role,
      data: checkexist,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide Email or Phone !!!"
        })
      );
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist with this email or phone number",
        })
      );
    }

    try {
      applyOtpSecurity(checkexist);
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    checkexist.otp = hashedOtp;
    checkexist.otpExpiry = Date.now() + 5 * 60 * 1000;
    await checkexist.save();

    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "KikStart Password Reset OTP - Verify Your Identity 🔐",
        html: forgotPasswordOtpTemplate(checkexist.name, otp)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    const message = otpSMS({
      otp: otp,
      type: "reset", // signup | login | reset | resend
    });

    await sendSMS({
      to: checkexist.phone,
      message,
    });

    res.status(200).json({
      status: "Success",
      message: "Otp sent successfully"
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};


exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;
    if ((!email && !phone) || !otp) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide email or phone and otp!!!"
        })
      );
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist"
        })
      );
    }

    try {
      await checkOtpBlock(checkexist);
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    if (checkexist.otpExpiry < Date.now()) {
      return next(
        res.status(410).json({
          status: "fail",
          message: "OTP has expired. Please request a new one."
        })
      );
    }

    const cleanOtp = otp.trim();
    const isOtpValid = await compareOtp(cleanOtp, checkexist.otp);
    if (!isOtpValid) {
      checkexist.otpAttempts += 1;
      if (checkexist.otpAttempts >= 5) {
        checkexist.otpBlockedUntil = Date.now() + 30 * 60 * 1000; // Block for 30 minutes
        checkexist.otpAttempts = 0; // Reset attempts after blocking
      }
      await checkexist.save();
      return next(
        res.status(401).json({
          status: "fail",
          message: "Invalid OTP provided or wrong OTP entered multiple times. Please try again later."
        })
      );
    }

    checkexist.otp = null;
    checkexist.otpExpiry = null;
    checkexist.otpRequestCount = 0;
    checkexist.otpCooldown = null;
    checkexist.otpAttempts = 0;
    checkexist.otpBlockedUntil = null;
    checkexist.isOtpVerified = true;
    await checkexist.save();

    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "Reset Your KikStart Password - OTP Verified ✅",
        html: resetPasswordTemplate(checkexist.name, "#")
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      data: checkexist,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};


exports.resetPassword = async (req, res, next) => {
  try {
    const { email, phone, password, confirmPassword } = req.body;
    if ((!email && !phone) || !password || !confirmPassword) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide email or phone and password and confirm password!!!",
        })
      );
    }

    if (password !== confirmPassword) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Password and confirm password do not match. Please provide matching passwords.",
        })
      );
    } 

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist with this email or phone number",
        })
      );
    }

    if (!checkexist.isOtpVerified) {
      return res.status(403).json({
        status: "fail",
        message: "OTP verification required before resetting password",
      });
    }

    const checkpassword = await bcrypt.compare(password, checkexist.password);
    if (checkpassword) {
      return (
        res.status(409).json({
          status: "fail",
          message: "Password already used. Try a new one.",
        })
      );
    }

    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password, salt);
    const changePassword = await checkexist.updateOne({ password: hashpassword });
    checkexist.isOtpVerified = false;
    await checkexist.save();

    await Session.updateMany(
      { userId: checkexist._id },
      { isValid: false }
    );

    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "Confirmation of Password Change - Your KikStart Account 🔐",
        html: passwordChangedTemplate(checkexist.name)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    console.log(changePassword)

    res.status(200).json({
      status: "Success",
      message: "Password reset successfully",
      data: checkexist
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};


exports.resendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide Email or Phone !!!"
        })
      );
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhone(phone);
      if (!formattedPhone) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid phone number format. Please provide a valid phone number."
        });
      }
    }

    const checkexist = await user.findOne({ $or: [{ email }, { phone: formattedPhone }] });
    if (!checkexist) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "User does not exist with this email or phone number",
        })
      );
    }

    
    try {
      applyOtpSecurity(checkexist);
    } catch (err) {
      return next(
        res.status(429).json({
          status: "fail",
          message: err.message,
        })
      );
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    
    checkexist.otp = hashedOtp;
    checkexist.otpExpiry = Date.now() + 5 * 60 * 1000;
    await checkexist.save();


    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "KikStart OTP Resend - Verify Your Identity 🔐",
        html: resendOtpTemplate(checkexist.name, otp)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    const message = otpSMS({
      otp: otp,
      type: "resend", // signup | login | reset | resend
    });

    await sendSMS({
      to: checkexist.phone,
      message,
    });

    res.status(200).json({
      status: "Success",
      message: "Otp sent successfully"
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};


exports.refreshSession = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "No session"
      });
    }

    // ✅ Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // ✅ Find session in DB
    const session = await Session.findOne({
      refreshToken: token,
      isValid: true
    });

    if (!session) {
      return res.status(403).json({
        message: "Invalid session",
      });
    }

    // 🔐 Detect token reuse attack
    if (session.refreshToken !== token) {
      await Session.updateMany(
        { userId: decoded._id },
        { isValid: false }
      );

      return res.status(403).json({
        message: "Session compromised. Please login again."
      });
    }

    // ✅ Check DB expiry
    if (session.expiresAt < new Date()) {
      return res.status(403).json({
        message: "Session expired"
      });
    }

    // 🔁 ROTATE TOKENS (IMPORTANT 🔥)
    const newAccessToken = generateAccessToken({
      _id: decoded._id,
      role: decoded.role
    });

    const newRefreshToken = generateRefreshToken({
      _id: decoded._id,
      role: decoded.role
    });

    // ✅ UPDATE SESSION
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    session.isValid = true;
    await session.save();

    // 🍪 SET NEW COOKIE
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      accessToken: newAccessToken,
      role: decoded.role
    });

  } catch (err) {
    res.status(403).json({
      message: "Session expired or invalid"
    });
  }
};


exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    // If no token → already logged out
    if (!token) {
      return res.status(200).json({
        status: "success",
        message: "Already logged out"
      });
    }

    // Invalidate this session
    await Session.findOneAndUpdate(
      { refreshToken: token },
      { isValid: false }
    );

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // ✅ true in production (HTTPS)
      sameSite: "Strict"
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};



exports.logoutAll = async (req, res) => {
  try {
    const userId = req.user._id;

    // Invalidate all sessions of this user
    await Session.updateMany(
      { userId },
      { isValid: false }
    );

    // Clear cookie (current device)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // ✅ true in production
      sameSite: "Strict"
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out from all devices"
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};