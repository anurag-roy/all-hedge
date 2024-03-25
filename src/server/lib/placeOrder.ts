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
  console.log(
    `${transactionType === 'B' ? 'BUY' : 'SELL'} Order placed successfully for ${tradingSymbol} at price ${price} and quantity ${quantity}`
  );

  return orderResult;
};
