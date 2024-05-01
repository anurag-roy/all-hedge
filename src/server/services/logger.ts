import pc from 'picocolors';

export default {
  info: (...message: any[]) => {
    const timestamp = new Date().toLocaleString('en-US').split(',')[1].trim();
    console.log(`${pc.dim(timestamp)} ${pc.bold(pc.magenta('[all-hedge-server]'))}`, ...message);
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toLocaleString('en-US').split(',')[1].trim();
    console.error(`${pc.dim(timestamp)} ${pc.bold(pc.magenta('[all-hedge-server]'))} ${pc.red(message)}`, error || '');
  },
};
