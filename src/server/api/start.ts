import { AppState } from '@server/state.js';
import { AppStateProps } from '@shared/types/state.js';
import type { Request, Response } from 'express';

export default async function (req: Request, res: Response) {
  const body = req.body as AppStateProps;
  const appState = new AppState(body);
  try {
    await appState.setupState();
    res.status(200).json({ message: 'Started' });
  } catch (error) {
    res.status(500).json({ message: 'Error while starting subscription', error });
  }
}
