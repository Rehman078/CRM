import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.Email,
    pass: process.env.Email_Pass,
  },

});

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(to, subject, html) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.Email, // sender address
    to,
    subject,
    html, // html body
  });
}

export default sendMail;