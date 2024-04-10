import env from '@shared/config/env.json';
import type { Margin, ShoonyaError } from '@shared/types/shoonya.js';
import ky from 'ky';

export const getMargin = async (tradingSymbol: string, price: number, quantity: number) => {
  const margin = await ky
    .post('https://api.shoonya.com/NorenWClientTP/GetOrderMargin', {
      body:
        'jData=' +
        JSON.stringify({
          uid: env.USER_ID,
          actid: env.USER_ID,
          exch: 'NFO',
          tsym: encodeURIComponent(tradingSymbol),
          qty: quantity.toString(),
          prc: price.toString(),
          prd: 'M',
          trantype: 'S',
          prctyp: 'LMT',
        }) +
        `&jKey=${process.env.token}`,
    })
    .json<Margin | ShoonyaError>();
  if (margin.stat !== 'Ok') {
    throw new Error(margin.emsg);
  }
  return margin;
};
