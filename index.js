require('dotenv').config();
const express = require('express');
const app = express();
const whatsappRoutes = require('./routes/whatsapp');
const { initializeWhatsApp } = require('./services/whatsappClient');

app.use(express.json());
app.use('/api', whatsappRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Aurora WhatsApp API is live and listening on port ${PORT}`);
  try {
    await initializeWhatsApp();
  } catch (err) {
    console.error("❌ Failed to initialize WhatsApp client:", err);
  }
});