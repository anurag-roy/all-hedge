import { Button } from '@client/components/ui/button';
import { Form } from '@client/components/ui/form';
import { NumberInputFormField } from '@client/components/ui/number-input-form-field';
import { SelectFormField } from '@client/components/ui/select-form-field';
import { useToast } from '@client/components/ui/use-toast';
import { api } from '@client/lib/api';
import { getExpiryOptions } from '@client/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateIcon } from '@radix-ui/react-icons';
import { AppStateProps } from '@shared/types/state';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type ButtonState = 'subscribe' | 'subscribing' | 'subscribed';

const expiryOptions = getExpiryOptions(3);
const formSchema = z.object({
  accountMargin: z.number(),
  hedgePrice: z.number(),
  expiry: z.string(),
  lotSize: z.number(),
  exitValueDifference: z.number(),
});

export function SubscriptionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      accountMargin: 100000,
      hedgePrice: 1000,
      expiry: expiryOptions[0],
      lotSize: 1,
      exitValueDifference: 200,
    },
  });
  form;
  const [buttonState, setButtonState] = React.useState<ButtonState>('subscribe');
  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setButtonState('subscribing');

    try {
      const startBody: AppStateProps = {
        expiry: values.expiry,
        accountMargin: values.accountMargin,
        entryValueDifference: values.hedgePrice,
        exitValueDifference: values.exitValueDifference,
      };
      await api.post('start', { json: startBody });
      setButtonState('subscribed');
      toast({
        title: 'All set!',
        description: 'Subscription request received. You will be notified on completion.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start subscription. Please retry again.',
        variant: 'destructive',
      });
      setButtonState('subscribe');
      return;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-12 p-4'>
        <NumberInputFormField form={form} name='accountMargin' min={0} step={10000} />
        <NumberInputFormField form={form} name='hedgePrice' min={0} step={100} />
        <SelectFormField form={form} name='expiry' options={expiryOptions} />
        {/* <NumberInputFormField form={form} name='lotSize' min={0} step={1} /> */}
        <NumberInputFormField form={form} name='exitValueDifference' min={0} step={100} />
        <Button type='submit' className='mt-[30px] ml-auto' disabled={buttonState !== 'subscribe'}>
          {buttonState === 'subscribe' ? 'Subscribe' : null}
          {buttonState === 'subscribing' ? (
            <>
              <UpdateIcon className='mr-2 h-4 w-4 animate-spin' />
              Subscribing...
            </>
          ) : null}
          {buttonState === 'subscribed' ? 'Subscribed!' : null}
        </Button>
      </form>
    </Form>
  );
}
