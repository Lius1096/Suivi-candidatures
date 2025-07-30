const cron = require('node-cron');
const Candidature = require('../models/Candidature');
const { sendRelance } = require('../services/mailerService');
cron.schedule('0 9 * * *', async () => {
  const seuil = new Date(Date.now() - Number(process.env.RELANCE_SECONDS) * 1000);
  const list = await Candidature.find({ date_postulation: { $lte: seuil }, reponse: false });
  list.forEach(c => sendRelance(c));
});
