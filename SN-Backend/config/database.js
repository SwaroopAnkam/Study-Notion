const mongoose = require("mongoose");
require("dotenv").config;

exports.dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser : true,
        useUnifiedTopology : true,
    })
    .then( () => console.log("Database Connected Successfully"))
    .catch( () => {
        console.log("Database Connection Failed");
        console.errror(error);
        process.exit(1);
    })
};