import env from '@shared/config/env.json';
import type { ShoonyaError, UserDetails } from '@shared/types/shoonya.js';
import ky from 'ky';

export const getUserDetails = async () => {
  const userDetails = await ky
    .post('https://api.shoonya.com/NorenWClientTP/UserDetails', {
      body:
        'jData=' +
        JSON.stringify({
          uid: env.USER_ID,
        }) +
        `&jKey=${process.env.token}`,
    })
    .json<UserDetails | ShoonyaError>();
  if (userDetails.stat !== 'Ok') {
    throw new Error(userDetails.emsg);
  }

  return userDetails;
};
