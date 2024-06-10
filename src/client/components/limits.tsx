import { ReloadIcon } from '@radix-ui/react-icons';
import { HTTPError } from 'ky';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@client/components/ui/button';
import { api } from '@client/lib/api';
import { displayInr } from '@client/lib/utils';
import type { Limits } from '@shared/types/shoonya';

export function Limits() {
  const [limits, setLimits] = React.useState<Limits>();

  const refreshLimits = async (showSuccess = true) => {
    try {
      const res = await api('limits').json<Limits>();
      setLimits(res);
      if (showSuccess) {
        toast.success('Margin refreshed');
      }
    } catch (error) {
      const errorMessage = (error as HTTPError).message;
      toast.error('Failed to refresh margin', {
        description: errorMessage,
      });
    }
  };

  React.useEffect(() => {
    refreshLimits(false);
  }, []);

  return (
    <section>
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='ml-1 text-xl font-semibold'>Margin</h2>
        <Button variant='outline' size='icon-sm' onClick={() => refreshLimits()}>
          <ReloadIcon className='h-4 w-4' />
        </Button>
      </div>
      <div className='flex flex-col gap-4 rounded-md border p-4'>
        <div>
          <p className='mb-1 text-xs font-medium text-muted-foreground'>Cash Margin</p>
          <p className='font-medium'>{limits?.cash ? displayInr(limits.cash) : '-'}</p>
        </div>
        <div>
          <p className='mb-1 text-xs font-medium text-muted-foreground'>Collateral </p>
          <p className='font-medium'>{limits?.collateral ? displayInr(limits.collateral) : '-'}</p>
        </div>
      </div>
    </section>
  );
}
