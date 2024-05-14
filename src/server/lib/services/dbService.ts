import { PrismaClient } from '@prisma/client';
import * as _ from 'lodash-es';
import { GlobalRef } from './GlobalRef.js';

class DbService {
  db = new PrismaClient();

  async getEquities() {
    return this.db.instrument.findMany({
      where: {
        instrument: 'EQ',
      },
      orderBy: {
        symbol: 'asc',
      },
    });
  }

  async getFutures(expiry: string, symbols?: string[]) {
    return this.db.instrument.findMany({
      where: {
        instrument: 'FUTSTK',
        expiry: {
          endsWith: expiry,
        },
        ...(symbols
          ? {
              symbol: {
                in: symbols,
              },
            }
          : {}),
      },
    });
  }

  async getInstrumentsForSymbol(expiry: string, symbol: string) {
    const options = await this.db.instrument.findMany({
      where: {
        symbol: symbol,
        exchange: 'NFO',
        optionType: {
          in: ['CE', 'PE'],
        },
        expiry: {
          endsWith: expiry,
        },
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
  }
}

const dbServiceRef = new GlobalRef<DbService>('myapp.dbService');
if (!dbServiceRef.value) {
  dbServiceRef.value = new DbService();
}

export default dbServiceRef.value;
