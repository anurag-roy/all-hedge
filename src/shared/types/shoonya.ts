export type ShoonyaError = {
  /**
   * User details success or failure indication.
   */
  stat: 'Not_Ok';
  /**
   * Error message
   */
  emsg: string;
};

export type ShoonyaInstrument = {
  exchange: string;
  token: string;
  lotSize: number;
  symbol: string;
  tradingSymbol: string;
  expiry: string;
  instrument: string;
  optionType: string;
  strikePrice: number;
  tickSize: string;
};

export type LoginResponse = {
  /**
   * Login Success Or failure status
   */
  stat: 'OK';
  /**
   * It will be present only on login success. tdis data to be sent in subsequent requests in jKey field and web socket connection while connecting.
   */
  susertoken: string;
  /**
   * It will be present only on login success.
   */
  lastaccesstime: string;
  /**
   * If Y Mandatory password reset to be enforced. Otherwise the field will be absent.
   */
  spasswordreset?: 'Y';
  /**
   * Json array of strings with enabled exchange names
   */
  exarr: string;
  /**
   * User name
   */
  uname: string;
  /**
   * Json array of Product Obj with enabled products, as defined below.
   */
  prarr: string;
  /**
   * Account id
   */
  actid: string;
  /**
   * Email Id
   */
  email: string;
  /**
   * Broker id
   */
  brkname: string;
};

export type UserDetails = {
  /**
   * User details success or failure indication.
   */
  stat: 'Ok';
  /**
   * Json array of strings with enabled exchange names
   */
  exarr: string[];
  /**
   * Json array of strings with enabled price types for user
   */
  orarr: string[];
  /**
   * Json array of Product Obj with enabled products, as defined below.
   */
  prarr: Array<{
    /**
     * Product name
     */
    prd: string;
    /**
     * Product display name
     */
    s_prdt_ali: string;
    /**
     * Json array of strings with enabled, allowed exchange names
     */
    exch: string[];
  }>;
  /**
   * Broker id
   */
  brkname: string;
  /**
   * Branch id
   */
  brnchid: string;
  /**
   * Email id
   */
  email: string;
  /**
   * Account id
   */
  actid: string;
  /**
   * User id
   */
  uid: string;
  /**
   * User name
   */
  uname: string;
  /**
   * Mobile Number
   */
  m_num: string;
  /**
   * Always it will be an INVESTOR, other types of user not allowed to login using this API.
   */
  uprev: 'INVESTOR';
  /**
   * It will be present only in a successful response.
   */
  request_time: string;
};

