const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");






//resetPassword token

exports.resetPasswordToken= async(req, res) => {
    try{
        const {email} = req.body.email;

        const user = await User.findOne({email});
        if(!user){
            return res.status(403).json({
                success:false,
                message:'Your Email is Not Registered With us'
            });
        }

        const resetToken = crypto.randomUUID();

        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token : resetToken,
                resetTokenExpires: Date.now() + 5*60*1000,
            },
            {new : true});
        
        const url = `http://localhost:3000/update-password/${token}`

        await mailSender(email,
                        "Password Reset Link",
                        `Password Reset Link: ${url}`)

        return res.status(200).json({
             success:true,
             message:"Email Sent Successfully, Please Check The Email And Change The Password",
         });


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something Went Wrong While Sending Reset Password Mail",
        })
    }
}

//resetPasswword

exports.resetPassword = async(req, res) => {
    try{
        const {password, confirmPassword, token} = req.body;
        
        if(password !== confirmPassword){
            return res.status(403).json({
                success:false,
                message:'Password And Confirm Password is Not Matching',
            });
        }

        const user = await User.findOne({token: token});
        if(!user){
            return res.status(401).json({
                success:false,
                message:'Token is Invalid',
            });
        }

        if(user.resetTokenExpires < Date.now()){
            return res.status(403).json({
                success:false,
                message:'Token is Expired, Please Regenerate Your Token',
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        await User.findOneAndUpdate(
            {token : token},
            {password : hashedPassword },
            {new : true},
        )

        return res.status(200).json({
            success:true,
            message:'Password Reset Successful',
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something Went Wrong While Updating Password in Database'
        })
    }
}