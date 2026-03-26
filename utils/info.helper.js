const UAParser = require("ua-parser-js");
const axios = require("axios");

// Get Device Info
exports.getDevice = (req) => {
  try {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    return `${result.browser.name || "Unknown"} on ${
      result.os.name || "Unknown OS"
    }`;
  } catch {
    return "Unknown Device";
  }
};

// Get IP Address
exports.getIP = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "Unknown IP"
  );
};

// Get Location from IP
exports.getLocation = async (ip) => {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`);
    return `${res.data.city || ""}, ${res.data.country || ""}`;
  } catch {
    return "Unknown Location";
  }
};