import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { useToast } from '@client/components/ui/use-toast';
import { api } from '@client/lib/api';
import env from '@shared/config/env.json';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const TOTP_LENGTH = 6;
export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [buttonState, setButtonState] = React.useState<'confirm' | 'confirming'>('confirm');

  const fieldSetRef = React.useRef<HTMLFieldSetElement>(null);
  const digitIds = [...Array(TOTP_LENGTH).keys()];

  const otpInputKeydownhandler = (event: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    const inputContainer = fieldSetRef.current;
    if (!inputContainer) return;

    const inputs = inputContainer.querySelectorAll('input');

    if (event.key === 'Backspace') {
      inputs[i].value = '';
      if (i !== 0) inputs[i - 1].focus();
    } else if (/^[0-9]$/i.test(event.key)) {
      event.preventDefault();
      inputs[i].value = event.key;
      if (i !== inputs.length - 1) inputs[i + 1].focus();
    }
  };

  const confirmTotp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let finalOtp = '';
    for (const value of formData.values()) {
      finalOtp = finalOtp + value;
    }
    setButtonState('confirming');
    try {
      await api
        .post('login', {
          searchParams: { totp: finalOtp },
        })
        .json();
      navigate('/');
    } catch (err) {
      console.error('Error while logging in', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error while logging in. Please try again.',
      });
    } finally {
      setButtonState('confirm');
    }
  };

  return (
    <main className='relative w-full h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center sm:w-[350px]'>
          <h1 className='text-center text-2xl font-semibold tracking-tight'>Your session has expired.</h1>
          <form onSubmit={confirmTotp} method='post' className='flex flex-col items-center gap-2 py-2'>
            <fieldset className='mb-4 flex w-fit flex-row gap-3' ref={fieldSetRef}>
              <legend className='mb-6 text-center text-sm text-muted-foreground'>
                Please enter your TOTP to login again.
              </legend>
              {digitIds.map((i) => (
                <Input
                  required
                  key={i.toString()}
                  className='hide-arrows h-12 text-center'
                  type='number'
                  name={`otp-input-${i}`}
                  id={`otp-input-${i}`}
                  onKeyDown={(event) => otpInputKeydownhandler(event, i)}
                />
              ))}
            </fieldset>

            <Button type='submit' size='lg' className='w-full' disabled={buttonState === 'confirming'}>
              {buttonState === 'confirm' ? (
                `Login as ${env.USER_ID}`
              ) : (
                <>
                  <svg
                    className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Logging in as {env.USER_ID}...
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div
          className='absolute inset-0 bg-cover'
          style={{
            backgroundImage: 'url("landing.webp")',
          }}
        />
      </div>
    </main>
  );
}
