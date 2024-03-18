import config from '@shared/config/config.js';
import { placeOrder } from '@shared/lib/placeOrder.js';
import { TouchlineResponse } from '@shared/types/shoonya.js';
import { orderBy } from 'lodash-es';
import { MessageEvent } from 'ws';
import { getEquities, getFutures, getInstrumentsForSymbol } from './db/db.js';
import { ticker } from './globals/ticker.js';

type StockState = {
  symbol: string;
  equity: {
    token: string;
    ltp: number;
  };
  future: {
    token: string;
    tradingSymbol: string;
    bp: number;
    sp: number;
  };
  lotSize: number;
  strike: number;
  pe: {
    token: string;
    tradingSymbol: string;
    bp: number;
    sp: number;
  };
  ce: {
    token: string;
    tradingSymbol: string;
    bp: number;
    sp: number;
  };
};
export const stockState: Record<string, StockState> = {};

async function checkEntryCondition({ symbol, equity, future, ce, pe, strike, lotSize }: StockState) {
  if (!equity.ltp || !future.bp || !future.sp || !pe.bp || !pe.sp || !ce.bp || !ce.sp) {
    return;
  }

  // Condition 1 calculation
  const result1 =
    (equity.ltp - future.sp + Math.max(strike - equity.ltp, 0) - pe.sp + ce.bp - Math.max(equity.ltp - strike, 0)) *
    lotSize;
  if (result1 >= config.ENTRY_VALUE_DIFFERENCE) {
    console.log('Entry condition 1 satisfied for', symbol);
    await Promise.all([
      placeOrder('B', future.sp, lotSize, future.tradingSymbol),
      placeOrder('B', pe.sp, lotSize, pe.tradingSymbol),
      placeOrder('S', ce.bp, lotSize, ce.tradingSymbol),
    ]);
    console.log('Exiting...');
    process.exit(0);
  }

  // Conidtion 2 calculation
  const result2 =
    (future.bp - equity.ltp + pe.bp - Math.max(strike - equity.ltp, 0) + Math.max(equity.ltp - strike, 0) - ce.sp) *
    lotSize;
  if (result2 >= config.ENTRY_VALUE_DIFFERENCE) {
    console.log('Entry condition 2 satisfied for', symbol);
    await Promise.all([
      placeOrder('S', future.bp, lotSize, future.tradingSymbol),
      placeOrder('S', pe.bp, lotSize, pe.tradingSymbol),
      placeOrder('B', ce.sp, lotSize, ce.tradingSymbol),
    ]);
    console.log('Exiting...');
    process.exit(0);
  }
}

async function checkExitCondition({ symbol, equity, future, ce, pe, strike, lotSize }: StockState, condition: 1 | 2) {
  if (!equity.ltp || !future.bp || !future.sp || !pe.bp || !pe.sp || !ce.bp || !ce.sp) {
    return;
  }

  if (condition === 1) {
    const result =
      (equity.ltp - future.bp + Math.max(strike - equity.ltp, 0) - pe.bp + ce.sp - Math.max(equity.ltp - strike, 0)) *
      lotSize;
    if (result <= config.EXIT_VALUE_DIFFERENCE) {
      console.log('Exit condition 1 satisfied for', symbol);
      await Promise.all([
        placeOrder('S', future.bp, lotSize, future.tradingSymbol),
        placeOrder('S', pe.bp, lotSize, pe.tradingSymbol),
        placeOrder('B', ce.sp, lotSize, ce.tradingSymbol),
      ]);
      console.log('Exiting...');
      process.exit(0);
    }
  } else {
    const result =
      (future.sp - equity.ltp + pe.sp - Math.max(strike - equity.ltp, 0) + Math.max(equity.ltp - strike, 0) - ce.bp) *
      lotSize;
    if (result <= config.EXIT_VALUE_DIFFERENCE) {
      console.log('Exit condition 2 satisfied for', symbol);
      await Promise.all([
        placeOrder('B', future.sp, lotSize, future.tradingSymbol),
        placeOrder('B', pe.sp, lotSize, pe.tradingSymbol),
        placeOrder('S', ce.bp, lotSize, ce.tradingSymbol),
      ]);
      console.log('Exiting...');
      process.exit(0);
    }
  }
}

