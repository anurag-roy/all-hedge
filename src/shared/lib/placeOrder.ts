import env from '@shared/config/env.json';

export const placeOrder = async (
  transactionType: 'B' | 'S',
  price: number,
  quantity: number,
  tradingSymbol: string
) => {
  // const orderResult = await ky
  //   .post('https://api.shoonya.com/NorenWClientTP/PlaceOrder', {
  //     body:
  //       'jData=' +
  //       JSON.stringify({
  //         uid: env.USER_ID,
  //         actid: env.USER_ID,
  //         exch: 'NFO',
  //         tsym: String(tradingSymbol),
  //         qty: String(quantity),
  //         prc: String(price),
  //         prd: 'M',
  //         trantype: transactionType,
  //         prctyp: 'LMT',
  //         ret: 'DAY',
  //       }) +
  //       `&jKey=${process.env.token}`,
  //   })
  //   .json<any>();

  const orderResult = {};
  console.log('[MOCK] Order placed successfully for', {
    uid: env.USER_ID,
    actid: env.USER_ID,
    exch: 'NFO',
    tsym: String(tradingSymbol),
    qty: String(quantity),
    prc: String(price),
    prd: 'M',
    trantype: transactionType,
    prctyp: 'LMT',
    ret: 'DAY',
  });

  return orderResult;
};
