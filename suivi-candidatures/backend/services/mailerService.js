const nodemailer = require("nodemailer");

// Crée un transporteur Nodemailer avec les informations d'authentification Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Fonction d'envoi de relance
exports.sendRelance = async (candidature) => {
  // Vérifier que l'email de l'entreprise existe
  if (!candidature.email_entreprise) {
    console.warn(`Pas d'e-mail entreprise pour la candidature ${candidature._id}`);
    return;
  }

  // Valider le format de l'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(candidature.email_entreprise)) {
    console.warn(`Email invalide pour la candidature ${candidature._id}: ${candidature.email_entreprise}`);
    return;
  }

  // Vérifier que la date de postulation est valide
  if (isNaN(new Date(candidature.date_postulation).getTime())) {
    console.error("Date de postulation invalide pour la candidature :", candidature._id);
    return;
  }

  // Créer l'email de relance
  const mailOptions = {
    from: `"Suivi Candidature" <${process.env.EMAIL}>`,
    to: candidature.email_entreprise,
    subject: `Relance candidature - ${candidature.entreprise}`,
    html: `
      <p>Bonjour,</p>
      <p>Je me permets de relancer ma candidature envoyée le ${new Date(candidature.date_postulation).toLocaleDateString()} concernant votre entreprise "<strong>${candidature.entreprise}</strong>".</p>
      <p>Je reste disponible pour tout complément d’information.</p>
      <p>Bien cordialement,</p>
      <p>[Votre Nom]</p>
    `,
  };

  try {
    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    console.log(`Relance envoyée à ${candidature.email_entreprise}`);
  } catch (err) {
    console.error("Erreur lors de l'envoi de la relance :", err.message);
    if (err.code === 'EAUTH') {
      console.error('Problème d\'authentification : vérifie tes identifiants email');
    }
  }
};
