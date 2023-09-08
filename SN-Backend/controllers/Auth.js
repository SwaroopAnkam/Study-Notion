const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
require("dotenv").config;


// TODO : email valididation and alternate method for generation of otp by using other packages

exports.sendOTP = async(req, res) => {
    try{
        
        const {email} = req.body;

         const isExistingUser = await User.findOne({email:email});
    
        if(isExistingUser){
            return res.status(401).json({
            success : false,
            message : "User is Already Registered",
        })
        }  

        let otp = otpGenerator.generate(6, {
             upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
    
        console.log("OTP generated: ", otp);

        let result = await OTP.findone({otp : otp});

        while(result){
             otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                 specialChars:false,
        });
            result = await OTP.findone({otp : otp});
        }

        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

         res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }

}

exports.signUp = async(req,res) => {
    try{
        const { firstName, 
            lastName, 
            email, 
            password, 
            confirmPassword, 
            contactNumber,
            accountType, 
            otp
          } = req.body;

        if (!firstName || !lastName || !email || !confirmPassword || !contactNumber || !otp){
            return res.status(403).json({
                success : false,
                message : "Please Fill in All the Required Fields to Sign Up.",
            })
        }

        if(password !== confirmPassword ){
            return res.status(400).json({
                success : false,
                message : "Password and ConfirmPassword Value Does Not Match, Please Try Again",
            })
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success : false,
                message : "Please Provide a Valid Email Address.",
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User Is Already Registered",
            })
        }

        const otpDigits = /^\d{6}$/;
    
        if (!otpDigits.test(otp)) {
            return res.status(400).json({
                success : false,
                message : "Invalid OTP Format. OTP Should be a 6-digit Number.",
            });
        }

        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);

        if(recentOTP.length == 0){
            return res.status(400).json({
                success : false,
                message : "OTP Not Found",
            })
        }
        else if(otp !== recentOTP.otp){
            return res.status(400).json({
                success : false,
                message : "Invalid OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:contactNumber,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
        })
        return res.status(200).json({
            success : true,
            message : 'User is Registered Successfully',
            user,
        });


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "User Cannot be Registrered. Please Try Again",
        })
    }

}


exports.login = async(req,res) => {
    try{
        const {email,password} = req.body

        if(!email || !password){
            return res.status(403).json({
                success : false,
                message :  "Please Fill All The Details To Login",
            })
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success : false,
                message : "Invalid Email Format. Please Provide a Valid Email Address.",
            });
        }


        const user = await User.findOne({email}).populate("additionalDetalis").exec();

        if(!user){
            return res.status(401).json({
                success : false,
                message : "User is Not Registered, Please Sign Up",
            })
        }

        if (user.token) {
            return res.status(400).json({
                success : false,
                message : "User is Already Logged in.",
            });
        }

        if(await bcrypt.compare(password, user.password)){

            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SCERET,{
                expiresIn : "2h",
            })
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }

            res.cookie("token", token, options).status(200).json({
                success : true,
                token,
                user,
                message : "Logged in Successfully",
            })
        }
        else {
            return res.status(401).json({
                success : false,
                message : "Password is Incorrect",
            });
        }


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Login Failure, Please Try Again",
        });
    }

}


exports.changePassword = async(req,res) => {
    try{
        const userDetails = await User.findById(req.user._id);

        if (!userDetails) {
            return res.status(404).json({
                success : false,
                message : "User Not Found"
            });
        }

        const {oldPassword, newPassword, confirmPassword} = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success : false,
                message : "Please Provide oldPassword, newPassword, and confirmPassword"
            });
        }


        const isPasswordMatch = await bcrypt.compare(
            oldPassword, 
            userDetails.password,
        );

        if(!isPasswordMatch){
            return res
            .status(401).json({ 
                success : false, 
                message : "The Password is Incorrect"
            });
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
				success : false,
				message : "The Password and Confirm Password does not Match",
			});
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success : false,
                message : "New Password Should be Different from the Old Password"
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password : encryptedPassword},
			{ new : true }
		);

        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password Updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
            )
            console.log("Email Sent Successfully:", emailResponse.response);

        }
        catch(error){
            console.error("Error Occurred While Sending Email:", error);
			return res.status(500).json({
				success : false,
				message : "Error Occurred While Sending Email",
				error : error.message,
			});
        }
        return res
			.status(200)
			.json({ success : true, 
                    message : "Password Updated Successfully" 
            });

    }
    catch(error){
        console.error("Error Occurred While Updating Password:", error);
		return res.status(500).json({
			success : false,
			message : "Error Occurred While Updating Password",
			error : error.message,
		});
    }
}
