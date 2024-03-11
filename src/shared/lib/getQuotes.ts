import env from '@shared/config/env.json';
import type { Quote, ShoonyaError } from '@shared/types/shoonya.js';
import ky from 'ky';

export const getQuotes = async (exchange: 'NSE' | 'NFO', instrumentToken: string) => {
  const quotes = await ky
    .post('https://api.shoonya.com/NorenWClientTP/GetQuotes', {
      body:
        'jData=' +
        JSON.stringify({
          uid: env.USER_ID,
          exch: exchange,
          token: instrumentToken,
        }) +
        `&jKey=${process.env.token}`,
    })
    .json<Quote | ShoonyaError>();
  if (quotes.stat !== 'Ok') {
    throw new Error(quotes.emsg);
  }
  return quotes as Quote;
};
