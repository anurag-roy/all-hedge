import { AccessorFnColumnDef, createColumnHelper } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@client/components/stock-states/column-header';
import { StockState } from '@shared/types/state';

const columnHelper = createColumnHelper<StockState>();

export const columns: AccessorFnColumnDef<StockState, any>[] = [
  columnHelper.accessor((row) => row.symbol, { id: 'symbol', header: 'Symbol' }),
  columnHelper.accessor((row) => row.future.sp, { header: 'Fut SP' }),
  columnHelper.accessor((row) => row.ce.bp, { header: 'CE BP' }),
  columnHelper.accessor((row) => row.pe.sp, { header: 'PE SP' }),
  columnHelper.accessor((row) => row.hedgePrice1, {
    id: 'hedgePrice1',
    header: (props) => <DataTableColumnHeader table={props.table} column={props.column} title='Hedge Price 1' />,
    cell: (props) => <div className='pr-2'>{props.getValue()}</div>,
  }),
  columnHelper.accessor((row) => row.strike, { header: 'Strike' }),
  columnHelper.accessor((row) => row.future.bp, { header: 'Fut BP' }),
  columnHelper.accessor((row) => row.ce.sp, { header: 'CE SP' }),
  columnHelper.accessor((row) => row.pe.bp, { header: 'PE BP' }),
  columnHelper.accessor((row) => row.hedgePrice2, {
    id: 'hedgePrice2',
    header: (props) => <DataTableColumnHeader table={props.table} column={props.column} title='Hedge Price 2' />,
    cell: (props) => <div className='pr-2'>{props.getValue()}</div>,
  }),
];
