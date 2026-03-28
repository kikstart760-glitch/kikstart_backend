const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: [true, "Please provide your name"],
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],          
        unique: true,
    },
    phone : {
        type: String,
        required: [true, "Please provide your phone number"],   
        unique: true,
    },
    formattedPhone : {
        type: String,
    },
    location: {
        type: String,
        required: [true, "Please provide your location"],       
    },
    passcode : {
        type: String,
        required: [true, "Please provide your passcode"],
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
    },
    otp : {
        type: String,
    },
    otpExpiry : {
        type: Date,
    },
    otpCooldown: {
        type: Date,
    },
    otpRequestCount: { 
        type: Number,
        default: 0 
    },
    isverified : {
        type: Boolean,
        default: false,
    },
    otpRequestDate: {
        type: Date,
    },
    deleteAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        index: { expires: 0 }
    },
    loginAttempts: { 
        type: Number, 
        default: 0 
    },
    lockUntil: {
        Date, 
        default: null 
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
},
{
    timestamps: true,
},
);

module.exports = mongoose.model("Auth", authSchema);
