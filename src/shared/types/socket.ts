import type { DepthResponse } from './shoonya.js';
import type { EquityState } from './state.js';

export type TickerSubscription = ((tick: DepthResponse) => void) | ((tick: DepthResponse) => Promise<void>);

export enum SocketDataType {
  EQ_INIT = 'EQ_INIT',
  EQ_UPDATE = 'EQ_UPDATE',
}

export type SocketData =
  | {
      type: SocketDataType.EQ_INIT;
      data: EquityState[];
    }
  | {
      type: SocketDataType.EQ_UPDATE;
      data: Pick<EquityState, 'token' | 'ltp'>;
    };
