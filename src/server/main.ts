import loginHandler from '@server/api/login.js';
import express from 'express';
import ViteExpress from 'vite-express';
import { WebSocketServer } from 'ws';
import { ticker } from './globals/ticker.js';

const app = express();

app.post('/login', loginHandler);

const PORT = 3000;
const server = app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Echo: ' + message);
  });
});

ViteExpress.bind(app, server);

ticker.send(
  JSON.stringify({
    t: 't',
    k: 'NFO|195108',
  })
);
