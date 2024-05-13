import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getPreFilteredRowModel().rows.length > table.getFilteredRowModel().rows.length;

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.getColumn('symbol')?.setFilterValue(event.target.value);
    table.resetPageIndex();
  };

  return (
    <div className='flex flex-1 items-center gap-2 pb-4'>
      <Input
        placeholder='Search stocks...'
        value={(table.getColumn('symbol')?.getFilterValue() as string) ?? ''}
        onChange={onSearchChange}
        className='max-w-sm'
      />
      {isFiltered && (
        <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
          Reset
          <Cross2Icon className='ml-2 h-4 w-4' />
        </Button>
      )}
    </div>
  );
}
