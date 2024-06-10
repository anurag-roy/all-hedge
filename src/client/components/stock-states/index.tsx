import { columns } from '@client/components/stock-states/columns';
import { DataTable } from '@client/components/stock-states/data-table';
import type { StockState } from '@shared/types/state';

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
