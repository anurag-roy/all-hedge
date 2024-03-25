import { getEquities, getFutures, getInstrumentsForSymbol } from '@server/db/db.js';
import { ticker } from '@server/globals/ticker.js';
import { getBannedStocks } from '@server/lib/getBannedStocks.js';
import { getMargin } from '@server/lib/getMargin.js';
import { placeOrder } from '@server/lib/placeOrder.js';
import { throttle } from '@server/lib/utils.js';
import config from '@shared/config/config.js';
import type { DepthResponse, TouchlineResponse } from '@shared/types/shoonya.js';
import type { EnteredState, StockState } from '@shared/types/state.js';
import { orderBy } from 'lodash-es';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { MessageEvent } from 'ws';

const stockState: Record<string, StockState> = {};
const enteredStockState = getExistingEntries();
const enteredTokens = new Set(
  Object.values(enteredStockState).flatMap((entry) => [
    entry.equity.token,
    entry.future.token,
    entry.pe.token,
    entry.ce.token,
  ])
);

function getExistingEntries() {
  const files = readdirSync('.data/entries');
  const entries: Record<string, EnteredState> = {};
  for (const file of files) {
    const entry = JSON.parse(readFileSync(`.data/entries/${file}`, 'utf-8'));
    entries[entry.symbol] = entry;
  }
  return entries;
}

async function checkEntryCondition(state: StockState) {
  const { symbol, equity, future, ce, pe, strike, lotSize } = state;
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
    // TODO: get this from order response
    const orderState: EnteredState = {
      condition: 1,
      entryValueDifference: config.ENTRY_VALUE_DIFFERENCE,
      time: new Date().toISOString(),
      symbol: symbol,
      equity: {
        token: equity.token,
        ltp: equity.ltp,
      },
      future: {
        token: future.token,
        tradingSymbol: future.tradingSymbol,
        transactionType: 'B',
        price: future.sp,
        quantity: lotSize,
      },
      lotSize: lotSize,
      strike: strike,
      pe: {
        token: pe.token,
        tradingSymbol: pe.tradingSymbol,
        transactionType: 'B',
        price: pe.sp,
        quantity: lotSize,
      },
      ce: {
        token: ce.token,
        tradingSymbol: ce.tradingSymbol,
        transactionType: 'S',
        price: ce.bp,
        quantity: lotSize,
      },
    };
    writeFileSync(`.data/entries/${symbol}.json`, JSON.stringify(orderState, null, 4), 'utf-8');
    console.log('Exiting...');
    process.exit(0);
  }

  // Condition 2 calculation
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
    // TODO: Get this from order response
    const orderState: EnteredState = {
      condition: 2,
      entryValueDifference: config.ENTRY_VALUE_DIFFERENCE,
      time: new Date().toISOString(),
      symbol: symbol,
      equity: {
        token: equity.token,
        ltp: equity.ltp,
      },
      future: {
        token: future.token,
        tradingSymbol: future.tradingSymbol,
        transactionType: 'S',
        price: future.bp,
        quantity: lotSize,
      },
      lotSize: lotSize,
      strike: strike,
      pe: {
        token: pe.token,
        tradingSymbol: pe.tradingSymbol,
        transactionType: 'S',
        price: pe.bp,
        quantity: lotSize,
      },
      ce: {
        token: ce.token,
        tradingSymbol: ce.tradingSymbol,
        transactionType: 'B',
        price: ce.sp,
        quantity: lotSize,
      },
    };
    writeFileSync(`.data/entries/${symbol}.json`, JSON.stringify(orderState, null, 4), 'utf-8');
    console.log('Exiting...');
    process.exit(0);
  }
}

async function checkExitCondition(
  { symbol, equity, future, ce, pe, strike, lotSize }: StockState,
  entry: EnteredState
) {
  if (!equity.ltp || !future.bp || !future.sp || !pe.bp || !pe.sp || !ce.bp || !ce.sp) {
    return;
  }

  if (entry.condition === 1) {
    const result =
      (equity.ltp - future.bp + Math.max(strike - equity.ltp, 0) - pe.bp + ce.sp - Math.max(equity.ltp - strike, 0)) *
      lotSize;
    if (result <= config.EXIT_VALUE_DIFFERENCE) {
      console.log('Exit condition 1 satisfied for', symbol);
      await Promise.all([
        placeOrder('S', future.bp, entry.future.quantity, future.tradingSymbol),
        placeOrder('S', pe.bp, entry.pe.quantity, pe.tradingSymbol),
        placeOrder('B', ce.sp, entry.ce.quantity, ce.tradingSymbol),
      ]);
      rmSync(`.data/entries/${symbol}.json`);
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
        placeOrder('B', future.sp, entry.future.quantity, future.tradingSymbol),
        placeOrder('B', pe.sp, entry.pe.quantity, pe.tradingSymbol),
        placeOrder('S', ce.bp, entry.ce.quantity, ce.tradingSymbol),
      ]);
      rmSync(`.data/entries/${symbol}.json`);
      console.log('Exiting...');
      process.exit(0);
    }
  }
}

