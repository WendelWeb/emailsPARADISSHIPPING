const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS correcte
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'https://ton-frontend-deploye.com'], // Origines autorisées
  methods: ['GET', 'POST', 'OPTIONS'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type'], // En-têtes autorisés
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérification de la connexion SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('Erreur de vérification SMTP:', error);
  } else {
    console.log('SMTP prêt à envoyer des emails');
  }
});

app.post('/send-email', async (req, res) => {
  const { userName, userEmail, packageId, status, message } = req.body;

  if (!userName || !userEmail || !packageId || !status || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const mailOptions = {
    from: `"Pnice Shipping Services" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Pnice Shipping Services  - Mise à jour de votre colis ${packageId}`,
    text: message, // Utilise le message envoyé par le frontend
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès à', userEmail);
    res.status(200).json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});