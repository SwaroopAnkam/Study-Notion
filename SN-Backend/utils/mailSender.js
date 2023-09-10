const nodemailer = require("nodemailer");
require("dotenv").config();


const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host : process.env.MAIL_HOST,
            auth : {
                user : process.env.MAIL_USER,
                pass : Process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from : "StudyNotion",
            to : email,
            subject : title,
            html : body,
        })

        console.log("Email sent successfully:", info.response);
        return info;
    }
    catch (error) {
        console.error("Error sending email:", error.message);
        throw error;
    }
};

module.exports = mailSender;