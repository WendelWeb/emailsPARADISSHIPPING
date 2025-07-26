const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Comprehensive CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5174','http://localhost:5175', 'http://localhost:5173', 'https://paradisshipping.vercel.app', 'https://paradishipping.com', 'https://www.paradishipping.com'], 
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, // Allow credentials (cookies, authorization headers)
  optionsSuccessStatus: 200 // Some legacy browsers (IE11) choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Preflight route to handle OPTIONS requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false, // Utilisez STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// SMTP Connection Verification
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Verification Error:', error);
  } else {
    console.log('SMTP Ready to Send Emails');
  }
});

app.post('/send-email', async (req, res) => {
  const { userName, userEmail, packageId, status, message } = req.body;

  if (!userName || !userEmail || !packageId || !status || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const mailOptions = {
    from: `"Paradis Shipping " <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Paradis Shipping - Package ${packageId} Update`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', userEmail);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Complete Error:', error);
    console.error('Erreur complète :', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    response: error.response,
  });
    res.status(500).json({ 
      error: 'Error sending email', 
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});