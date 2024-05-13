import stockService from '@server/services/excludedStocksService.js';
import logger from '@server/services/logger.js';
import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const excludedStocks = stockService.getExcludedStocks();
    res.status(200).json(excludedStocks);
  } catch (error) {
    logger.error('Error while fetching excluded stocks', error);
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: errorMessage });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { symbol, reason } = req.body;
    const updatedExcludedStocks = await stockService.addExcludedStock(symbol, reason);
    res.status(200).json(updatedExcludedStocks);
  } catch (error) {
    logger.error('Error while adding excluded stock', error);
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: errorMessage });
  }
});

router.delete('/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const updatedExcludedStocks = await stockService.removeExcludedStock(symbol);
    res.status(200).json(updatedExcludedStocks);
  } catch (error) {
    logger.error('Error while removing excluded stock', error);
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: errorMessage });
  }
});

export default router;
