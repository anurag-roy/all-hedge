import stockService from '@server/services/excludedStocksService.js';
import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const excludedStocks = stockService.getExcludedStocks();
    res.status(200).json(excludedStocks);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching excluded stocks', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { symbol, reason } = req.body;
    const updatedExcludedStocks = await stockService.addExcludedStock(symbol, reason);
    res.status(200).json(updatedExcludedStocks);
  } catch (error) {
    res.status(500).json({ message: 'Error while adding excluded stock', error });
  }
});

router.delete('/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const updatedExcludedStocks = await stockService.removeExcludedStock(symbol);
    res.status(200).json(updatedExcludedStocks);
  } catch (error) {
    res.status(500).json({ message: 'Error while removing excluded stock', error });
  }
});

export default router;
