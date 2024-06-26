import type { WebSocket } from 'ws';

export type OptionState = {
  token: string;
  tradingSymbol: string;
  bp: number;
  sp: number;
};

export type EquityState = {
  token: string;
  symbol: string;
  ltp: number;
  close: number;
};

export type Mover = EquityState & {
  change: number;
};

export type StockState = {
  symbol: string;
  equity: {
    token: string;
    ltp: number;
    upperBound: number;
    lowerBound: number;
  };
  future: OptionState;
  lotSize: number;
  strike: number;
  pe: OptionState;
  ce: OptionState;
  isFirstPassSatisfied: boolean;
  hedgePrice1: number;
  hedgePrice2: number;
};

export type EnteredOptionState = {
  token: string;
  tradingSymbol: string;
  transactionType: string;
  price: number;
  quantity: number;
};

export type EnteredState = {
  condition: 1 | 2;
  entryValueDifference: number;
  time: string;
  symbol: string;
  equity: {
    token: string;
    ltp: number;
  };
  future: EnteredOptionState;
  lotSize: number;
  strike: number;
  pe: EnteredOptionState;
  ce: EnteredOptionState;
};

export type AppStateProps = {
  expiry: string;
  accountMargin: number;
  entryValueDifference: number;
  exitValueDifference: number;
  client: WebSocket;
};
