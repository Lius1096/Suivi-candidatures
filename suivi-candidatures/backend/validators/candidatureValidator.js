const { body } = require('express-validator');

exports.validateCreate = [
  body('email').isEmail().withMessage("Email invalide"),
  body('password').isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body('site_url').isURL().withMessage("URL du site invalide"),
  body('entreprise').notEmpty().withMessage("Le nom de l'entreprise est requis"),
  body('email_entreprise').isEmail().withMessage("Email de l'entreprise invalide"),  // <-- ajouté

  // lettre_generee est facultative mais si présente, minimum 10 caractères
  body('lettre_generee')
    .optional({ checkFalsy: true })
    .isLength({ min: 10 }).withMessage("La lettre générée doit contenir au moins 10 caractères si elle est fournie"),

  // champs facultatifs cv, infos_entreprise, pas de validation ici pour l'instant
];
