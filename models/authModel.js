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
