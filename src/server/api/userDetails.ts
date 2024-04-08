import { getUserDetails } from '@server/lib/getUserDetails.js';
import type { Request, Response } from 'express';

export default async function (_req: Request, res: Response) {
  try {
    const userDetails = await getUserDetails();
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching user details', error });
  }
}
