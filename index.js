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
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const transporter = nodemailer.createTransporter({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
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

// Route de test pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ 
    message: 'Paradis Shipping Email Service is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.post('/send-email', async (req, res) => {
  const { userName, userEmail, packageId, status, message, htmlMessage } = req.body;

  console.log('Received email request:', { userName, userEmail, packageId, status });

  if (!userName || !userEmail || !packageId || !status || !message) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'userName, userEmail, packageId, status, and message are required' 
    });
  }

  const mailOptions = {
    from: `"Paradis Shipping" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Paradis Shipping - Colis ${packageId} - Mise à jour`,
    text: message,
    html: htmlMessage || message // Utilise htmlMessage si disponible, sinon utilise message
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', userEmail);
    console.log('Message ID:', result.messageId);
    
    res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: result.messageId,
      recipient: userEmail
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Error sending email', 
      details: error.message 
    });
  }
});

// Route pour vérifier la santé du service
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Paradis Shipping Email Service started on port ${port}`);
});