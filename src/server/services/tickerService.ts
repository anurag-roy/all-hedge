import env from '@shared/config/env.json';
import { WebSocket, type MessageEvent } from 'ws';
import { GlobalRef } from './GlobalRef.js';

class TickerService {
  ticker!: WebSocket;

  async connectTicker(token: string) {
    this.ticker = await new Promise((resolve, reject) => {
      const socket = new WebSocket('wss://api.shoonya.com/NorenWSTP/');

      const timeout = setTimeout(() => {
        reject('Ticker connection timed out.');
      }, 3000);

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            t: 'c',
            uid: env.USER_ID,
            actid: env.USER_ID,
            susertoken: token,
            source: 'API',
          })
        );
      };

      socket.onmessage = (messageEvent: MessageEvent) => {
        const messageData = JSON.parse(messageEvent.data as string);
        if (messageData.t === 'ck' && messageData.s === 'OK') {
          clearTimeout(timeout);
          resolve(socket);
        }
      };
    });
  }
}

const tickerServiceRef = new GlobalRef<TickerService>('myapp.tickerService');
if (!tickerServiceRef.value) {
  tickerServiceRef.value = new TickerService();
}
export default tickerServiceRef.value;
