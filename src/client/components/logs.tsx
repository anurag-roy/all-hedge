import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@client/components/ui/card';
import { ScrollArea } from '@client/components/ui/scroll-area';
import { Separator } from '@client/components/ui/separator';

type LogsProps = {
  logs: { id: number; timeStamp: number; message: string }[];
};

export function Logs({ logs }: LogsProps) {
  return (
    <Card className='m-4'>
      <CardHeader>
        <CardTitle>Application Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-96 w-full rounded-md border'>
          {logs.length === 0 ? (
            <div className='grid h-96 place-items-center text-zinc-500'>No logs available</div>
          ) : (
            logs.map((log, idx) => (
              <React.Fragment key={log.id}>
                <div className='flex gap-2 px-2 py-1.5'>
                  <span className='text-bold tabular-nums text-zinc-500'>
                    [{new Date(log.timeStamp).toLocaleTimeString()}]
                  </span>
                  <p>{log.message}</p>
                </div>
                {idx === logs.length - 1 ? <></> : <Separator />}
              </React.Fragment>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
