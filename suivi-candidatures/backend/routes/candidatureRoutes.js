const express = require('express');
const router = express.Router();
const { validateCreate } = require('../validators/candidatureValidator');
const { create, list, markResponse, generateLetter,getById, deleteCandidature } = require('../controllers/candidatureController');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { sendRelance } = require('../services/mailerService');
const Candidature = require('../models/Candidature');  // Adapte le chemin si nécessaire

// Config de stockage des fichiers (dans public/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Route POST avec multer + validation + contrôle
router.post(
  '/',
  upload.single('cv'),       
  validateCreate,             
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  create                      
);

// Autres routes
router.get('/', list);
router.post('/:id/mark-response', markResponse);
router.post('/generate-letter', generateLetter);
router.delete('/:id', deleteCandidature);


router.get('/:id', getById);

router.post('/:id/relancer', async (req, res) => {
  try {
    const cand = await Candidature.findById(req.params.id);
    if (!cand) return res.status(404).json({ error: "Candidature introuvable" });

    await sendRelance(cand);
    res.json({ message: "Relance envoyée." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l’envoi de la relance" });
  }
});


module.exports = router;
