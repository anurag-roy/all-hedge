import { Card, CardContent, CardHeader, CardTitle } from '@client/components/ui/card';
import { ScrollArea } from '@client/components/ui/scroll-area';
import { Separator } from '@client/components/ui/separator';
import * as React from 'react';

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
        <ScrollArea className='w-full h-96 rounded-md border'>
          {logs.length === 0 ? (
            <div className='h-96 grid place-items-center text-zinc-500'>No logs available</div>
          ) : (
            logs.map((log, idx) => (
              <React.Fragment key={log.id}>
                <div className='flex gap-2 px-2 py-1.5'>
                  <span className='text-bold text-zinc-500 tabular-nums'>
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
