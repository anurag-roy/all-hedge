import { getHash } from '@server/lib/utils.js';
import env from '@shared/config/env.json';
import type { Limits, LoginResponse, Margin, Quote, UserDetails } from '@shared/types/shoonya.js';
import ky from 'ky';
import { readFileSync, writeFileSync } from 'node:fs';
import { TOTP } from 'totp-generator';
import { GlobalRef } from './GlobalRef.js';

class ShoonyaService {
  api = ky.create({
    prefixUrl: 'https://api.shoonya.com/NorenWClientTP',
    hooks: {
      beforeError: [
        async (error) => {
          const { response } = error;
          if (response && response.body) {
            try {
              const json = await response.json();
              if (json.stat === 'Not_Ok') {
                error.name = 'ShoonyaError';
                error.message = json.emsg;
              }
            } catch (err) {
              return error;
            }
          }
          return error;
        },
      ],
    },
  });

  TOKEN_FILE = '.data/token.txt';
  token: string;

  constructor() {
    try {
      this.token = readFileSync(this.TOKEN_FILE, 'utf-8');
    } catch (error) {
      this.token = '';
    }
  }

  async login() {
    const { otp } = TOTP.generate(env.TOTP_CODE);
    const loginResponse = await this.api
      .post('QuickAuth', {
        body:
          'jData=' +
          JSON.stringify({
            apkversion: 'js:1.0.0',
            uid: env.USER_ID,
            pwd: getHash(env.PASSWORD),
            factor2: otp,
            vc: env.VENDOR_CODE,
            appkey: getHash(`${env.USER_ID}|${env.API_KEY}`),
            imei: env.IMEI,
            source: 'API',
          }),
      })
      .json<LoginResponse>();

    writeFileSync(this.TOKEN_FILE, loginResponse.susertoken, 'utf-8');
    this.token = loginResponse.susertoken;
    return this.token;
  }

  async getUserDetails() {
    return this.api
      .post('UserDetails', {
        body: this.getBody({}),
      })
      .json<UserDetails>();
  }

  async getLimits() {
    return this.api
      .post('Limits', {
        body: this.getBody(),
      })
      .json<Limits>();
  }

  async getQuotes(exchange: 'NSE' | 'NFO', instrumentToken: string) {
    return this.api
      .post('GetQuotes', {
        body: this.getBody({
          exch: exchange,
          token: instrumentToken,
        }),
      })
      .json<Quote>();
  }

  async getSellerMargin(tradingSymbol: string, price: number, quantity: number) {
    return this.api
      .post('GetOrderMargin', {
        body: this.getBody({
          exch: 'NFO',
          tsym: encodeURIComponent(tradingSymbol),
          qty: quantity.toString(),
          prc: price.toString(),
          prd: 'M',
          trantype: 'S',
          prctyp: 'LMT',
        }),
      })
      .json<Margin>();
  }

  async placeOrder(transactionType: 'B' | 'S', price: number, quantity: number, tradingSymbol: string) {
    return this.api
      .post('PlaceOrder', {
        body: this.getBody({
          exch: 'NFO',
          tsym: tradingSymbol,
          qty: quantity.toString(),
          prc: price.toString(),
          prd: 'M',
          trantype: transactionType,
          prctyp: 'LMT',
          ret: 'DAY',
        }),
      })
      .json<any>();
  }

  getBody(data: Record<string, string> = {}) {
    return (
      'jData=' +
      JSON.stringify({
        uid: env.USER_ID,
        actid: env.USER_ID,
        ...data,
      }) +
      `&jKey=${this.token}`
    );
  }
}

const shoonyaServicerRef = new GlobalRef<ShoonyaService>('myapp.shoonyaService');
if (!shoonyaServicerRef.value) {
  shoonyaServicerRef.value = new ShoonyaService();
}
export default shoonyaServicerRef.value;
