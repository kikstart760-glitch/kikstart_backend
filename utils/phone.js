const { parsePhoneNumberFromString } = require("libphonenumber-js");

exports.formatPhone = (phone) => {
  try {
    const parsed = parsePhoneNumberFromString(phone, "IN");

    if (!parsed || !parsed.isValid()) return null;

    return parsed.number; 
  } catch {
    return null;
  }
};