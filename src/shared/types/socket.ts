import type { DepthResponse } from './shoonya.js';

export type TickerSubscription = ((tick: DepthResponse) => void) | ((tick: DepthResponse) => Promise<void>);
