import { Badge } from '@client/components/ui/badge';
import { Button } from '@client/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@client/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@client/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import { api } from '@client/lib/api';
import { cn } from '@client/lib/utils';
import { CheckIcon, LockClosedIcon, Pencil1Icon } from '@radix-ui/react-icons';
import config from '@shared/config/config';
import { ExcludedStock, ExclusionReason } from '@shared/types/stock';
import * as _ from 'lodash-es';
import * as React from 'react';

const reasonToVariantMap = {
  [ExclusionReason.NSE_BAN]: 'orange',
  [ExclusionReason.CUSTOM_BAN]: 'blue',
  [ExclusionReason.LTP_BELOW_THRESHOLD]: 'pink',
} as const;

function ExcludedStockRow({ excludedStock }: { excludedStock: ExcludedStock }) {
  return (
    <TableRow>
      <TableCell>{excludedStock.symbol}</TableCell>
      <TableCell>
        <Badge variant={reasonToVariantMap[excludedStock.reason]}>{excludedStock.reason}</Badge>
      </TableCell>
    </TableRow>
  );
}

function ExcludedStocksTable({ excludedStocks }: { excludedStocks: ExcludedStock[] }) {
  return (
    <div className='ml-auto h-56 w-full overflow-y-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {excludedStocks.length === 0 ? (
            <TableRow className='border-0'>
              <TableCell>No excluded stocks</TableCell>
            </TableRow>
          ) : (
            excludedStocks.map((stock) => <ExcludedStockRow key={stock.symbol} excludedStock={stock} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function ExcludedStocks() {
  const [excludedStocks, setExcludedStocks] = React.useState<ExcludedStock[]>([]);
  const excludedStockMap = _.keyBy(excludedStocks, (s) => s.symbol);

  React.useEffect(() => {
    api('excludedStocks').json<ExcludedStock[]>().then(setExcludedStocks);
  }, []);

  const toggleBannedStock = (symbol: string) => {
    const excludedStock = excludedStockMap[symbol];
    if (excludedStock) {
      api
        .delete(`excludedStocks/${encodeURIComponent(symbol)}`)
        .json<ExcludedStock[]>()
        .then(setExcludedStocks);
    } else {
      api
        .post('excludedStocks', { json: { symbol, reason: ExclusionReason.CUSTOM_BAN } })
        .json<ExcludedStock[]>()
        .then(setExcludedStocks);
    }
  };

  return (
    <section className='p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='ml-1 text-xl font-semibold'>Excluded stocks</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button size='sm' variant='ghost' className='h-8'>
              <Pencil1Icon className='mr-1 h-4 w-4' />
              Edit
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[250px] p-0' align='center'>
            <Command>
              <CommandInput placeholder='Search...' />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {config.STOCKS_TO_INCLUDE.map((s) => {
                    const isSelected = s in excludedStockMap;
                    const isDisabled = isSelected ? excludedStockMap[s].reason !== ExclusionReason.CUSTOM_BAN : false;
                    return (
                      <CommandItem key={s} disabled={isDisabled} onSelect={() => toggleBannedStock(s)}>
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className={cn('h-4 w-4')} />
                        </div>
                        {s}
                        {isDisabled ? <LockClosedIcon className='ml-auto h-4 w-4' /> : ''}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <ExcludedStocksTable excludedStocks={excludedStocks} />
    </section>
  );
}
