const nodemailer = require("nodemailer");

// Primary Brevo Transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Secondary / Backup Brevo Transporter (Used by addFeedback)
const transporter2 = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER2 || process.env.SMTP_USER,
    pass: process.env.SMTP_PASS2 || process.env.SMTP_PASS,
  },
});

module.exports = { transporter, transporter2 };