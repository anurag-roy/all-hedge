import { getBannedStocks } from '@server/lib/getBannedStocks.js';
import config from '@shared/config/config.js';
import { TouchlineResponse } from '@shared/types/shoonya.js';
import { ExcludedStock, ExclusionReason } from '@shared/types/stock.js';
import type { MessageEvent } from 'ws';
import { GlobalRef } from './GlobalRef.js';
import dbService from './dbService.js';
import logger from './logger.js';
import tickerService from './tickerService.js';

class ExcludedStocksService {
  private excludedStocks: ExcludedStock[] = [];

  async init() {
    const nseBannedStocks = await getBannedStocks();
    nseBannedStocks.forEach((symbol) => this.excludedStocks.push({ symbol, reason: ExclusionReason.NSE_BAN }));
    logger.info(`NSE bans found for ${nseBannedStocks.length} stocks`);

    const customBans = await dbService.db.bannedStocks.findMany();
    customBans.forEach((stock) => {
      if (!this.excludedStocks.some((excludedStock) => excludedStock.symbol === stock.symbol)) {
        this.excludedStocks.push({ symbol: stock.symbol, reason: ExclusionReason.CUSTOM_BAN });
      }
    });
    logger.info(`Custom bans found for ${customBans.length} stocks`);

    const equities = await dbService.getEquities();
    const filteredEquities = equities.filter(
      (equity) => !this.excludedStocks.some((excludedStock) => excludedStock.symbol === equity.symbol)
    );
    const eqTokens = filteredEquities.map((equity) => equity.token);

    logger.info(`Checking LTP for ${filteredEquities.length} stocks...`);
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
          if (responseReceived === filteredEquities.length) {
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
    } else {
      logger.info('No stocks with LTP below threshold.');
    }

    this.excludedStocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  getExcludedStocks() {
    return this.excludedStocks;
  }

  async addExcludedStock(symbol: string, reason: ExclusionReason) {
    if (reason === ExclusionReason.CUSTOM_BAN) {
      await dbService.db.bannedStocks.create({ data: { symbol } });
    }
    this.excludedStocks.push({ symbol, reason });
    this.excludedStocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
    return this.excludedStocks;
  }

  async removeExcludedStock(symbol: string) {
    const foundStockIndex = this.excludedStocks.findIndex((excludedStock) => excludedStock.symbol === symbol);
    if (foundStockIndex !== -1) {
      const foundStock = this.excludedStocks[foundStockIndex];
      this.excludedStocks.splice(foundStockIndex, 1);
      if (foundStock.reason === ExclusionReason.CUSTOM_BAN) {
        await dbService.db.bannedStocks.delete({ where: { symbol } });
      }
    }
    return this.excludedStocks;
  }
}

const excludedStocksServiceRef = new GlobalRef<ExcludedStocksService>('myapp.excludedStocksService');
if (!excludedStocksServiceRef.value) {
  excludedStocksServiceRef.value = new ExcludedStocksService();
}

export default excludedStocksServiceRef.value;
