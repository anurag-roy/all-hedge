import { db } from '@server/globals/db.js';

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
  const optionsStocks = await db.instrument.findMany({
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

  return optionsStocks;
};
