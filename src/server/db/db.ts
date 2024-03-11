import { PrismaClient } from '@prisma/client';
import { GlobalRef } from '@shared/GlobalRef.js';

const dbRef = new GlobalRef<PrismaClient>('myapp.prisma');
if (!dbRef.value) {
  dbRef.value = new PrismaClient();
}

export const db = dbRef.value;

export const getAllEquityStocks = async () => {
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

export const getInstrumentsToSubscribe = async (symbol: string, expiryPrefix: string) => {
  const equityStock = await db.instrument.findFirstOrThrow({
    where: {
      id: `${symbol}-EQ`,
    },
  });
  const optionsStocks = await db.instrument.findMany({
    where: {
      symbol: symbol,
      exchange: 'NFO',
      optionType: {
        in: ['CE', 'PE'],
      },
      expiry: {
        endsWith: expiryPrefix,
      },
    },
    orderBy: {
      strikePrice: 'asc',
    },
  });

  return {
    equityStock,
    optionsStocks,
  };
};
