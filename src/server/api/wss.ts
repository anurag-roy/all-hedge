import stockStore from '@server/lib/stores/stockStore.js';
import { SocketData, SocketDataType } from '@shared/types/socket.js';
import type { IncomingMessage } from 'node:http';
import type { WebSocket } from 'ws';

export default function (ws: WebSocket, _req: IncomingMessage) {
  const equities = Object.values(stockStore.getSnapshot().context.equities);
  const init: SocketData = {
    type: SocketDataType.EQ_INIT,
    data: equities,
  };
  ws.send(JSON.stringify(init));

  const subscription = stockStore.subscribe((_state, event) => {
    const update: SocketData = {
      type: SocketDataType.EQ_UPDATE,
      data: {
        token: event.token,
        ltp: event.ltp,
      },
    };
    ws.send(JSON.stringify(update));
  });

  ws.on('close', () => {
    subscription.unsubscribe();
  });
}
