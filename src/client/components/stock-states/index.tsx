import type { StockState } from '@shared/types/state';
import { columns } from './columns';
import { DataTable } from './data-table';

type StockStatesProps = {
  stockStates: StockState[];
};

export function StockStates({ stockStates }: StockStatesProps) {
  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={stockStates} />
    </div>
  );
}
