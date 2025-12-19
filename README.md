# WhatsApp Multi-Device Node.js Server

This project provides a Node.js server using whatsapp-web.js with multi-device support. It exposes REST APIs to:
- Create WhatsApp device sessions (multi-device)
- Get QR code for authentication
- Send and receive messages
- Send media (images, audio, documents)

## Requirements
- Node.js 16+
- Google Chrome or Chromium (required by whatsapp-web.js)

## Installation
```bash
npm install
```

## Usage
Start the server:
```bash
npm start
```

## API Endpoints

### 1. Create Session
- `POST /create-session`
- Body: `{ "sessionId": "your_unique_id" }`
- Response: `{ status, sessionId }`

### 2. Get QR Code
- `GET /qr/:sessionId`
- Response: `{ qr }` (base64 image)

### 3. Send Message
- `POST /send-message`
- Body: `{ "sessionId": "your_unique_id", "to": "whatsapp_number@s.whatsapp.net", "message": "Hello!" }`

### 4. Send Media
- `POST /send-media`
- Form Data: `sessionId`, `to`, `caption` (optional), `media` (file)

### 5. Receive Messages
- `GET /receive-messages/:sessionId`
- (Demo only, for production use webhooks)

## Notes
- Each session is identified by a unique `sessionId`.
- For production, implement persistent storage and webhooks for incoming messages.

## License
MIT
"# whatsapp" 
"# whatsapp" 
