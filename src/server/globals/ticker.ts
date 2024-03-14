import env from '@shared/config/env.json';
import { TouchlineResponse } from '@shared/types/shoonya.js';
import { readFileSync } from 'node:fs';
import { MessageEvent, WebSocket } from 'ws';
import { GlobalRef } from './GlobalRef.js';

const token = readFileSync('.data/token.txt', 'utf-8');

const ws = new GlobalRef<WebSocket>('myapp.ticker');
if (!ws.value) {
  ws.value = await new Promise((resolve, reject) => {
    const socket = new WebSocket('wss://api.shoonya.com/NorenWSTP/');
    socket.onopen = () => {
      console.log('Ticker initialized and ready to connect...');

      if (token) {
        socket.send(
          JSON.stringify({
            t: 'c',
            uid: env.USER_ID,
            actid: env.USER_ID,
            susertoken: token,
            source: 'API',
          })
        );
      }
    };

    socket.onclose = () => {
      console.log('Ticker connection closed.');
      reject('Ticker connection closed.');
    };

    socket.onerror = (error) => {
      console.log('Ticker error', error);
      reject(error);
    };

    socket.onmessage = (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(messageEvent.data as string);
      if (messageData.t === 'tf') {
        const data = messageData as TouchlineResponse;
        console.log('Feed data', data);
      } else if (messageData.t === 'tk') {
        console.log('Acknowledgement', messageData);
      } else if (messageData.t === 'ck' && messageData.s === 'OK') {
        console.log('Ticker connected successfully!');
        resolve(socket);
      }
    };
  });
}

export const ticker = ws.value;
