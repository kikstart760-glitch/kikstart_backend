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
    otpExpires : {
        type: Date,
    },
    isverified : {
        type: Boolean,
        default: false,
    },
    deleteAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        index: { expires: 0 }
    },
        role : {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
},
{
    timestamps: true,
},
);
