const nodemailer = require('nodemailer');
require('dotenv').config();

// This transporter can now be imported and used anywhere in your backend
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Your 16-character App Password
  },
});

module.exports = transporter;