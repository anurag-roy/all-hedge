import env from '@shared/config/env.json';
import { DepthResponse, TouchlineResponse } from '@shared/types/shoonya.js';
import { TickerSubscription } from '@shared/types/socket.js';
import { WebSocket, type MessageEvent } from 'ws';
import stockStore from '../stores/stockStore.js';
import { GlobalRef } from './GlobalRef.js';
import logger from './logger.js';

class TickerService {
  ticker!: WebSocket;
  subscriptions: TickerSubscription[] = [];

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

  init() {
    this.ticker.onmessage = (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(messageEvent.data as string) as TouchlineResponse | DepthResponse;
      if (messageData.t === 'tf' && messageData.lp) {
        stockStore.send({
          type: 'updateEquityLtp',
          token: messageData.tk,
          ltp: Number(messageData.lp),
        });
      }
    };
    this.ticker.onerror = (error) => {
      logger.error('Ticker error:', error);
    };
  }
}

const tickerServiceRef = new GlobalRef<TickerService>('myapp.tickerService');
if (!tickerServiceRef.value) {
  tickerServiceRef.value = new TickerService();
}
export default tickerServiceRef.value;