export async function setupState() {
  const bannedStocks = await getBannedStocks();
  // Get equities
  const equities = (await getEquities()).filter((e) => !bannedStocks.includes(e.symbol));

  equities.forEach((equity) => {
    const entry = enteredStockState[equity.symbol];
    const state: StockState = {
      symbol: equity.symbol,
      equity: {
        token: equity.token,
        ltp: 0,
        upperBound: 0,
        lowerBound: 0,
      },
      future: {
        token: entry?.future.token || '',
        tradingSymbol: entry?.future.tradingSymbol || '',
        bp: 0,
        sp: 0,
      },
      lotSize: entry?.lotSize || 0,
      strike: entry?.strike || 0,
      pe: {
        token: entry?.pe.token || '',
        tradingSymbol: entry?.pe.tradingSymbol || '',
        bp: 0,
        sp: 0,
      },
      ce: {
        token: entry?.ce.token || '',
        tradingSymbol: entry?.ce.tradingSymbol || '',
        bp: 0,
        sp: 0,
      },
    };
    stockState[equity.token] = state;
    stockState[equity.symbol] = state;
    if (entry) {
      stockState[entry.future.token] = state;
      stockState[entry.pe.token] = state;
      stockState[entry.ce.token] = state;
    }
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
        if (!enteredTokens.has(messageData.tk) && ltp < config.LTP_THRESHOLD) {
          tokensToUnsubscribe.push(`NSE|${messageData.tk}`);

          // Remove from state
          const state = stockState[messageData.tk];
          const name = state.symbol;
          delete stockState[name];
          delete stockState[messageData.tk];
        } else {
          stockState[messageData.tk].equity.ltp = ltp;
          if (!enteredTokens.has(messageData.tk)) {
            stockState[messageData.tk].equity.upperBound = ltp * (1 + config.LTP_MAX_CHANGE);
            stockState[messageData.tk].equity.lowerBound = ltp * (1 - config.LTP_MAX_CHANGE);
            passedEquitySymbols.push(stockState[messageData.tk].symbol);
          }
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
  for (const entry of Object.values(enteredStockState)) {
    nfoTokens.push(`NFO|${entry.future.token}`);
    nfoTokens.push(`NFO|${entry.pe.token}`);
    nfoTokens.push(`NFO|${entry.ce.token}`);
  }

  // Get futures
  const allfutures = await getFutures(config.EXPIRY, passedEquitySymbols);

  // Filter out futures according to margin
  console.log(`Checking margins for ${allfutures.length} futures...`);
  const getMarginArgs: Array<Parameters<typeof getMargin>> = allfutures.map((f) => [f.tradingSymbol, 0, f.lotSize]);
  const margins = await throttle(getMargin, getMarginArgs);
  const futures = allfutures.filter((future, index) => {
    const marginResponse = margins[index];
    if (marginResponse.status === 'rejected') {
      console.error('Error fetching margin for', future.symbol, marginResponse.reason);
      return false;
    }
    if (marginResponse.value.remarks === 'Insufficient Balance') {
      return false;
    }
    const margin = Number(marginResponse.value.ordermargin);
    return margin <= (0.9 * config.MARGIN) / 2;
  });
  console.log(`${allfutures.length - futures.length} futures did not satisfy the margin requirement...`);

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
    const strike = nearestOptions[0].strikePrice;

    // Check if strike price is within LTP bounds
    if (strike >= state.equity.upperBound || strike <= state.equity.lowerBound) {
      console.log('Strike price not within LTP bounds for', symbol);

      // Delete state
      delete stockState[state.symbol];
      delete stockState[state.equity.token];
      delete stockState[state.future.token];
      ticker.send(JSON.stringify({ t: 'u', k: `NSE|${state.equity.token}` }));
      const foundIndex = nfoTokens.indexOf(`NFO|${state.future.token}`);
      if (foundIndex !== -1) {
        nfoTokens.splice(foundIndex, 1);
      }
      continue;
    }

    for (const option of nearestOptions) {
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
    const messageData = JSON.parse(messageEvent.data as string) as DepthResponse;
    const state = stockState[messageData.tk];

    if (!state) {
      return;
    }

    let updated = false;
    if (messageData.tk === state.equity.token) {
      if (messageData.lp) {
        const newLtp = Number(messageData.lp);
        if (
          (!enteredTokens.has(messageData.tk) && newLtp > state.equity.upperBound) ||
          newLtp < state.equity.lowerBound
        ) {
          console.log('LTP change exceeded for', state.symbol);
          // Delete state
          delete stockState[state.symbol];
          delete stockState[state.equity.token];
          delete stockState[state.future.token];
          ticker.send(JSON.stringify({ t: 'u', k: `NSE|${state.equity.token}` }));
          return;
        }
        state.equity.ltp = Number(messageData.lp);
        updated = true;
      }
    } else if (messageData.tk === state.future.token) {
      if (messageData.bp2) {
        state.future.bp = Number(messageData.bp2);
        updated = true;
      }
      if (messageData.sp2) {
        state.future.sp = Number(messageData.sp2);
        updated = true;
      }
    } else if (messageData.tk === state.pe.token) {
      if (messageData.bp2) {
        state.pe.bp = Number(messageData.bp2);
        updated = true;
      }
      if (messageData.sp2) {
        state.pe.sp = Number(messageData.sp2);
        updated = true;
      }
    } else if (messageData.tk === state.ce.token) {
      if (messageData.bp2) {
        state.ce.bp = Number(messageData.bp2);
        updated = true;
      }
      if (messageData.sp2) {
        state.ce.sp = Number(messageData.sp2);
        updated = true;
      }
    }

    if (updated) {
      if (enteredTokens.has(messageData.tk)) {
        const entry = enteredStockState[state.symbol];
        if (entry) {
          await checkExitCondition(state, entry);
        }
      } else {
        await checkEntryCondition(state);
      }
    }
  };

  writeFileSync('.data/state.json', JSON.stringify(stockState, null, 4), 'utf-8');

  // Subscribe to all future and option tokens
  ticker.send(
    JSON.stringify({
      t: 'd',
      k: nfoTokens.join('#'),
    })
  );
}
