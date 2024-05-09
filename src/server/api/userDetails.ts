import shoonyaService from '@server/services/shoonyaService.js';
import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const userDetails = await shoonyaService.getUserDetails();
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching user details', error });
  }
});

export default router;
