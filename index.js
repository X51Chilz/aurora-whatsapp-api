require('dotenv').config();
const express = require('express');
const app = express();
const whatsappRoutes = require('./routes/whatsapp');
const { initializeWhatsApp } = require('./services/whatsappClient');

app.use(express.json());
app.use('/api', whatsappRoutes);

const PORT = process.env.PORT || 3000;

initializeWhatsApp();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});