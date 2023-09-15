const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Database Connected Successfully");
      })
      .catch((error) => {
        console.error("Database Connection Failed:", error);
        console.error(error);
        process.exit(1);
      });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose Connection Error:", err);
    });
  } catch (error) {
    console.error("An Error Occurred During Database Connection Setup:", error);
    process.exit(1);
  }
};
