import ky from 'ky';

export const getBannedStocks = async () => {
  const csv = await ky(`https://nsearchives.nseindia.com/content/fo/fo_secban.csv`).text();

  let bannedStocks: string[] = [];
  const rows = csv.split('\n');
  // Remove header
  rows.shift();
  bannedStocks = rows.map((row) => row.split(',').pop()!).filter(Boolean);

  return bannedStocks;
};
