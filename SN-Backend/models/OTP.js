const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mailTemplates/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

async function sendVerificationMail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email From StudyNotion",
      emailTemplate(otp)
    );
    console.log("Email sent Successfully: ", mailResponse);
    return { success: true };
  } catch (error) {
    console.log("Error Occured While Sending Mail: ", error);
    return {
      success: false,
      errorCode: "EMAIL_SEND_ERROR",
      errorMessage: "Email sending failed",
    };
  }
}

OTPSchema.pre("save", async function (next) {
  const email = this.email;
  const otp = this.otp;

  const result = await sendVerificationMail(email, otp);
  if (!result.success) {
    console.error("Error during OTP email sending: ", result.errorMessage);
  }

  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
