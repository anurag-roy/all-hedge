import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import type { StockState } from '@shared/types/state';

type StockStatesProps = {
  stockStates: StockState[];
};

export function StockStates({ stockStates }: StockStatesProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Fut SP</TableHead>
          <TableHead>CE BP</TableHead>
          <TableHead>PE SP</TableHead>
          <TableHead>HP 1</TableHead>
          <TableHead>Strike</TableHead>
          <TableHead>Fut BP</TableHead>
          <TableHead>CE SP</TableHead>
          <TableHead>PE BP</TableHead>
          <TableHead>HP 2</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockStates.map((stockState) => (
          <TableRow key={stockState.symbol}>
            <TableCell>{stockState.symbol}</TableCell>
            <TableCell>{stockState.future.sp}</TableCell>
            <TableCell>{stockState.ce.bp}</TableCell>
            <TableCell>{stockState.pe.sp}</TableCell>
            <TableCell>{stockState.hedgePrice1.toFixed(2)}</TableCell>
            <TableCell>{stockState.strike}</TableCell>
            <TableCell>{stockState.future.bp}</TableCell>
            <TableCell>{stockState.ce.sp}</TableCell>
            <TableCell>{stockState.pe.bp}</TableCell>
            <TableCell>{stockState.hedgePrice2.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
