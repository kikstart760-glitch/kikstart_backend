const user = require('../models/authModel');
const {generateToken} = require('../Middleware/Middleware');
const bcrypt = require('bcryptjs')
const { generateOtp } = require('../utils/otp.helper');
const { sendEmail } = require('../utils/mail.helper');
const { formatPhone } = require("../utils/phone");
const { sendsms } = require('../utils/sms.helper');
const { otpSMS } = require("../templates/smsTemplate");
const {
  registerSuccessTemplate,
  registerOtpTemplate,
  loginOtpTemplate,
  loginSuccessTemplate,
  forgotPasswordOtpTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate
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


    const formattedPhone = null;
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
        res.status(400).json({
          status: "fail",
          message: "User already exist with this email or phone number"
        })
      );
    }

    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password, salt);
    const otp = generateOtp();


    const userData = new user({
      name,
      email,
      phone: formattedPhone,
      location,
      passcode,
      password: hashpassword,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000
    });
    await userData.save();


    const payload = {
      _id: userData._id
    }
    const token = generateToken(payload);
    console.log(token)

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
      type: "signup", // signup | login | reset
    });

    await sendsms({
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

    const formattedPhone = null;
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
        res.status(400).json({
          status: "fail",
          message: "User dose not exist with this email or phone number"
        })
      );
    }

    if (checkexist.otp !== otp) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Invalid OTP provided"
        })
      );
    }

    if (checkexist.otpExpiry < Date.now()) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "OTP has expired. Please request a new one."
        })
      );
    }

    checkexist.isverified = true;
    checkexist.otp = null;
    checkexist.otpExpiry = null;
    checkexist.deleteAt = undefined;
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


    const token = generateToken({ _id: checkexist._id });
    console.log(token);


    res.status(201).json({
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

    const formattedPhone = null;
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
        res.status(400).json({
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
        res.status(400).json({
          status: "fail",
          message: "Invalid password. Please provide the correct password to login.",
        })
      );
    }

    const otp = generateOtp();
    checkexist.otp = otp;
    checkexist.otpExpiry = Date.now() + 10 * 60 * 1000;
    await checkexist.save();

    const token = generateToken({ _id: checkexist._id });
    console.log(token);

    try {
      await sendEmail({
        to: email,
        subject: "KikStart Login OTP - Verify Your Identity 🔐",
        html: loginOtpTemplate(checkexist.name, otp)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }


    const message = otpSMS({
      otp: otp,
      type: "login", // signup | login | reset
    });

    await sendsms({
      to: formattedPhone,
      message,
    });

    res.status(200).json({
      token,
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

    const formattedPhone = null;
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
        res.status(400).json({
          status: "fail",
          message: "User dose not exist with this email or phone number"
        })
      );
    }

    if (checkexist.otp !== otp) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Invalid OTP provided"
        })
      );
    }

    if (checkexist.otpExpiry < Date.now()) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "OTP has expired. Please request a new one."
        })
      );
    }


    checkexist.otp = null;
    checkexist.otpExpiry = null;
    await checkexist.save();
    

    const device = getDevice(req);
    const ip = getIP(req);
    const location = await getLocation(ip);


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


    const token = generateToken({ _id: checkexist._id });
    console.log(token);


    res.status(201).json({
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

    const formattedPhone = null;
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
        res.status(400).json({
          status: "fail",
          message: "User dose not exist",
        })
      );
    }

    const otp = await generateOtp();
    checkexist.otp = otp;
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
      type: "reset", // signup | login | reset
    });

    await sendsms({
      to: formattedPhone,
      message,
    });

    const payload = {
      _id: checkexist._id
    }
    const token = generateToken(payload);
    console.log(token)

    res.status(200).json({
      status: "Success",
      message: "Otp send successfully"
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

    const formattedPhone = null;
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
        res.status(400).json({
          status: "fail",
          message: "User dose not exist"
        })
      );
    }

    if (checkexist.otp !== otp) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Invalid OTP"
        })
      );
    }

    if (checkexist.otpExpiry < Date.now()) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "OTP has expired"
        })
      );
    }

    checkexist.otp = null;
    checkexist.otpExpiry = null;
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

    res.status(201).json({
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
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password) {
      return next(
        res.status(400).json({
          status: "fail",
          message: "Please provide email or phone and password!!!",
        })
      );
    }

    const formattedPhone = null;
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
        res.status(400).json({
          status: "fail",
          message: "User dose not exist with this email or phone number",
        })
      );
    }

    const checkpassword = await bcrypt.compare(password, checkexist.password);
    if (checkpassword) {
      return (
        res.status(400).json({
          status: "fail",
          message: "Password used once",
        })
      );
    }

    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password, salt);
    const changePassword = await checkexist.updateOne({ password: hashpassword });

    try {
      await sendEmail({
        to: email || checkexist.email,
        subject: "Confirmation of Password Change - Your KikStart Account 🔐",
        html: passwordChangedTemplate(checkexist.name)
      });
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    const payload = {
      _id: checkexist._id
    }
    const token = generateToken(payload);
    console.log(token)

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