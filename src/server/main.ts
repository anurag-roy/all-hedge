import loginHandler from '@server/api/login.js';
import config from '@shared/config/config.js';
import express from 'express';
import ViteExpress from 'vite-express';
import { WebSocketServer } from 'ws';
import { setupState } from './state.js';

const app = express();

app.post('/login', loginHandler);

const server = app.listen(config.PORT, () => console.log(`Server started on http://localhost:${config.PORT}`));

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Echo: ' + message);
  });
});

ViteExpress.bind(app, server);

await setupState();
