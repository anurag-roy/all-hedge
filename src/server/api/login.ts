import env from '@shared/config/env.json';
import { getHash } from '@shared/lib/getHash.js';
import { getUserDetails } from '@shared/lib/getUserDetails.js';
import { Request, Response } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import ky from 'ky';

const injectTokenIntoEnv = async (token?: string) => {
  if (token) {
    process.env.token = token;
  } else {
    try {
      const readToken = readFileSync('.data/token.txt', 'utf-8');
      process.env.token = readToken;

      try {
        await getUserDetails();
      } catch (error) {
        console.log('Token expired');
        delete process.env.token;
      }
    } catch (error) {
      console.log('Token file not found. Skipping token setting...');
    }
  }
};

export default async function (req: Request, res: Response) {
  const { totp } = req.query;

  const data = {
    apkversion: 'js:1.0.0',
    uid: env.USER_ID,
    pwd: getHash(env.PASSWORD),
    factor2: totp,
    vc: env.VENDOR_CODE,
    appkey: getHash(`${env.USER_ID}|${env.API_KEY}`),
    imei: env.IMEI,
    source: 'API',
  };

  try {
    const loginResponse = await ky
      .post('https://api.shoonya.com/NorenWClientTP/QuickAuth', {
        body: 'jData=' + JSON.stringify(data),
      })
      .json<any>();

    if (loginResponse.stat === 'Not_Ok') {
      throw new Error(loginResponse.emsg);
    }

    writeFileSync('.data/token.txt', loginResponse.susertoken, 'utf-8');
    injectTokenIntoEnv(loginResponse.susertoken);

    res.json({ message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Error while logging in', error });
  }
}
