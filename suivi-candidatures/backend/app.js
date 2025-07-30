require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes/candidatureRoutes');
require('./cron/relanceCron'); // lance le cron
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Fichiers statiques (HTML, CSS, JS dans /public)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/candidatures', router);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connexion MongoDB établie');

  // Lancer le serveur seulement après connexion DB
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(` Serveur en écoute sur http://localhost:${port}`));
}).catch(err => {
  console.error(' Erreur de connexion MongoDB :', err);
});
