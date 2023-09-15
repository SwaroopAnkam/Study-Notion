const cloudinary = require("cloudinary").v2;

exports.cloudinaryConnect = () => {
  try {
    const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error("Missing Cloudinary Environment Variables.");
      return;
    }

    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });

    console.log("Cloudinary Connected Successfully.");
  } catch (error) {
    console.error("An Error Occurred While Configuring Cloudinary:", error);
  }
};
