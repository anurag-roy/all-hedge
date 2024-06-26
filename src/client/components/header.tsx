import { ModeToggle } from '@client/components/mode-toggle';
import { UserNav } from '@client/components/user-nav';

function NseLogo() {
  return (
    <svg width='36' height='36' viewBox='0 0 204 204' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M102.1 146.6L57.3 101.9L102.1 57.2L146.9 101.9L102.1 146.6Z' fill='#FEFEFE' />
      <path d='M174.4 29.8L102.4 0.600006L30.1 30.1L102.1 57.2L174.4 29.8Z' fill='#E65C1B' />
      <path d='M146.9 101.9L174.4 29.8L102.1 57.2L146.9 101.9Z' fill='#362D7E' />
      <path d='M102.1 146.6L174.4 173.7L146.9 101.9L102.1 146.6Z' fill='#ECAE0E' />
      <path d='M102.1 57.2L30.1 30.1L57.3 101.9L102.1 57.2Z' fill='#ECAE0E' />
      <path d='M30.1 30.1C29.7 29.7 0.5 101.9 0.5 101.9L30.1 173.7L57.3 101.9L30.1 30.1Z' fill='#E31D25' />
      <path d='M57.3 101.9L30.1 173.7L102.1 146.6L57.3 101.9Z' fill='#ECAE0E' />
      <path d='M30.1 173.7L102.1 203.2L174.4 173.7L102.1 146.6L30.1 173.7Z' fill='#E31D25' />
      <path d='M174.4 29.8L146.9 101.9L174.4 173.7L204 101.9L174.4 29.8Z' fill='#E65C1B' />
    </svg>
  );
}

export function Header() {
  return (
    <header className='border-b'>
      <div className='container flex items-center gap-4 py-4'>
        <hgroup className='mr-auto flex items-center gap-2'>
          <NseLogo />
          <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>All Hedge Strategy</h1>
        </hgroup>
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  );
}
