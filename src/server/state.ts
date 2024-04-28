import { getEquities, getFutures, getInstrumentsForSymbol } from '@server/db/db.js';
import { getBannedStocks } from '@server/lib/getBannedStocks.js';
import { getMargin } from '@server/lib/getMargin.js';
import { placeOrder } from '@server/lib/placeOrder.js';
import { throttle } from '@server/lib/utils.js';
import config from '@shared/config/config.js';
import env from '@shared/config/env.json';
import type { DepthResponse, TouchlineResponse } from '@shared/types/shoonya.js';
import type { AppStateProps, EnteredState, StockState } from '@shared/types/state.js';
import * as _ from 'lodash-es';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { WebSocket, type MessageEvent } from 'ws';

export class AppState {
  expiry: string;
  accountMargin: number;
  entryValueDifference: number;
  exitValueDifference: number;
  client: WebSocket;
  logId = 0;

  ticker: WebSocket | undefined;
  stockState: Record<string, StockState> = {};
  enteredStockState = this.getExistingEntries();
  enteredTokens = new Set(
    Object.values(this.enteredStockState).flatMap((entry) => [
      entry.equity.token,
      entry.future.token,
      entry.pe.token,
      entry.ce.token,
    ])
  );
  checkForEntry = true;

  constructor({ expiry, accountMargin, entryValueDifference, exitValueDifference, client }: AppStateProps) {
    this.expiry = expiry;
    this.accountMargin = accountMargin;
    this.entryValueDifference = entryValueDifference;
    this.exitValueDifference = exitValueDifference;
    this.client = client;
  }

  getExistingEntries() {
    const files = readdirSync('.data/entries');
    const entries: Record<string, EnteredState> = {};
    for (const file of files) {
      const entry = JSON.parse(readFileSync(`.data/entries/${file}`, 'utf-8'));
      entries[entry.symbol] = entry;
    }
    return entries;
  }

