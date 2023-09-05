const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async(req, res) => {
    try{
        const {dateOfBirth="",about="", contactNumber, gender} = req.body;
        const userId = req.user._id;

        if(!userId) {
            return res.status(400).json({
                success : false,
                message : "Id is Required to Update The Fields",
            });
        } 

        const userDetails = await User.findById({userId});
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success : true,
            message : "Profile Updated Successfully",
            profileDetails,
        });

    }
    catch(error){
        return res.status(500).json({
            success : false,
            error : error.message,
        });
    }
}


exports.showProfileDetails = async(req, res) => {
    try{
        const userId = req.user._id;
        const userDetails = await User.findById(userId).populate("additionalDetails").exec();

        return res.status(200).json({
            success : true,
            message : "User Data Fetched Successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        });
    }
}


// needed to define delete account handler
