import { ShoonyaInstrument } from '@shared/types/shoonya.js';
import JSZip from 'jszip';
import ky from 'ky';

export const getInstruments = async (forExchange: 'NSE' | 'NFO') => {
  const txtFileName = `${forExchange}_symbols.txt`;
  const zipFileName = `${txtFileName}.zip`;

  const arrayBuffer = await ky.get(`https://api.shoonya.com/${zipFileName}`).arrayBuffer();

  const jsZip = new JSZip();
  const result = await jsZip.loadAsync(arrayBuffer);
  const file = result.file(txtFileName);
  if (!file) {
    ('Did not find the expected .txt file. Exiting...');
    process.exit(1);
  }

  const output: ShoonyaInstrument[] = [];

  const fileContents = await file.async('text');
  const rows = fileContents.split('\n').slice(1);

  for (const row of rows) {
    if (forExchange === 'NSE') {
      const [exchange, token, lotSize, symbol, tradingSymbol, instrument, tickSize] = row.split(',');

      if (instrument === 'EQ') {
        output.push({
          exchange,
          token,
          lotSize: Number(lotSize),
          symbol,
          tradingSymbol,
          expiry: '',
          instrument,
          optionType: 'XX',
          strikePrice: 0,
          tickSize,
        });
      }
    } else if (forExchange === 'NFO') {
      const [exchange, token, lotSize, symbol, tradingSymbol, expiry, instrument, optionType, strikePrice, tickSize] =
        row.split(',');

      output.push({
        exchange,
        token,
        lotSize: Number(lotSize),
        symbol,
        tradingSymbol,
        expiry,
        instrument,
        optionType,
        strikePrice: Number(strikePrice),
        tickSize,
      });
    }
  }

  return output;
};
