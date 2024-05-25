import { Link } from 'react-router-dom';

import { ExcludedStocks } from '@client/components/excluded-stocks';
import { Header } from '@client/components/header';
import { Limits } from '@client/components/limits';
import { Movers } from '@client/components/movers';
import { Card, CardContent } from '@client/components/ui/card';
import { Separator } from '@client/components/ui/separator';

function EntryWithExitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='4em' height='4em' viewBox='0 0 24 24' {...props}>
      <path
        fill='currentColor'
        d='M9.052 4.5C9 5.078 9 5.804 9 6.722v10.556c0 .918 0 1.644.052 2.222H8c-2.357 0-3.536 0-4.268-.732C3 18.035 3 16.857 3 14.5v-5c0-2.357 0-3.536.732-4.268C4.464 4.5 5.643 4.5 8 4.5z'
        opacity='.5'
      ></path>
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M9.707 2.409C9 3.036 9 4.183 9 6.476v11.048c0 2.293 0 3.44.707 4.067c.707.627 1.788.439 3.95.062l2.33-.406c2.394-.418 3.591-.627 4.302-1.505c.711-.879.711-2.149.711-4.69V8.948c0-2.54 0-3.81-.71-4.689c-.712-.878-1.91-1.087-4.304-1.504l-2.328-.407c-2.162-.377-3.243-.565-3.95.062m3.043 8.545c0-.434-.336-.785-.75-.785s-.75.351-.75.784v2.094c0 .433.336.784.75.784s.75-.351.75-.784z'
        clipRule='evenodd'
      ></path>
    </svg>
  );
}

function EntryWithoutExitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='4em' height='4em' viewBox='0 0 24 24' {...props}>
      <path
        fill='currentColor'
        d='M15 2h-1c-2.828 0-4.243 0-5.121.879C8 3.757 8 5.172 8 8v8c0 2.828 0 4.243.879 5.121C9.757 22 11.172 22 14 22h1c2.828 0 4.243 0 5.121-.879C21 20.243 21 18.828 21 16V8c0-2.828 0-4.243-.879-5.121C19.243 2 17.828 2 15 2'
        opacity='.6'
      ></path>
      <path
        fill='currentColor'
        d='M8 8c0-1.538 0-2.657.141-3.5H8c-2.357 0-3.536 0-4.268.732C3 5.964 3 7.143 3 9.5v5c0 2.357 0 3.535.732 4.268c.732.732 1.911.732 4.268.732h.141C8 18.657 8 17.538 8 16v-4.75z'
        opacity='.4'
      ></path>
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M14.53 11.47a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72H5a.75.75 0 0 1 0-1.5h7.19l-.72-.72a.75.75 0 1 1 1.06-1.06z'
        clipRule='evenodd'
      ></path>
    </svg>
  );
}

function ExitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='4em' height='4em' viewBox='0 0 24 24' {...props}>
      <path
        fill='currentColor'
        d='M15 2h-1c-2.828 0-4.243 0-5.121.879C8 3.757 8 5.172 8 8v8c0 2.828 0 4.243.879 5.121C9.757 22 11.172 22 14 22h1c2.828 0 4.243 0 5.121-.879C21 20.243 21 18.828 21 16V8c0-2.828 0-4.243-.879-5.121C19.243 2 17.828 2 15 2'
        opacity='.6'
      ></path>
      <path
        fill='currentColor'
        d='M8 8c0-1.538 0-2.657.141-3.5H8c-2.357 0-3.536 0-4.268.732C3 5.964 3 7.143 3 9.5v5c0 2.357 0 3.535.732 4.268c.732.732 1.911.732 4.268.732h.141C8 18.657 8 17.538 8 16v-4.75z'
        opacity='.4'
      ></path>
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M4.47 11.47a.75.75 0 0 0 0 1.06l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H14a.75.75 0 0 0 0-1.5H6.81l.72-.72a.75.75 0 1 0-1.06-1.06z'
        clipRule='evenodd'
      ></path>
    </svg>
  );
}

export default function Root() {
  return (
    <>
      <Header />
      <main className='container grid flex-grow place-content-center place-items-center gap-4 overflow-y-auto'>
        <h2 className='text-3xl font-semibold'>Welcome, back! Which strategy would you like to run today?</h2>
        <div className='grid grid-cols-3 gap-8 p-4'>
          <Link to='/entryWithExit'>
            <Card className='border-emerald-100 bg-emerald-50/80 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100/60 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-800/40'>
              <CardContent className='grid h-72 place-content-center place-items-center gap-2'>
                <EntryWithExitIcon />
                <h2 className='mt-4 text-xl font-semibold'>Entry with exit</h2>
                <p className='px-4 text-center text-sm font-semibold text-foreground/80'>
                  The program will look for entries as well as exits for the successfully entered stocks.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to='/entryWithoutExit'>
            <Card className='border-yellow-100 bg-yellow-50/80 text-yellow-800 hover:border-yellow-200 hover:bg-yellow-100/60 dark:border-yellow-800/40 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:border-yellow-700/60 dark:hover:bg-yellow-800/40'>
              <CardContent className='grid h-72 place-content-center place-items-center gap-2'>
                <EntryWithoutExitIcon />
                <h2 className='mt-4 text-xl font-semibold'>Entry without exit</h2>
                <p className='px-4 text-center text-sm font-semibold text-foreground/80'>
                  The program will only look for entries and place no exit orders.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to='/exit'>
            <Card className='border-red-100 bg-red-50/80 text-red-800 hover:border-red-200 hover:bg-red-100/60 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:border-red-700/60 dark:hover:bg-red-800/40'>
              <CardContent className='grid h-72 place-content-center place-items-center gap-2'>
                <ExitIcon />
                <h2 className='mt-4 text-xl font-semibold'>Exit</h2>
                <p className='px-4 text-center text-sm font-semibold text-foreground/80'>
                  The program will only look for exits against already entered stocks.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <Separator />
        <div className='grid w-full grid-cols-[3fr,_5fr,_2fr] gap-8 p-4'>
          <ExcludedStocks />
          <Movers />
          <Limits />
        </div>
      </main>
    </>
  );
}
