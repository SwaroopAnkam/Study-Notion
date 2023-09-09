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

exports.deleteAccount = async(req,res) => {
    try{
        const userId = req.user._id;
        console.log("Printing ID: ", req.user.id);

        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(404).json({
				success : false,
				message : "User Not Found",
			});
        }

        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        await User.findByIdAndDelete({_id: userId});
        res.status(200).json({
			success : true,
			message : "User Deleted Successfully",
		});


    }
    catch(error){
        console.log(error);
		res.status(500).json({ 
            success : false, 
            message : "User Cannot be Deleted Successfully" 
        });
    }
}

exports.updateDisplayPicture = async(req, res) => {
    try{
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const updatedImage = await uploadMediaToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
        )

        console.log(updatedImage);

        const updatedProfile = await User.findByIdAndUpdate(
            { _id : userId },
            { image : image.secure_url },
            { new : true }
        )

        res.send({
            success : true,
            message : `Image Updated Successfully`,
            data : updatedProfile,
        })

    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}


exports.getEnrolledCourses = async(req, res) => {
    try{
        const userId = req.user.id;
        const userDetails = await User.findOne({
            _id: userId,
        })
        .populate("courses")
        .exec()
        if (!userDetails) {
            return res.status(400).json({
              success : false,
              message : `Could Not Find User With id: ${userDetails}`,
            })
          }
          return res.status(200).json({
            success : true,
            data : userDetails.courses,
          })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
          })
    }
}
