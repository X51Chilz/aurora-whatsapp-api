// services/whatsappClient.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;

const initializeWhatsApp = () => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu"
      ]
    }
    
  });

  client.on('qr', (qr) => {
    console.log('📱 Scan this QR code to connect WhatsApp:');
    const fs = require('fs');
    const path = require('path');
    const qrImagePath = path.join(__dirname, '..', 'public', 'qr.png');

    qrcode.toFile(qrImagePath, qr, { type: 'png' }, (err) => {
  if (err) console.error('❌ Failed to save QR image:', err);
  else console.log('📷 QR code saved to /public/qr.png');
});

  });

  client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
  });

  client.on('message', (msg) => {
    console.log(`📩 New message from ${msg.from}: ${msg.body}`);
  });

  client.initialize();
};

const getClient = () => client;

module.exports = {
  initializeWhatsApp,
  getClient
};