export type Limits = {
  /**
   * Limits request success or failure indication.
   */
  stat: 'Ok';
  /**
   * Account id
   */
  actid: string;
  /**
   * Product name
   */
  prd: string;
  /**
   * Segment
   */
  seg: 'CM' | 'FO' | 'FX';
  /**
   * Exchange
   */
  exch: string;

  // ------Cash Primary Fields-------
  /**
   * Cash Margin available
   */
  cash: string;
  /**
   * Total Amount transferred using Payins today
   */
  payin: string;
  /**
   * Total amount requested for withdrawal today
   */
  payout: string;

  // ---Cash Additional Fields-----
  /**
   * Prevalued Collateral Amount
   */
  brkcollamt: string;
  /**
   * Uncleared Cash (Payin through cheques)
   */
  unclearedcash: string;
  /**
   * Additional leverage amount / Amount added to handle system errors - by broker.
   */
  daycash: string;

  // ----Margin Utilized-----
  /**
   * Total margin / fund used today
   */
  marginused: string;
  /**
   * Mtom current percentage
   */
  mtomcurper: string;

  // ----Margin Used components----
  /**
   * CAC Buy used
   */
  cbu: string;
  /**
   * CAC Sell Credits
   */
  csc: string;
  /**
   * Current realized PNL
   */
  rpnl: string;
  /**
   * Current unrealized mtom
   */
  unmtom: string;
  /**
   * Covered Product margins
   */
  marprt: string;
  /**
   * Span used
   */
  span: string;
  /**
   * Exposure margin
   */
  expo: string;
  /**
   * Premium used
   */
  premium: string;
  /**
   * Var Elm Margin
   */
  varelm: string;
  /**
   * Gross Exposure
   */
  grexpo: string;
  /**
   * Gross Exposure derivative
   */
  greexpo_d: string;
  /**
   * Scrip basket margin
   */
  scripbskmar: string;
  /**
   * Additional scrip basket margin
   */
  addscripbskmrg: string;
  /**
   * Brokerage amount
   */
  brokerage: string;
  /**
   * Collateral calculated based on uploaded holdings
   */
  collateral: string;
  /**
   * Valuation of uploaded holding pre haircut
   */
  grcoll: string;
  turnoverlmt: string;
  pendordvallmt: string;

  // -------Additional Risk Indicators------
  /**
   * Turnover
   */
  turnover: string;
  /**
   * Pending Order value
   */
  pendordval: string;
  // ------Margin used detailed breakup fields----
  /**
   * Current realized PNL (Equity Intraday)
   */
  rzpnl_e_i: string;
  /**
   * Current realized PNL (Equity Margin)
   */
  rzpnl_e_m: string;
  /**
   * Current realized PNL (Equity Cash n Carry)
   */
  rzpnl_e_c: string;
  /**
   * Current realized PNL (Derivative Intraday)
   */
  rzpnl_d_i: string;
  /**
   * Current realized PNL (Derivative Margin)
   */
  rzpnl_d_m: string;
  /**
   * Current realized PNL (FX Intraday)
   */
  rzpnl_f_i: string;
  /**
   * Current realized PNL (FX Margin)
   */
  rzpnl_f_m: string;
  /**
   * Current realized PNL (Commodity Intraday)
   */
  rzpnl_c_i: string;
  /**
   * Current realized PNL (Commodity Margin)
   */
  rzpnl_c_m: string;
  /**
   * Current unrealized MTOM (Equity Intraday)
   */
  uzpnl_e_i: string;
  /**
   * Current unrealized MTOM (Equity Margin)
   */
  uzpnl_e_m: string;
  /**
   * Current unrealized MTOM (Equity Cash n Carry)
   */
  uzpnl_e_c: string;
  /**
   * Current unrealized MTOM (Derivative Intraday)
   */
  uzpnl_d_i: string;
  /**
   * Current unrealized MTOM (Derivative Margin)
   */
  uzpnl_d_m: string;
  /**
   * Current unrealized MTOM (FX Intraday)
   */
  uzpnl_f_i: string;
  /**
   * Current unrealized MTOM (FX Margin)
   */
  uzpnl_f_m: string;
  /**
   * Current unrealized MTOM (Commodity Intraday)
   */
  uzpnl_c_i: string;
  /**
   * Current unrealized MTOM (Commodity Margin)
   */
  uzpnl_c_m: string;
  /**
   * Span Margin (Derivative Intraday)
   */
  span_d_i: string;
  /**
   * Span Margin (Derivative Margin)
   */
  span_d_m: string;
  /**
   * Span Margin (FX Intraday)
   */
  span_f_i: string;
  /**
   * Span Margin (FX Margin)
   */
  span_f_m: string;
  /**
   * Span Margin (Commodity Intraday)
   */
  span_c_i: string;
  /**
   * Span Margin (Commodity Margin)
   */
  span_c_m: string;
  /**
   * Exposure Margin (Derivative Intraday)
   */
  expo_d_i: string;
  /**
   * Exposure Margin (Derivative Margin)
   */
  expo_d_m: string;
  /**
   * Exposure Margin (FX Intraday)
   */
  expo_f_i: string;
  /**
   * Exposure Margin (FX Margin)
   */
  expo_f_m: string;
  /**
   * Exposure Margin (Commodity Intraday)
   */
  expo_c_i: string;
  /**
   * Exposure Margin (Commodity Margin)
   */
  expo_c_m: string;
  /**
   * Option premium (Derivative Intraday)
   */
  premium_d_i: string;
  /**
   * Option premium (Derivative Margin)
   */
  premium_d_m: string;
  /**
   * Option premium (FX Intraday)
   */
  premium_f_i: string;
  /**
   * Option premium (FX Margin)
   */
  premium_f_m: string;
  /**
   * Option premium (Commodity Intraday)
   */
  premium_c_i: string;
  /**
   * Option premium (Commodity Margin)
   */
  premium_c_m: string;
  /**
   * Var Elm (Equity Intraday)
   */
  varelm_e_i: string;
  /**
   * Var Elm (Equity Margin)
   */
  varelm_e_m: string;
  /**
   * Var Elm (Equity Cash n Carry)
   */
  varelm_e_c: string;
  /**
   * Covered Product margins (Equity High leverage)
   */
  marprt_e_h: string;
  /**
   * Covered Product margins (Equity Bracket Order)
   */
  marprt_e_b: string;
  /**
   * Covered Product margins (Derivative High leverage)
   */
  marprt_d_h: string;
  /**
   * Covered Product margins (Derivative Bracket Order)
   */
  marprt_d_b: string;
  /**
   * Covered Product margins (FX High leverage)
   */
  marprt_f_h: string;
  /**
   * Covered Product margins (FX Bracket Order)
   */
  marprt_f_b: string;
  /**
   * Covered Product margins (Commodity High leverage)
   */
  marprt_c_h: string;
  /**
   * Covered Product margins (Commodity Bracket Order)
   */
  marprt_c_b: string;
  /**
   * Scrip basket margin (Equity Intraday)
   */
  scripbskmar_e_i: string;
  /**
   * Scrip basket margin (Equity Margin)
   */
  scripbskmar_e_m: string;
  /**
   * Scrip basket margin (Equity Cash n Carry)
   */
  scripbskmar_e_c: string;
  /**
   * Additional scrip basket margin (Derivative Intraday)
   */
  addscripbskmrg_d_i: string;
  /**
   * Additional scrip basket margin (Derivative Margin)
   */
  addscripbskmrg_d_m: string;
  /**
   * Additional scrip basket margin (FX Intraday)
   */
  addscripbskmrg_f_i: string;
  /**
   * Additional scrip basket margin (FX Margin)
   */
  addscripbskmrg_f_m: string;
  /**
   * Additional scrip basket margin (Commodity Intraday)
   */
  addscripbskmrg_c_i: string;
  /**
   * Additional scrip basket margin (Commodity Margin)
   */
  addscripbskmrg_: string;
  c_m: string;
  /**
   * Brokerage (Equity Intraday)
   */
  brkage_e_i: string;
  /**
   * Brokerage (Equity Margin)
   */
  brkage_e_m: string;
  /**
   * Brokerage (Equity CAC)
   */
  brkage_e_c: string;
  /**
   * Brokerage (Equity High Leverage)
   */
  brkage_e_h: string;
  /**
   * Brokerage (Equity Bracket Order)
   */
  brkage_e_b: string;
  /**
   * Brokerage (Derivative Intraday)
   */
  brkage_d_i: string;
  /**
   * Brokerage (Derivative Margin)
   */
  brkage_d_m: string;
  /**
   * Brokerage (Derivative High Leverage)
   */
  brkage_d_h: string;
  /**
   * Brokerage (Derivative Bracket Order)
   */
  brkage_d_b: string;
  /**
   * Brokerage (FX Intraday)
   */
  brkage_f_i: string;
  /**
   * Brokerage (FX Margin)
   */
  brkage_f_m: string;
  /**
   * Brokerage (FX High Leverage)
   */
  brkage_f_h: string;
  /**
   * Brokerage (FX Bracket Order)
   */
  brkage_f_b: string;
  /**
   * Brokerage (Commodity Intraday)
   */
  brkage_c_i: string;
  /**
   * Brokerage (Commodity Margin)
   */
  brkage_c_m: string;
  /**
   * Brokerage (Commodity High Leverage)
   */
  brkage_c_h: string;
  /**
   * Brokerage (Commodity Bracket Order)
   */
  brkage_c_b: string;
  /**
   * Peak margin used by the client
   */
  peak_mar: string;
};

