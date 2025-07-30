const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const candidatureSchema = new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  site_url: { type: String, required: true },
  entreprise: { type: String, required: true },
  cv: { type: String },

  infos_entreprise: { type: String },
  lettre_generee: { type: String },
  email_entreprise: { type: String, required: true }, // ✅ Ajout du champ

  date_postulation: { type: Date, default: Date.now },
  reponse: { type: Boolean, default: false }
});

candidatureSchema.methods.setPassword = async function (pw) {
  this.passwordHash = await bcrypt.hash(pw, 10);
};

module.exports = mongoose.model('Candidature', candidatureSchema);
