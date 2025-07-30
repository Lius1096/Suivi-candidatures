const Candidature = require('../models/Candidature');
const path = require('path');
const fs = require('fs');

exports.create = async (req, res) => {
  try {
    const { email, password, site_url, entreprise, infos_entreprise, lettre_generee, email_entreprise } = req.body;

    if (!email || !password || !site_url || !entreprise || !infos_entreprise) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
    }

    // Validation du mot de passe si nécessaire
    if (password && password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    // Chemin du CV si fichier uploadé
    const cvPath = req.file ? `/uploads/${req.file.filename}` : null;

    // Création de la candidature
    const cand = new Candidature({
      email,
      site_url,
      entreprise,
      infos_entreprise,
      lettre_generee,
      email_entreprise,
      cv: cvPath,
    });

    if (password) {
      await cand.setPassword(password);
    }

    await cand.save();
    return res.status(201).json(cand); // Candidature créée avec succès
  } catch (err) {
    console.error("❌ Erreur lors de la création de la candidature : ", err.message);
    return res.status(500).json({ error: "Erreur serveur. Impossible de créer la candidature." });
  }
};


exports.markResponse = async (req, res) => {
  try {
    const updated = await Candidature.findByIdAndUpdate(
      req.params.id,
      { reponse: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Candidature non trouvée" });
    res.json({ message: "Réponse marquée", candidature: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

exports.list = async (req, res) => {
  try {
    const all = await Candidature.find().sort({ date_postulation: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
};

exports.generateLetter = async (req, res) => {
  try {
    const { entreprise, infos_entreprise, cv } = req.body;

    const lettre = `
Bonjour,

Je vous contacte au sujet de ma candidature pour **${entreprise}**.
${infos_entreprise}

Mon parcours :
${cv ? cv.slice(0, 300) : "[Pas de CV fourni]"}...

Je reste à votre disposition pour tout échange.

Cordialement,
`;

    res.json({ lettre_generee: lettre });
  } catch (err) {
    res.status(500).json({ error: "Erreur génération lettre" });
  }
};

exports.downloadCV = async (req, res) => {
  try {
    const cand = await Candidature.findById(req.params.id);
    if (!cand || !cand.cv) return res.status(404).json({ error: "CV introuvable" });

    const filePath = path.join(__dirname, '../public', cand.cv);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Fichier introuvable" });

    res.download(filePath);
  } catch (err) {
    console.error("❌ Erreur téléchargement CV :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.deleteCandidature = async (req, res) => {
  try {
    const cand = await Candidature.findById(req.params.id);
    if (!cand) return res.status(404).json({ error: "Candidature introuvable" });

    if (cand.cv) {
      const filePath = path.join(__dirname, '../public', cand.cv);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Candidature.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidature supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


exports.getById = async (req, res) => {
  try {
    const cand = await Candidature.findById(req.params.id);
    if (!cand) return res.status(404).json({ message: "Candidature non trouvée" });
    res.json(cand);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
