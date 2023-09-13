const nodeMailer = require('nodemailer')

require("dotenv").config()

const sendMail = async(to,subject,text)=>{
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure:true,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: text
        }

        transporter.sendMail(mailOptions, (err,info)=>{
            if (err) {
                console.log(err)
                return
            }
            transporter.close();
        })

    } catch (error) {
        console.log(error)
    }
}

module.exports = sendMail