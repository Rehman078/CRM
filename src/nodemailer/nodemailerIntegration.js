import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "rehmanoffical078@gmail.com",
    pass: "gynhrpstbqpocjva",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(to, subject, html) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'rehmanoffical078@gmail.com', // sender address
    to,
    subject,
    html, // html body
  });
}

export default sendMail;