  async checkEntryCondition(state: StockState) {
    const { symbol, equity, future, ce, pe, strike, lotSize } = state;
    if (!equity.ltp || !future.bp || !future.sp || !pe.bp || !pe.sp || !ce.bp || !ce.sp) {
      return;
    }

    // Condition 1 calculation
    const result1 =
      (equity.ltp - future.sp + Math.max(strike - equity.ltp, 0) - pe.sp + ce.bp - Math.max(equity.ltp - strike, 0)) *
      lotSize;
    if (result1 >= this.entryValueDifference) {
      if (!state.isFirstPassSatisfied) {
        const log = [
          `First pass entry satisfied for ${symbol}`,
          `Future (${future.tradingSymbol}) Seller Price: ${future.sp}`,
          `Call (${ce.tradingSymbol}) Buyer Price: ${ce.bp}`,
          `Put (${pe.tradingSymbol}) Seller Price: ${pe.sp}`,
        ].join('\n');
        this.log(log);
        state.isFirstPassSatisfied = true;
        return;
      }

      const log = [
        `Second pass entry satisfied for ${symbol}`,
        `Future (${future.tradingSymbol}) Seller Price: ${future.sp}`,
        `Call (${ce.tradingSymbol}) Buyer Price: ${ce.bp}`,
        `Put (${pe.tradingSymbol}) Seller Price: ${pe.sp}`,
      ].join('\n');
      this.log(log);
      this.checkForEntry = false;
      state.isFirstPassSatisfied = false;
      await Promise.all([
        placeOrder('B', future.sp, lotSize, future.tradingSymbol).then((message) => this.log(message)),
        placeOrder('B', pe.sp, lotSize, pe.tradingSymbol).then((message) => this.log(message)),
        placeOrder('S', ce.bp, lotSize, ce.tradingSymbol).then((message) => this.log(message)),
      ]);
      // TODO: get this from order response
      const orderState: EnteredState = {
        condition: 1,
        entryValueDifference: this.entryValueDifference,
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
      this.enteredTokens.add(equity.token);
      this.enteredTokens.add(future.token);
      this.enteredTokens.add(pe.token);
      this.enteredTokens.add(ce.token);
      this.enteredStockState[symbol] = orderState;
    } else {
      if (state.isFirstPassSatisfied) {
        const log = [
          `Second pass entry not satisfied for ${symbol}`,
          `Future (${future.tradingSymbol}) Seller Price: ${future.sp}`,
          `Call (${ce.tradingSymbol}) Buyer Price: ${ce.bp}`,
          `Put (${pe.tradingSymbol}) Seller Price: ${pe.sp}`,
        ].join('\n');
        this.log(log);
        state.isFirstPassSatisfied = false;
      }
    }

    // Condition 2 calculation
    const result2 =
      (future.bp - equity.ltp + pe.bp - Math.max(strike - equity.ltp, 0) + Math.max(equity.ltp - strike, 0) - ce.sp) *
      lotSize;
    if (result2 >= this.entryValueDifference) {
      if (!state.isFirstPassSatisfied) {
        const log = [
          `First pass entry satisfied for ${symbol}`,
          `Future (${future.tradingSymbol}) Buyer Price: ${future.bp}`,
          `Call (${ce.tradingSymbol}) Seller Price: ${ce.sp}`,
          `Put (${pe.tradingSymbol}) Buyer Price: ${pe.bp}`,
        ].join('\n');
        this.log(log);
        state.isFirstPassSatisfied = true;
        return;
      }

      const log = [
        `Second pass entry satisfied for ${symbol}`,
        `Future (${future.tradingSymbol}) Buyer Price: ${future.bp}`,
        `Call (${ce.tradingSymbol}) Seller Price: ${ce.sp}`,
        `Put (${pe.tradingSymbol}) Buyer Price: ${pe.bp}`,
      ].join('\n');
      this.log(log);
      this.checkForEntry = false;
      state.isFirstPassSatisfied = false;
      await Promise.all([
        placeOrder('S', future.bp, lotSize, future.tradingSymbol).then((message) => this.log(message)),
        placeOrder('S', pe.bp, lotSize, pe.tradingSymbol).then((message) => this.log(message)),
        placeOrder('B', ce.sp, lotSize, ce.tradingSymbol).then((message) => this.log(message)),
      ]);
      // TODO: Get this from order response
      const orderState: EnteredState = {
        condition: 2,
        entryValueDifference: this.entryValueDifference,
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
      this.enteredTokens.add(equity.token);
      this.enteredTokens.add(future.token);
      this.enteredTokens.add(pe.token);
      this.enteredTokens.add(ce.token);
      this.enteredStockState[symbol] = orderState;
    } else {
      if (state.isFirstPassSatisfied) {
        const log = [
          `Second pass entry not satisfied for ${symbol}`,
          `Future (${future.tradingSymbol}) Buyer Price: ${future.bp}`,
          `Call (${ce.tradingSymbol}) Seller Price: ${ce.sp}`,
          `Put (${pe.tradingSymbol}) Buyer Price: ${pe.bp}`,
        ].join('\n');
        this.log(log);
        state.isFirstPassSatisfied = false;
      }
    }
  }

  async checkExitCondition({ symbol, equity, future, ce, pe, strike, lotSize }: StockState, entry: EnteredState) {
    if (!equity.ltp || !future.bp || !future.sp || !pe.bp || !pe.sp || !ce.bp || !ce.sp) {
      return;
    }

    if (entry.condition === 1) {
      const result =
        (equity.ltp - future.bp + Math.max(strike - equity.ltp, 0) - pe.bp + ce.sp - Math.max(equity.ltp - strike, 0)) *
        lotSize;
      if (result <= this.exitValueDifference) {
        this.log(`EXIT CONDITION 1 satisfied for ${symbol}`);
        await Promise.all([
          placeOrder('S', future.bp, entry.future.quantity, future.tradingSymbol).then((message) => this.log(message)),
          placeOrder('S', pe.bp, entry.pe.quantity, pe.tradingSymbol).then((message) => this.log(message)),
          placeOrder('B', ce.sp, entry.ce.quantity, ce.tradingSymbol).then((message) => this.log(message)),
        ]);
        rmSync(`.data/entries/${symbol}.json`);
        this.enteredTokens.delete(equity.token);
        this.enteredTokens.delete(future.token);
        this.enteredTokens.delete(pe.token);
        this.enteredTokens.delete(ce.token);
        delete this.enteredStockState[symbol];
      }
    } else {
      const result =
        (future.sp - equity.ltp + pe.sp - Math.max(strike - equity.ltp, 0) + Math.max(equity.ltp - strike, 0) - ce.bp) *
        lotSize;
      if (result <= this.exitValueDifference) {
        this.log(`EXIT CONDITION 2 satisfied for ${symbol}`);
        await Promise.all([
          placeOrder('B', future.sp, entry.future.quantity, future.tradingSymbol).then((message) => this.log(message)),
          placeOrder('B', pe.sp, entry.pe.quantity, pe.tradingSymbol).then((message) => this.log(message)),
          placeOrder('S', ce.bp, entry.ce.quantity, ce.tradingSymbol).then((message) => this.log(message)),
        ]);
        rmSync(`.data/entries/${symbol}.json`);
        this.enteredTokens.delete(equity.token);
        this.enteredTokens.delete(future.token);
        this.enteredTokens.delete(pe.token);
        this.enteredTokens.delete(ce.token);
        delete this.enteredStockState[symbol];
      }
    }
  }

  async connectTicker() {
    console.log('Connecting to ticker...');
    this.ticker = await new Promise((resolve, reject) => {
      const socket = new WebSocket('wss://api.shoonya.com/NorenWSTP/');

      const timeout = setTimeout(() => {
        reject('Ticker connection timed out.');
      }, 3000);

      socket.onopen = () => {
        console.log('Ticker initialized and ready to connect...');

        socket.send(
          JSON.stringify({
            t: 'c',
            uid: env.USER_ID,
            actid: env.USER_ID,
            susertoken: process.env.token,
            source: 'API',
          })
        );
      };

      socket.onmessage = (messageEvent: MessageEvent) => {
        const messageData = JSON.parse(messageEvent.data as string);
        if (messageData.t === 'ck' && messageData.s === 'OK') {
          console.log('Ticker connected successfully!');
          clearTimeout(timeout);
          resolve(socket);
        }
      };
    });
  }

  async setupState() {
    try {
      await this.connectTicker();
    } catch (error) {
      await this.connectTicker();
    }

    const bannedStocks = await getBannedStocks();
    this.log(`Banned stocks (${bannedStocks.length}): ${bannedStocks.join(', ')}`);
    // Get equities
    const equities = (await getEquities()).filter((e) => !bannedStocks.includes(e.symbol));

    equities.forEach((equity) => {
      const entry = this.enteredStockState[equity.symbol];
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
        isFirstPassSatisfied: false,
      };
      this.stockState[equity.token] = state;
      this.stockState[equity.symbol] = state;
      if (entry) {
        this.stockState[entry.future.token] = state;
        this.stockState[entry.pe.token] = state;
        this.stockState[entry.ce.token] = state;
      }
    });

    const passedEquitySymbols: string[] = [];
    // Filter out equities that do not satisfy the LTP threshold
    this.log(`Checking LTPs for ${equities.length} equities...`);
    await new Promise<void>((resolve, reject) => {
      let responseReceived = 0;
      const tokensToUnsubscribe: string[] = [];

      this.ticker!.onmessage = (messageEvent: MessageEvent) => {
        const messageData = JSON.parse(messageEvent.data as string) as TouchlineResponse;

        if (messageData.t === 'tk' && messageData.lp) {
          responseReceived++;
          const ltp = Number(messageData.lp);

          // Checkif LTP is below threshold
          if (!this.enteredTokens.has(messageData.tk) && ltp < config.LTP_THRESHOLD) {
            tokensToUnsubscribe.push(`NSE|${messageData.tk}`);

            // Remove from state
            this.log(`LTP below threshold for ${this.stockState[messageData.tk].symbol}`);
            const state = this.stockState[messageData.tk];
            const name = state.symbol;
            delete this.stockState[name];
            delete this.stockState[messageData.tk];
          } else {
            this.stockState[messageData.tk].equity.ltp = ltp;
            if (!this.enteredTokens.has(messageData.tk)) {
              this.stockState[messageData.tk].equity.upperBound = ltp * (1 + config.LTP_MAX_CHANGE);
              this.stockState[messageData.tk].equity.lowerBound = ltp * (1 - config.LTP_MAX_CHANGE);
              passedEquitySymbols.push(this.stockState[messageData.tk].symbol);
            }
          }

          // Resolve once all responses are received
          if (responseReceived === equities.length) {
            this.log(`${tokensToUnsubscribe.length} equities did not satisfy the LTP threshold...`);
            this.ticker!.send(
              JSON.stringify({
                t: 'u',
                k: tokensToUnsubscribe.join('#'),
              })
            );
            this.ticker!.onmessage = null;
            this.ticker!.onerror = null;
            resolve();
          }
        }
      };

      this.ticker!.onerror = (error) => {
        reject(error);
      };

      this.ticker!.send(
        JSON.stringify({
          t: 't',
          k: equities.map((equity) => `NSE|${equity.token}`).join('#'),
        })
      );
    });

    const nfoTokens: string[] = [];
    for (const entry of Object.values(this.enteredStockState)) {
      nfoTokens.push(`NFO|${entry.future.token}`);
      nfoTokens.push(`NFO|${entry.pe.token}`);
      nfoTokens.push(`NFO|${entry.ce.token}`);
    }

    // Get futures
    const allfutures = await getFutures(this.expiry, passedEquitySymbols);

    // Filter out futures according to margin
    this.log(`Checking margins for ${allfutures.length} futures...`);
    const getMarginArgs: Array<Parameters<typeof getMargin>> = allfutures.map((f) => [
      f.tradingSymbol,
      0.05,
      f.lotSize,
    ]);
    const margins = await throttle(getMargin, getMarginArgs);
    const futures = allfutures.filter((future, index) => {
      const marginResponse = margins[index];
      if (marginResponse.status === 'rejected') {
        console.error('Error fetching margin for', future.symbol, marginResponse.reason);
        return false;
      }
      // if (marginResponse.value.remarks === 'Insufficient Balance') {
      //   return false;
      // }
      const margin = Number(marginResponse.value.ordermargin);
      const isMarginSatisfied = margin <= (0.9 * this.accountMargin) / 2;
      if (!isMarginSatisfied) {
        this.log(`Margin not satisfied for ${future.symbol}`);
      }
      return isMarginSatisfied;
    });
    this.log(`${allfutures.length - futures.length} futures did not satisfy the margin requirement...`);

    for (const future of futures) {
      const state = this.stockState[future.symbol];
      this.stockState[future.token] = state;
      state.future.token = future.token;
      state.future.tradingSymbol = future.tradingSymbol;
      state.lotSize = future.lotSize;
      nfoTokens.push(`NFO|${future.token}`);
    }

    // Get options
    for (const symbol of passedEquitySymbols) {
      const state = this.stockState[symbol];
      const options = await getInstrumentsForSymbol(this.expiry, symbol);
      const nearestOptions = _.orderBy(options, (o) => Math.abs(state.equity.ltp - o.strikePrice)).slice(0, 2);
      const strike = nearestOptions[0].strikePrice;

      // Check if strike price is within LTP bounds
      if (strike >= state.equity.upperBound || strike <= state.equity.lowerBound) {
        this.log(`Strike price not within LTP bounds for ${symbol}`);

        // Delete state
        delete this.stockState[state.symbol];
        delete this.stockState[state.equity.token];
        delete this.stockState[state.future.token];
        this.ticker!.send(JSON.stringify({ t: 'u', k: `NSE|${state.equity.token}` }));
        const foundIndex = nfoTokens.indexOf(`NFO|${state.future.token}`);
        if (foundIndex !== -1) {
          nfoTokens.splice(foundIndex, 1);
        }
        continue;
      }

      for (const option of nearestOptions) {
        state.strike = option.strikePrice;
        this.stockState[option.token] = state;
        const key = option.optionType.toLowerCase() as 'pe' | 'ce';
        state[key].token = option.token;
        state[key].tradingSymbol = option.tradingSymbol;
        nfoTokens.push(`NFO|${option.token}`);
      }
    }

    // Re-add ticker message handler
    this.ticker!.onmessage = async (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(messageEvent.data as string) as DepthResponse;
      const state = this.stockState[messageData.tk];

      if (!state) {
        return;
      }

      let updated = false;
      if (messageData.tk === state.equity.token) {
        if (messageData.lp) {
          const newLtp = Number(messageData.lp);
          if (
            (!this.enteredTokens.has(messageData.tk) && newLtp > state.equity.upperBound) ||
            newLtp < state.equity.lowerBound
          ) {
            this.log(`LTP change exceeded for ${state.symbol}`);
            // Delete state
            delete this.stockState[state.symbol];
            delete this.stockState[state.equity.token];
            delete this.stockState[state.future.token];
            this.ticker!.send(JSON.stringify({ t: 'u', k: `NSE|${state.equity.token}` }));
            return;
          }
          state.equity.ltp = Number(messageData.lp);
          updated = true;
        }
      } else if (messageData.tk === state.future.token) {
        if (messageData.bp3) {
          state.future.bp = Number(messageData.bp3);
          updated = true;
        }
        if (messageData.sp3) {
          state.future.sp = Number(messageData.sp3);
          updated = true;
        }
      } else if (messageData.tk === state.pe.token) {
        if (messageData.bp3) {
          state.pe.bp = Number(messageData.bp3);
          updated = true;
        }
        if (messageData.sp3) {
          state.pe.sp = Number(messageData.sp3);
          updated = true;
        }
      } else if (messageData.tk === state.ce.token) {
        if (messageData.bp3) {
          state.ce.bp = Number(messageData.bp3);
          updated = true;
        }
        if (messageData.sp3) {
          state.ce.sp = Number(messageData.sp3);
          updated = true;
        }
      }

      if (updated) {
        if (this.enteredTokens.has(messageData.tk)) {
          const entry = this.enteredStockState[state.symbol];
          if (entry) {
            await this.checkExitCondition(state, entry);
          }
        } else if (this.checkForEntry) {
          await this.checkEntryCondition(state);
        }
      }
    };

    writeFileSync('.data/state.json', JSON.stringify(this.stockState, null, 4), 'utf-8');

    // Subscribe to all future and option tokens
    this.ticker!.send(
      JSON.stringify({
        t: 'd',
        k: nfoTokens.join('#'),
      })
    );
  }

  destroyState() {
    this.ticker!.close();
    this.ticker = undefined;
  }

  log(message: string) {
    this.logId++;
    console.log(message);
    this.client.send(JSON.stringify({ type: 'log', data: { id: this.logId, timeStamp: Date.now(), message } }));
  }
}