export type Margin = {
  /**
   * Response received time.
   */
  request_time: string;
  /**
   * Place order success or failure indication.
   */
  stat: 'Ok';
  /**
   * Total credits available for order
   */
  cash: string;
  /**
   * Total margin used.
   */
  marginused: string;
  /**
   * This field will be available only on success.
   */
  remarks: 'Insufficient Balance' | 'Order Success';
  /**
   * Previously used margin.
   */
  marginusedprev: string;
  /**
   * Margin required for order.
   */
  ordermargin: string;
};

export type Quote = {
  /**
   * Time of request
   */
  request_time: string;
  /**
   * Market watch success or failure indication
   */
  stat: 'Ok';
  /**
   * Exchange
   */
  exch: 'NSE' | 'NFO' | 'CDS' | 'MCX' | 'BSE';
  /**
   * Trading Symbol
   */
  tsym: string;
  /**
   * Company Name
   */
  cname: string;
  /**
   * Symbol Name
   */
  symname: string;
  /**
   * Segment
   */
  seg: string;
  /**
   * Expiry Date
   */
  exd: string;
  /**
   * Intrument Name
   */
  instname: string;
  /**
   * Strike Price
   */
  strprc: string;
  /**
   * ISIN
   */
  isin: string;
  /**
   * Tick Size
   */
  ti: string;
  /**
   * Lot Size
   */
  ls: string;
  /**
   * Price precision
   */
  pp: string;
  /**
   * Multiplier
   */
  mult: string;
  /**
   * Upper circuit limit
   */
  uc: string;
  /**
   * Lower circuit limit
   */
  lc: string;
  /**
   * Price factor ((GN / GD) * (PN/PD))
   */
  prcftr_d: string;
  /**
   * Token
   */
  token: string;
  /**
   * LTP
   */
  lp: string;
  /**
   * Open Price
   */
  o: string;
  /**
   * Day High Price
   */
  h: string;
  /**
   * Day Low Price
   */
  l: string;
  /**
   * Close Price
   */
  c: string;
  /**
   * Volume
   */
  v: string;
  /**
   * Last trade quantity
   */
  ltq: string;
  /**
   * Last trade time
   */
  ltt: string;
  /**
   * Best Buy Price 1
   */
  bp1: string;
  /**
   * Best Sell Price 1
   */
  sp1: string;
  /**
   * Best Buy Price 2
   */
  bp2: string;
  /**
   * Best Sell Price 2
   */
  sp2: string;
  /**
   * Best Buy Price 3
   */
  bp3: string;
  /**
   * Best Sell Price 3
   */
  sp3: string;
  /**
   * Best Buy Price 4
   */
  bp4: string;
  /**
   * Best Sell Price 4
   */
  sp4: string;
  /**
   * Best Buy Price 5
   */
  bp5: string;
  /**
   * Best Sell Price 5
   */
  sp5: string;
  /**
   * Best Buy Quantity 1
   */
  bq1: string;
  /**
   * Best Sell Quantity 1
   */
  sq1: string;
  /**
   * Best Buy Quantity 2
   */
  bq2: string;
  /**
   * Best Sell Quantity 2
   */
  sq2: string;
  /**
   * Best Buy Quantity 3
   */
  bq3: string;
  /**
   * Best Sell Quantity 3
   */
  sq3: string;
  /**
   * Best Buy Quantity 4
   */
  bq4: string;
  /**
   * Best Sell Quantity 4
   */
  sq4: string;
  /**
   * Best Buy Quantity 5
   */
  bq5: string;
  /**
   * Best Sell Quantity 5
   */
  sq5: string;
  /**
   * Best Buy Order 1
   */
  bo1: string;
  /**
   * Best Sell Order 1
   */
  so1: string;
  /**
   * Best Buy Order 2
   */
  bo2: string;
  /**
   * Best Sell Order 2
   */
  so2: string;
  /**
   * Best Buy Order 3
   */
  bo3: string;
  /**
   * Best Sell Order 3
   */
  so3: string;
  /**
   * Best Buy Order 4
   */
  bo4: string;
  /**
   * Best Sell Order 4
   */
  so4: string;
  /**
   * Best Buy Order 5
   */
  bo5: string;
  /**
   * Best Sell Order 5
   */
  so5: string;
};

