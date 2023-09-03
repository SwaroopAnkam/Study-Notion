const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
require("dotenv").config;






// OTP for SignUp
// TODO : email valididation and alternate method for generation of otp by using other packages

exports.sendOTP = async(req, res) => {
    try{
        
        const {email} = req.body;

         const isExistingUser = await User.findOne({email:email});
    
        if(isExistingUser){
            return res.status(401).json({
            success:false,
            message:"User is Already Registered",
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
            success:false,
            message:error.message,
        })
    }

}

// signUp

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
                message : "Please Fill All The Details To SignUp",
            })
        }

        if(password !== confirmPassword ){
            return res.status(400).json({
                success : false,
                message : "Password and ConfirmPassword Value Does Not Match, Please Try Again",
            })
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User Is Already Registered",
            })
        }

        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);

        if(recentOTP.length == 0){
            return res.status(400).json({
                success:false,
                message:"OTP Not Found",
            })
        }
        else if(otp !== recentOTP.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
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
            success:true,
            message:'User is Registered Successfully',
            user,
        });


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User Cannot be Registrered. Please Try Again",
        })
    }

}


//login

exports.login = async(req,res) => {
    try{
        const {email,password} = req.body

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"Please Fill All The Details To Login",
            })
        }

        const user = await User.findOne({email}).populate("additionalDetalis").exec();

        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is Not Registered, Please Sign Up",
            })
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
                success:true,
                token,
                user,
                message:'Logged in Successfully',
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is Incorrect',
            });
        }


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, Please Try Again',
        });
    }

}


//change password
exports.changePassword = async(req,res) => {
    
}
