const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
    
    courseID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Course",
        required : true,
        index: true,
    },
    completedVideos : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "SubSection",
            required : true,
        },
    ]
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema );