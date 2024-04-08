import { db } from '@server/globals/db.js';
import * as _ from 'lodash-es';

export const getEquities = async () => {
  const equityStocks = await db.instrument.findMany({
    where: {
      instrument: 'EQ',
    },
    orderBy: {
      symbol: 'asc',
    },
  });
  return equityStocks;
};

export const getFutures = async (expiry: string, symbols?: string[]) => {
  const futures = await db.instrument.findMany({
    where: {
      instrument: 'FUTSTK',
      expiry: expiry,
      ...(symbols
        ? {
            symbol: {
              in: symbols,
            },
          }
        : {}),
    },
  });
  return futures;
};

export const getInstrumentsForSymbol = async (expiry: string, symbol: string) => {
  const options = await db.instrument.findMany({
    where: {
      symbol: symbol,
      exchange: 'NFO',
      optionType: {
        in: ['CE', 'PE'],
      },
      expiry: expiry,
    },
    orderBy: {
      strikePrice: 'asc',
    },
  });

  // Remove unpaired options
  const optionsGroupedByStrike = _.groupBy(options, (o) => o.strikePrice);
  return Object.values(optionsGroupedByStrike)
    .filter((o) => o.length === 2)
    .flatMap((o) => o);
};
