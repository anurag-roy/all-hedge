import loginHandler from '@server/api/login.js';
import loginStatusHandler from '@server/api/loginStatus.js';
import userDetailsHandler from '@server/api/userDetails.js';
import wssHandler from '@server/api/wss.js';
import { injectTokenIntoEnv } from '@server/lib/utils.js';
import config from '@shared/config/config.js';
import express from 'express';
import ViteExpress from 'vite-express';
import { WebSocketServer } from 'ws';

await injectTokenIntoEnv();

const app = express();

app.use(express.json());
app.get('/api/loginStatus', loginStatusHandler);
app.post('/api/login', loginHandler);
app.get('/api/userDetails', userDetailsHandler);

const server = app.listen(config.PORT, () => console.log(`Server started on http://localhost:${config.PORT}`));

const wss = new WebSocketServer({ server, path: '/api/wss' });
wss.on('connection', wssHandler);

ViteExpress.bind(app, server);