export type TouchlineResponse = {
  /**
   * ‘tk’ represents connect acknowledgement
   * ‘tf’ represents touchline feed
   */
  t: 'tk' | 'tf';
  /**
   * Exchange name
   */
  e: 'NSE' | 'NFO' | 'CDS' | 'MCX' | 'BSE';
  /**
   * Scrip Token
   */
  tk: string;
  /**
   * Price precision
   */
  pp: string;
  /**
   * Trading Symbol
   */
  ts: string;
  /**
   * Tick size
   */
  ti: string;
  /**
   * Lot size
   */
  ls: string;
  /**
   * LTP
   */
  lp: string;
  /**
   * Percentage change
   */
  pc: string;
  /**
   * volume
   */
  v: string;
  /**
   * Open price
   */
  o: string;
  /**
   * High price
   */
  h: string;
  /**
   * Low price
   */
  I: string;
  /**
   * Close price
   */
  c: string;
  /**
   * Average trade price
   */
  ap: string;
  /**
   * Open interest
   */
  oi: string;
  /**
   * Previous day closing Open Interest
   */
  poi: string;
  /**
   * Total open interest for underlying
   */
  toi: string;
  /**
   * Best Buy Quantity 1
   */
  bq1: string;
  /**
   * Best Buy Price 1
   */
  bp1: string;
  /**
   * Best Sell Quantity 1
   */
  sq1: string;
  /**
   * Best Sell Price 1
   */
  sp1: string;
};

