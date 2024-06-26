import { createHash } from 'node:crypto';
import { setInterval } from 'node:timers/promises';

export const getKeys = <T extends Object>(object: T) => Object.keys(object) as Array<keyof T>;

export const getHash = (input: string) => createHash('sha256').update(input).digest('hex');

function* chunkedArgs<A>(args: A[], size: number) {
  for (let i = 0; i < args.length; i += size) {
    yield args.slice(i, i + size);
  }
}

export const throttle = async <T extends (...args: any[]) => Promise<U>, U = Awaited<ReturnType<T>>>(
  func: T,
  args: Array<Parameters<T>>,
  reqPerSecond = 20,
  reqPerMinute = 200
) => {
  const chunkSize = args.length <= reqPerMinute ? reqPerSecond : Math.floor(reqPerMinute / 60);

  const promises = [];
  for await (const argsGen of setInterval(1000, chunkedArgs(args, chunkSize))) {
    const currentArgs = argsGen.next().value;
    if (!currentArgs) {
      break;
    }
    promises.push(...currentArgs.map((arg) => func(...arg)));
  }
  return Promise.allSettled(promises);
};
