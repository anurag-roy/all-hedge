import shoonyaService from '@server/services/shoonyaService.js';
import type { Request, Response } from 'express';

export default async function (_req: Request, res: Response) {
  try {
    const userDetails = await shoonyaService.getUserDetails();
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching user details', error });
  }
}