export type DepthResponse = {
  /**
   * ‘dk’ represents depth acknowledgement
   * ‘df’ represents depth feed
   */
  t: 'dk' | 'df';
  /**
   * Exchange name
   */
  e: 'NSE' | 'NFO' | 'CDS' | 'MCX' | 'BSE';
  /**
   * Scrip Token
   */
  tk: string;
  /**
   * LTP
   */
  lp: string;
  /**
   * Percentage change
   */
  pc: string;
  /**
   * volume
   */
  v: string;
  /**
   * Open price
   */
  o: string;
  /**
   * High price
   */
  h: string;
  /**
   * Low price
   */
  l: string;
  /**
   * Close price
   */
  c: string;
  /**
   * Average trade price
   */
  ap: string;
  /**
   * Last trade time
   */
  ltt: string;
  /**
   * Last trade quantity
   */
  ltq: string;
  /**
   * Total Buy Quantity
   */
  tbq: string;
  /**
   * Total Sell Quantity
   */
  tsq: string;
  /**
   * Best Buy Quantity 1
   */
  bq1: string;
  /**
   * Best Buy Quantity 2
   */
  bq2: string;
  /**
   * Best Buy Quantity 3
   */
  bq3: string;
  /**
   * Best Buy Quantity 4
   */
  bq4: string;
  /**
   * Best Buy Quantity 5
   */
  bq5: string;
  /**
   * Best Buy Price 1
   */
  bp1: string;
  /**
   * Best Buy Price 2
   */
  bp2: string;
  /**
   * Best Buy Price 3
   */
  bp3: string;
  /**
   * Best Buy Price 4
   */
  bp4: string;
  /**
   * Best Buy Price 5
   */
  bp5: string;
  /**
   * Best Buy Orders 1
   */
  bo1: string;
  /**
   * Best Buy Orders 2
   */
  bo2: string;
  /**
   * Best Buy Orders 3
   */
  bo3: string;
  /**
   * Best Buy Orders 4
   */
  bo4: string;
  /**
   * Best Buy Orders 5
   */
  bo5: string;
  /**
   * Best Sell Quantity 1
   */
  sq1: string;
  /**
   * Best Sell Quantity 2
   */
  sq2: string;
  /**
   * Best Sell Quantity 3
   */
  sq3: string;
  /**
   * Best Sell Quantity 4
   */
  sq4: string;
  /**
   * Best Sell Quantity 5
   */
  sq5: string;
  /**
   * Best Sell Price 1
   */
  sp1: string;
  /**
   * Best Sell Price 2
   */
  sp2: string;
  /**
   * Best Sell Price 3
   */
  sp3: string;
  /**
   * Best Sell Price 4
   */
  sp4: string;
  /**
   * Best Sell Price 5
   */
  sp5: string;
  /**
   * Best Sell Orders 1
   */
  so1: string;
  /**
   * so3
   */
  so2: string;
  /**
   * Best Sell Orders 4
   */
  so4: string;
  /**
   * Best Sell Orders 5
   */
  so5: string;
  /**
   * Lower Circuit Limit
   */
  lc: string;
  /**
   * Upper Circuit Limit
   */
  uc: string;
  /**
   * 52 week high low in other exchanges, Life time high low in mcx
   */
  '52h': string;
  /**
   * 52 week high low in other exchanges, Life time high low in mcx
   */
  '52l': string;
  /**
   * Open interest
   */
  oi: string;
  /**
   * Previous day closing Open Interest
   */
  poi: string;
  /**
   * Total open interest for underlying
   */
  toi: string;
};
