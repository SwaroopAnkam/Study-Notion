const Razorpay = require("razorpay");
require("dotenv").config();

const { RAZORPAY_KEY, RAZORPAY_SECRET } = process.env;

if (!RAZORPAY_KEY || !RAZORPAY_SECRET) {
  console.error("Missing Razorpay Environment Variables.");
  console.error(error);
  process.exit(1);
}

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY,
  key_secret: RAZORPAY_SECRET,
});

exports.razorpayInstance = razorpayInstance;
