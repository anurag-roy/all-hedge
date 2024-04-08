import { getHash } from '@server/lib/utils.js';
import env from '@shared/config/env.json';
import type { Request, Response } from 'express';
import { setTimeout } from 'timers/promises';

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

  await setTimeout(2000);

  res.json({ message: 'Login successful!' });
  // try {
  //   const loginResponse = await ky
  //     .post('https://api.shoonya.com/NorenWClientTP/QuickAuth', {
  //       body: 'jData=' + JSON.stringify(data),
  //     })
  //     .json<any>();

  //   if (loginResponse.stat === 'Not_Ok') {
  //     throw new Error(loginResponse.emsg);
  //   }

  //   writeFileSync('.data/token.txt', loginResponse.susertoken, 'utf-8');
  //   await injectTokenIntoEnv(loginResponse.susertoken);

  //   res.json({ message: 'Login successful!' });
  // } catch (error) {
  //   res.status(500).json({ message: 'Error while logging in', error });
  // }
}
