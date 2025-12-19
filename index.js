const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const qrcode = require('qrcode');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;


// Enable CORS for all routes
app.use(cors());

// Serve static client files
app.use(express.static(path.join(__dirname, 'client')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Store clients by session id
const clients = {};

// Create a new WhatsApp session
app.post('/create-session', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    if (clients[sessionId]) return res.status(400).json({ error: 'Session already exists' });

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId })
    });

    clients[sessionId] = { client, qr: null, ready: false };

    client.on('qr', qr => {
        clients[sessionId].qr = qr;
    });

    client.on('ready', () => {
        clients[sessionId].ready = true;
    });

    client.on('disconnected', () => {
        delete clients[sessionId];
    });

    client.initialize();
    res.json({ status: 'Initializing', sessionId });
});

// Get QR code for session
app.get('/qr/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = clients[sessionId];
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.qr) return res.status(404).json({ error: 'QR not generated yet' });
    const qrImage = await qrcode.toDataURL(session.qr);
    res.json({ qr: qrImage });
});

// Send message
app.post('/send-message', async (req, res) => {
    const { sessionId, to, message } = req.body;
    const session = clients[sessionId];
    if (!session || !session.ready) return res.status(400).json({ error: 'Session not ready' });
    try {
        await session.client.sendMessage(`${to}@s.whatsapp.net`, message);
        res.json({ status: 'Message sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send media (image/audio/document)
app.post('/send-media', upload.single('media'), async (req, res) => {
    const { sessionId, to, caption } = req.body;
    const session = clients[sessionId];
    if (!session || !session.ready) return res.status(400).json({ error: 'Session not ready' });
    if (!req.file) return res.status(400).json({ error: 'No media file uploaded' });
    try {
        const media = fs.readFileSync(req.file.path);
        const { MessageMedia } = require('whatsapp-web.js');
        const mimeType = req.file.mimetype;
        const base64 = media.toString('base64');
        const messageMedia = new MessageMedia(mimeType, base64, req.file.originalname);
        await session.client.sendMessage(`${to}@s.whatsapp.net`, messageMedia, { caption });
        fs.unlinkSync(req.file.path);
        res.json({ status: 'Media sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Receive messages (webhook style, for demo: poll latest message)
app.get('/receive-messages/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = clients[sessionId];
    if (!session || !session.ready) return res.status(400).json({ error: 'Session not ready' });
    // This is a placeholder. For production, use event-based webhooks or persistent storage.
    res.json({ status: 'Receiving messages requires webhook/event setup.' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
