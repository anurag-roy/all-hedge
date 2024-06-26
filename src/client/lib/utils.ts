import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getMonthName = (monthIndex: number) => {
  // Adjust from 0 based month to irl month index
  const numericMonth = (monthIndex + 1).toString();
  const monthDate = new Date(numericMonth);
  return Intl.DateTimeFormat('en', { month: 'short' }).format(monthDate).toUpperCase();
};

export const getExpiryOptions = (optionCount: number) => {
  const date = new Date();
  let currentMonthIndex = date.getMonth();
  let currentYear = date.getFullYear();

  const options: string[] = [];

  for (let i = 0; i < optionCount; i++) {
    options.push(`${getMonthName(currentMonthIndex)}-${currentYear}`);

    currentMonthIndex = currentMonthIndex + 1;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear = currentYear + 1;
    }
  }

  return options;
};

export const displayInr = (amount: string | number) => {
  const amt = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (
    '₹ ' +
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amt)
  );
};

export const getRandomIndex = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

export const getTodayAsParam = () => new Date().toISOString().slice(0, 10).split('-').reverse().join('');

export const getBaseWsUrl = () => {
  const { protocol, hostname, port } = window.location;
  return `${protocol === 'https:' ? 'wss:' : 'ws:'}//${hostname}:${port}/api/wss`;
};
