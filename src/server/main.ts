import userDetailsHandler from '@server/api/userDetails.js';
import wssHandler from '@server/api/wss.js';
import logger from '@server/services/logger.js';
import shoonyaService from '@server/services/shoonyaService.js';
import config from '@shared/config/config.js';
import env from '@shared/config/env.json';
import express from 'express';
import { HTTPError } from 'ky';
import ViteExpress from 'vite-express';
import { WebSocketServer } from 'ws';
import tickerService from './services/tickerService.js';

try {
  await shoonyaService.getUserDetails();
  logger.info(`Logged in as ${env.USER_ID}`);
} catch (error) {
  const message = (error as HTTPError).message;
  if (message.includes('Session Expired')) {
    logger.error(`Session expired. Logging in as ${env.USER_ID}...`);
    try {
      await shoonyaService.login();
      logger.info('Logged in successfully.');
    } catch (error) {
      logger.error('Failed to login. Please check if env is setup correctly. Error:', (error as HTTPError).message);
      logger.error('Exiting...');
      process.exit(1);
    }
  } else {
    logger.error('Could not check if user is logged in:', message);
    logger.error('Exiting...');
    process.exit(1);
  }
}

const token = shoonyaService.token;
let isTickerConnected = false;
while (!isTickerConnected) {
  try {
    await tickerService.connectTicker(token);
    isTickerConnected = true;
    logger.info('Connected to ticker.');
  } catch (error) {
    logger.error('Failed to connect to ticker. Retrying...');
  }
}

const app = express();

app.use(express.json());
app.get('/api/userDetails', userDetailsHandler);

const server = app.listen(config.PORT, () => logger.info(`Server started on http://localhost:${config.PORT}`));

const wss = new WebSocketServer({ server, path: '/api/wss' });
wss.on('connection', wssHandler);

ViteExpress.bind(app, server);
