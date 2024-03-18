import config from '@shared/config/config.js';
import { getInstruments } from '@shared/lib/getInstruments.js';
import { getKeys } from '@shared/lib/utils.js';
import Database from 'better-sqlite3';

// Create the sqlite db here
const DB_PATH = '.data/data.db';

const getSqliteType = (key: string, value: any) => (typeof value === 'number' ? 'REAL' : 'TEXT');

async function main() {
  const nseInstruments = await getInstruments('NSE');
  const nfoInstruments = await getInstruments('NFO');

  const instruments = [...nseInstruments, ...nfoInstruments].filter((i) => config.STOCKS_TO_INCLUDE.includes(i.symbol));

  const columns = getKeys(instruments[0]);

  const TABLE_NAME = 'instrument';
  const INSERT_BATCH_SIZE = 10000;

  // Create DB and table
  const db = new Database(DB_PATH);
  console.log('DB creation successful!');

  db.prepare(
    `CREATE TABLE ${TABLE_NAME} (` +
      'id TEXT NOT NULL PRIMARY KEY,' +
      columns.map((c) => `${c} ${getSqliteType(c, instruments[0][c])} NOT NULL`) +
      ');'
  ).run();
  console.log('Table creation successful!');

  const insert = (values: string[]) => {
    if (values.length === 0) return;
    db.exec(`INSERT INTO ${TABLE_NAME} (id, ${columns.join(',')}) VALUES ${values.join(',')};`);
  };

  // Variables to insert values in batches
  let currentBatchValues = [];
  let currentIteration = 0;

  console.log('Starting insert...');
  for (const instrument of instruments) {
    const currentRowValues = [];

    // Insert primary key Id
    currentRowValues.push(`'${instrument.tradingSymbol}'`);

    for (const col of columns) {
      currentRowValues.push(`'${instrument[col]}'`);
    }
    currentBatchValues.push(`(${currentRowValues.join(',')})`);

    // Execute insert statement once a batch is full
    currentIteration++;
    if (currentIteration % INSERT_BATCH_SIZE === 0) {
      insert(currentBatchValues);
      currentBatchValues = [];
    }
  }
  // Fire once more for leftover values
  insert(currentBatchValues);
  console.log('Data insertion successful!');
}

main().catch((error) => {
  console.log('Data preparation failed', error);
});
