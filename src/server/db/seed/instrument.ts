import { PrismaClient } from '@prisma/client';
import { getInstruments } from '@server/lib/getInstruments.js';
import config from '@shared/config/config.js';
import * as _ from 'lodash-es';

const db = new PrismaClient();

const nseInstruments = await getInstruments('NSE');
const nfoInstruments = await getInstruments('NFO');

const filteredInstruments = [...nseInstruments, ...nfoInstruments].filter((i) =>
  config.STOCKS_TO_INCLUDE.includes(i.symbol)
);
const instruments = _.orderBy(filteredInstruments, (i) => [i.symbol]);

await db.instrument.deleteMany();
await db.instrument.createMany({
  data: instruments.map((i) => ({
    id: i.tradingSymbol,
    ...i,
  })),
});

console.log('Instruments seeded successfully');
