import logger from '@server/services/logger.js';
import shoonyaService from '@server/services/shoonyaService.js';
import { Router } from 'express';
import { HTTPError } from 'ky';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const limits = await shoonyaService.getLimits();
    res.status(200).json(limits);
  } catch (error) {
    logger.error('Error while fetching limits', error);
    const errorMessage = (error as HTTPError).message;
    res.status(500).json({ message: errorMessage });
  }
});

export default router;
