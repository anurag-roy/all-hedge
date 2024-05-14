import logger from '@server/lib/services/logger.js';
import { AppState } from '@server/state.js';
import type { AppStateProps } from '@shared/types/state.js';
import type { IncomingMessage } from 'node:http';
import type { WebSocket } from 'ws';

export default function (ws: WebSocket, req: IncomingMessage) {
  let appStateProps: AppStateProps;
  try {
    if (!req.url) throw new Error('No URL');

    const baseUrl = `http://${req.headers.host}`;
    const url = new URL(req.url, baseUrl);

    const accountMargin = Number(url.searchParams.get('accountMargin'));
    if (isNaN(accountMargin)) throw new Error('No accountMargin');

    const expiry = url.searchParams.get('expiry');
    if (!expiry) throw new Error('No expiry');

    const entryValueDifference = Number(url.searchParams.get('entryValueDifference'));
    if (isNaN(entryValueDifference)) throw new Error('No entryValueDifference');

    const exitValueDifference = Number(url.searchParams.get('exitValueDifference'));
    if (isNaN(exitValueDifference)) throw new Error('No exitValueDifference');

    appStateProps = {
      accountMargin,
      entryValueDifference,
      expiry,
      exitValueDifference,
      client: ws,
    };
  } catch (error) {
    logger.error('Bad request for wss connection:', error);
    ws.close(400, (error as Error).message);
    return;
  }

  const appState = new AppState(appStateProps);
  ws.send(JSON.stringify({ type: 'ack', message: 'Connected' }));

  appState.setupState().catch((error) => logger.error('Error setting up state:', error));
  ws.on('close', () => {
    logger.info('Client disconnected');
    appState.destroyState();
  });
}
