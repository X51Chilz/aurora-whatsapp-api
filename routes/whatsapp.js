// routes/whatsapp.js
const express = require('express');
const router = express.Router();
const { getClient } = require('../services/whatsappClient');
const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

// Send a plain message
router.post('/send', async (req, res) => {
  const { to, message, confirm } = req.body;
  if (!confirm) return res.status(400).json({ error: 'Confirmation required.' });

  try {
    const client = getClient();
    await client.sendMessage(to, message);
    res.json({ message: 'Message sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message.', details: err.message });
  }
});

// Reply to a message
router.post('/reply', async (req, res) => {
  const { to, reply_to, message, confirm } = req.body;
  if (!confirm) return res.status(400).json({ error: 'Confirmation required.' });

  try {
    const client = getClient();
    const chat = await client.getChatById(to);
    const quotedMsg = await chat.fetchMessages({ limit: 50 }).then(msgs => msgs.find(m => m.id._serialized === reply_to));
    if (!quotedMsg) throw new Error('Original message not found.');
    await quotedMsg.reply(message);
    res.json({ message: 'Reply sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reply.', details: err.message });
  }
});

// Send media
router.post('/send-media', async (req, res) => {
  const { to, type, url, caption, confirm } = req.body;
  if (!confirm) return res.status(400).json({ error: 'Confirmation required.' });

  try {
    const client = getClient();
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const mimeType = response.headers['content-type'];
    const media = new MessageMedia(mimeType, Buffer.from(response.data).toString('base64'), 'media');
    await client.sendMessage(to, media, { caption });
    res.json({ message: 'Media sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send media.', details: err.message });
  }
});

// Mark message as read
router.post('/mark-as-read', async (req, res) => {
  const { message_id, confirm } = req.body;
  if (!confirm) return res.status(400).json({ error: 'Confirmation required.' });

  try {
    const client = getClient();
    const msg = await client.getMessageById(message_id);
    await msg.getChat().then(chat => chat.sendSeen());
    res.json({ message: 'Message marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read.', details: err.message });
  }
});

// Forward message (native WhatsApp forward)
router.post('/forward', async (req, res) => {
  const { message_id, to, confirm } = req.body;
  if (!confirm) return res.status(400).json({ error: 'Confirmation required.' });

  try {
    const client = getClient();
    const msg = await client.getMessageById(message_id);
    await msg.forward(to);
    res.json({ message: 'Message forwarded successfully using WhatsApp native forwarding.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to forward message.', details: err.message });
  }
});

// Get message history
router.get('/messages/:chat_id', async (req, res) => {
  const { chat_id } = req.params;

  try {
    const client = getClient();
    const chat = await client.getChatById(chat_id);
    const messages = await chat.fetchMessages({ limit: 20 });

    const formatted = messages.map(msg => ({
      message_id: msg.id._serialized,
      from: msg.from,
      message: msg.body,
      timestamp: msg.timestamp
    }));

    res.json({ chat_id, messages: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message history.', details: err.message });
  }
});

module.exports = router;
