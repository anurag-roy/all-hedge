export const enum ExclusionReason {
  NSE_BAN = 'Nse ban',
  CUSTOM_BAN = 'Custom ban',
  LTP_BELOW_THRESHOLD = 'Ltp below threshold',
}

export type ExcludedStock = {
  symbol: string;
  reason: ExclusionReason;
};
