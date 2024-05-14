import logger from '@server/lib/services/logger.js';
import shoonyaService from '@server/lib/services/shoonyaService.js';
import { Router, type Request, type Response } from 'express';
import { HTTPError } from 'ky';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const userDetails = await shoonyaService.getUserDetails();
    res.status(200).json(userDetails);
  } catch (error) {
    logger.error('Error while fetching user details', error);
    const errorMessage = (error as HTTPError).message;
    res.status(500).json({ message: errorMessage });
  }
});

export default router;
