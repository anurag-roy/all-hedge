import * as React from 'react';

import { Badge } from '@client/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import { getBaseWsUrl } from '@client/lib/utils';
import { SocketData, SocketDataType } from '@shared/types/socket';
import { Mover } from '@shared/types/state';

const MOVERS_COUNT = 5;
const indices = Array.from({ length: MOVERS_COUNT }, (_, i) => i);

const calculateChange = (ltp: number, close: number) => {
  return close ? ((ltp - close) / close) * 100 : 0;
};

function ChangeBadge({ change }: { change: number }) {
  return (
    <Badge variant={change >= 0 ? 'emerald' : 'red'}>
      {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
    </Badge>
  );
}

export function Movers() {
  const [equities, setEquities] = React.useState<Mover[]>([]);

  React.useEffect(() => {
    const ws = new WebSocket(getBaseWsUrl());

    ws.onmessage = (event: MessageEvent) => {
      const message: SocketData = JSON.parse(event.data);
      if (message.type === SocketDataType.EQ_INIT) {
        const initData = message.data.map((equity) => ({
          ...equity,
          change: calculateChange(equity.ltp, equity.close),
        }));
        initData.sort((a, b) => b.change - a.change);
        setEquities(initData);
      } else if (message.type === SocketDataType.EQ_UPDATE) {
        setEquities((prevEquities) => {
          const updatedEquities = prevEquities.map((equity) => {
            if (equity.token === message.data.token) {
              return {
                ...equity,
                ltp: message.data.ltp,
                change: calculateChange(message.data.ltp, equity.close),
              };
            }
            return equity;
          });
          updatedEquities.sort((a, b) => b.change - a.change);
          return updatedEquities;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <section>
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='ml-1 text-xl font-semibold'>Top movers</h2>
      </div>
      <div className='w-full overflow-y-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[35%]'>Gainer</TableHead>
              <TableHead className='w-[15%] text-right'>LTP</TableHead>
              <TableHead className='w-[35%]'>Loser</TableHead>
              <TableHead className='w-[15%] text-right'>LTP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indices.map((i) => {
              const gainer = equities[i];
              const loser = equities[equities.length - i - 1];

              return (
                <TableRow key={i}>
                  <TableCell>
                    {gainer ? (
                      <div className='flex items-center justify-between font-medium'>
                        {gainer.symbol} <ChangeBadge change={gainer.change} />
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className='text-right font-medium text-emerald-800 dark:text-emerald-400'>
                    {gainer?.ltp.toFixed(2) || '-'}
                  </TableCell>
                  <TableCell>
                    {loser ? (
                      <div className='flex items-center justify-between font-medium'>
                        {loser.symbol} <ChangeBadge change={loser.change} />
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className='text-right font-medium text-red-800 dark:text-red-400'>
                    {loser?.ltp.toFixed(2) || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