export async function setupState() {
  // Get equities
  const equities = await getEquities();
  equities.forEach((equity) => {
    const state: StockState = {
      symbol: equity.symbol,
      equity: {
        token: equity.token,
        ltp: 0,
      },
      future: {
        token: '',
        tradingSymbol: '',
        bp: 0,
        sp: 0,
      },
      lotSize: 0,
      strike: 0,
      pe: {
        token: '',
        tradingSymbol: '',
        bp: 0,
        sp: 0,
      },
      ce: {
        token: '',
        tradingSymbol: '',
        bp: 0,
        sp: 0,
      },
    };
    stockState[equity.token] = state;
    stockState[equity.symbol] = state;
  });

  const passedEquitySymbols: string[] = [];
  // Filter out equities that do not satisfy the LTP threshold
  console.log(`Checking LTPs for ${equities.length} equities...`);
  await new Promise<void>((resolve, reject) => {
    let responseReceived = 0;
    const tokensToUnsubscribe: string[] = [];

    ticker.onmessage = (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(messageEvent.data as string) as TouchlineResponse;

      if (messageData.t === 'tk' && messageData.lp) {
        responseReceived++;
        const ltp = Number(messageData.lp);

        // Checkif LTP is below threshold
        if (ltp < config.LTP_THRESHOLD) {
          tokensToUnsubscribe.push(messageData.tk);

          // Remove from state
          const state = stockState[messageData.tk];
          const name = state.symbol;
          delete stockState[name];
          delete stockState[messageData.tk];
        } else {
          stockState[messageData.tk].equity.ltp = ltp;
          passedEquitySymbols.push(stockState[messageData.tk].symbol);
        }

        // Resolve once all responses are received
        if (responseReceived === equities.length) {
          console.log(`${tokensToUnsubscribe.length} equities did not satisfy the LTP threshold...`);
          ticker.send(
            JSON.stringify({
              t: 'u',
              k: tokensToUnsubscribe.join('#'),
            })
          );
          ticker.onmessage = null;
          ticker.onerror = null;
          resolve();
        }
      }
    };

    ticker.onerror = (error) => {
      reject(error);
    };

    ticker.send(
      JSON.stringify({
        t: 't',
        k: equities.map((equity) => `NSE|${equity.token}`).join('#'),
      })
    );
  });

  const nfoTokens: string[] = [];

  // Get futures
  const futures = await getFutures(config.EXPIRY, passedEquitySymbols);
  for (const future of futures) {
    const state = stockState[future.symbol];
    stockState[future.token] = state;
    state.future.token = future.token;
    state.future.tradingSymbol = future.tradingSymbol;
    state.lotSize = future.lotSize;
    nfoTokens.push(`NFO|${future.token}`);
  }

  // Get options
  for (const symbol of passedEquitySymbols) {
    const state = stockState[symbol];
    const options = await getInstrumentsForSymbol(config.EXPIRY, symbol);
    const nearestOptions = orderBy(options, (o) => Math.abs(state.equity.ltp - o.strikePrice)).slice(0, 2);

    for (const option of nearestOptions) {
      const state = stockState[option.symbol];
      state.strike = option.strikePrice;
      stockState[option.token] = state;
      const key = option.optionType.toLowerCase() as 'pe' | 'ce';
      state[key].token = option.token;
      state[key].tradingSymbol = option.tradingSymbol;
      nfoTokens.push(`NFO|${option.token}`);
    }
  }

  // Re-add ticker message handler
  ticker.onmessage = async (messageEvent: MessageEvent) => {
    const messageData = JSON.parse(messageEvent.data as string) as TouchlineResponse;
    const state = stockState[messageData.tk];

    let updated = false;
    if (messageData.tk === state.equity.token) {
      if (messageData.lp) {
        state.equity.ltp = Number(messageData.lp);
        updated = true;
      }
    } else if (messageData.tk === state.future.token) {
      if (messageData.bp1) {
        state.future.bp = Number(messageData.bp1);
        updated = true;
      }
      if (messageData.sp1) {
        state.future.sp = Number(messageData.sp1);
        updated = true;
      }
    } else if (messageData.tk === state.pe.token) {
      if (messageData.bp1) {
        state.pe.bp = Number(messageData.bp1);
        updated = true;
      }
      if (messageData.sp1) {
        state.pe.sp = Number(messageData.sp1);
        updated = true;
      }
    } else if (messageData.tk === state.ce.token) {
      if (messageData.bp1) {
        state.ce.bp = Number(messageData.bp1);
        updated = true;
      }
      if (messageData.sp1) {
        state.ce.sp = Number(messageData.sp1);
        updated = true;
      }
    }

    if (updated) {
      await checkEntryCondition(state);
    }
  };

  // Subscribe to all future and option tokens
  ticker.send(
    JSON.stringify({
      t: 't',
      k: nfoTokens.join('#'),
    })
  );
}
