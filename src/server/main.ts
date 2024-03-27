import loginHandler from '@server/api/login.js';
import { injectTokenIntoEnv } from '@server/lib/utils.js';
import { AppState } from '@server/state.js';
import config from '@shared/config/config.js';
import type { AppStateProps } from '@shared/types/state.js';
import express from 'express';
import ViteExpress from 'vite-express';
import { WebSocketServer } from 'ws';

await injectTokenIntoEnv();

const app = express();

app.get('api/loginStatus', async (_req, res) => {
  if (process.env.token) {
    res.status(200).json({ message: 'Logged in' });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});
app.post('api/login', loginHandler);
app.post('api/start', async (req, res) => {
  const body = req.body as AppStateProps;
  const appState = new AppState(body);
  await appState.setupState();
  res.status(200).json({ message: 'Started' });
});

const server = app.listen(config.PORT, () => console.log(`Server started on http://localhost:${config.PORT}`));

const wss = new WebSocketServer({ server, path: 'api/ws' });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Echo: ' + message);
  });
});

ViteExpress.bind(app, server);
