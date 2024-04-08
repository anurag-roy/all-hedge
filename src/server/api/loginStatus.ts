import type { Request, Response } from 'express';

export default function (_req: Request, res: Response) {
  if (process.env.token) {
    res.status(200).json({ message: 'Logged in' });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
}
