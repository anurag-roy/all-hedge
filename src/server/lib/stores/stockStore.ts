import { createStore } from '@anuragroy/store';
import type { EquityState, OptionState } from '@shared/types/state.js';

const stockStore = createStore(
  { equities: {} as Record<string, EquityState>, options: {} as Record<string, OptionState> },
  {
    addEquity: {
      equities: (context, event: { symbol: string; token: string; ltp: number; close: number }) => {
        context.equities[event.token] = {
          symbol: event.symbol,
          token: event.token,
          ltp: event.ltp,
          close: event.close,
        };
        return context.equities;
      },
    },
    updateEquityLtp: {
      equities: (context, event: { token: string; ltp: number }) => {
        context.equities[event.token].ltp = event.ltp;
        return context.equities;
      },
    },
  }
);

export default stockStore;
