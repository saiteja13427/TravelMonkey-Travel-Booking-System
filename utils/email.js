const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1) Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) Define email options
  const mailOptions = {
    from: "admin@travelmonkey.io",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) Actually send email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
