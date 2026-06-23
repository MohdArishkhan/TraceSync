const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter= nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure : false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
});

const transporter2= nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure : false,
    auth: {
      user: process.env.SMTP_USER2,
      pass: process.env.SMTP_PASS2,
    }
});

module.exports = {transporter,transporter2};
