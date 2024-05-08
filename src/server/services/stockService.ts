import { getBannedStocks } from '@server/lib/getBannedStocks.js';
import config from '@shared/config/config.js';
import { TouchlineResponse } from '@shared/types/shoonya.js';
import { ExcludedStock, ExclusionReason } from '@shared/types/stock.js';
import type { MessageEvent } from 'ws';
import { GlobalRef } from './GlobalRef.js';
import dbService from './dbService.js';
import logger from './logger.js';
import tickerService from './tickerService.js';

class StockService {
  excludedStocks: ExcludedStock[] = [];

  async init() {
    const nseBannedStocks = await getBannedStocks();
    nseBannedStocks.forEach((symbol) => this.excludedStocks.push({ symbol, reason: ExclusionReason.NSE_BAN }));

    const customBans = await dbService.db.bannedStocks.findMany();
    customBans.forEach((stock) => {
      if (!this.excludedStocks.some((excludedStock) => excludedStock.symbol === stock.symbol)) {
        this.excludedStocks.push({ symbol: stock.symbol, reason: ExclusionReason.CUSTOM_BAN });
      }
    });

    const equities = await dbService.getEquities();
    const filteredEquities = equities.filter(
      (equity) => !this.excludedStocks.some((excludedStock) => excludedStock.symbol === equity.symbol)
    );
    const eqTokens = filteredEquities.map((equity) => equity.token);

    const ltpBelowThresholdTokens: string[] = [];
    await new Promise<void>((resolve, reject) => {
      let responseReceived = 0;

      tickerService.ticker.onmessage = (messageEvent: MessageEvent) => {
        const messageData = JSON.parse(messageEvent.data as string) as TouchlineResponse;

        if (messageData.t === 'tk' && messageData.lp) {
          responseReceived++;
          const ltp = Number(messageData.lp);

          // Checkif LTP is below threshold
          if (ltp < config.LTP_THRESHOLD) {
            ltpBelowThresholdTokens.push(messageData.tk);
          }

          // Resolve once all responses are received
          if (responseReceived === equities.length) {
            tickerService.ticker.onmessage = null;
            tickerService.ticker.onerror = null;
            resolve();
          }
        }
      };

      tickerService.ticker.onerror = (error) => {
        reject(error);
      };

      tickerService.ticker.send(
        JSON.stringify({
          t: 't',
          k: eqTokens.map((token) => `NSE|${token}`).join('#'),
        })
      );
    });

    if (ltpBelowThresholdTokens.length) {
      logger.info(`LTP below threshold for ${ltpBelowThresholdTokens.length} stocks.`);
      ltpBelowThresholdTokens.forEach((token) => {
        const equity = equities.find((equity) => equity.token === token);
        if (equity) {
          this.excludedStocks.push({ symbol: equity.symbol, reason: ExclusionReason.LTP_BELOW_THRESHOLD });
        }
      });
      tickerService.ticker.send(
        JSON.stringify({
          t: 'u',
          k: ltpBelowThresholdTokens.map((t) => `NSE|${t}`).join('#'),
        })
      );
    }
  }
}

const stockServiceRef = new GlobalRef<StockService>('myapp.stockService');
if (!stockServiceRef.value) {
  stockServiceRef.value = new StockService();
}

export default stockServiceRef.value;
