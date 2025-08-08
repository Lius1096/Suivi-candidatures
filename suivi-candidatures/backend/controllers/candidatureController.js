const Candidature = require('../models/Candidature');
const path = require('path');
const fs = require('fs');
const pdfParse = require("pdf-parse");
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

// exports.generateLetter = async (req, res) => {
//   try {
//     const { entreprise, infos_entreprise, cv } = req.body;

//     const lettre = `
// Madame, Monsieur,

// Je me permets de revenir vers vous concernant ma candidature au poste de ${infos_entreprise} au sein de  ${entreprise}.

// Je reste vivement intéressé(e) par cette opportunité et me tiens à votre disposition pour tout échange complémentaire.

// Pour rappel, voici un aperçu de mon parcours :
// ${cv ? cv.slice(0, 300) : "[CV non fourni]"}...

// Dans l’attente de votre retour, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

// Cordialement,
// `;

//     res.json({ lettre_generee: lettre });
//   } catch (err) {
//     res.status(500).json({ error: "Erreur génération lettre" });
//   }
// };


exports.generateLetter = [
  async (req, res) => {
    try {
      const { entreprise, infos_entreprise } = req.body;
      const cvFile = req.file;

      if (!entreprise || !infos_entreprise || !cvFile) {
        return res.status(400).json({ error: "Champs requis manquants ou fichier CV manquant." });
      }

      const dataBuffer = fs.readFileSync(cvFile.path);
      const pdfData = await pdfParse(dataBuffer);

      // Supprimer le fichier temporaire après lecture
      fs.unlinkSync(cvFile.path);

      const lignes = pdfData.text.split("\n").map(line => line.trim()).filter(line => line !== "");

      const motsClesFormation = [
        "formation", "formations", "certification", "certifications", "diplôme", "diplome",
        "bts", "licence", "master", "bac", "education", "études", "etudes"
      ];

      const startIndex = lignes.findIndex(line =>
        motsClesFormation.some(motCle => line.toLowerCase().includes(motCle))
      );

      let formationTexte = "[CV non fourni ou informations non détectées]";

      if (startIndex !== -1) {
        const sectionLines = [];
        for (let i = startIndex + 1; i < lignes.length; i++) {
          const line = lignes[i];
          if (/^(exp[ée]rience|comp[ée]tence|skills?|profil|projets|contact)/i.test(line)) break;
          sectionLines.push(line);
        }

        formationTexte = sectionLines.length > 0
          ? sectionLines.join("\n")
          : lignes[startIndex];
      }

      const lettre = `
Madame, Monsieur,

Je me permets de revenir vers vous concernant ma candidature au poste de **${infos_entreprise}** au sein de votre entreprise **${entreprise}**.

Je reste vivement intéressé(e) par cette opportunité et me tiens à votre disposition pour tout échange complémentaire.

Pour rappel, voici un aperçu de mon parcours :
${formationTexte}

Dans l’attente de votre retour, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

Cordialement,
`;

      res.json({ lettre_generee: lettre });
    } catch (err) {
      console.error("Erreur génération lettre :", err);
      res.status(500).json({ error: "Erreur lors de la génération de la lettre." });
    }
  }
];

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
