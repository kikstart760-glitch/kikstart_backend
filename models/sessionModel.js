const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"]
    },
    refreshToken: String,
    device: String,
    ip: String,
    location: String,
    isValid: {
        type: Boolean,
        default: true
    },
    expiresAt: Date
},
{
    timestamps: true,
},
);

module.exports = mongoose.model("Session", sessionSchema);

