import { Header } from '@client/components/header';
import { Logs } from '@client/components/logs';
import { StockStates } from '@client/components/stock-states';
import { SubscriptionForm } from '@client/components/subscription-form';
import type { StockState } from '@shared/types/state';
import * as React from 'react';

export default function Root() {
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [logs, setLogs] = React.useState<{ id: number; timeStamp: number; message: string }[]>([]);
  const [stockStates, setStockStates] = React.useState<StockState[]>([]);

  if (ws && !ws.onmessage) {
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'log') {
        setLogs((prevLogs) => [...prevLogs, message.data].sort((a, b) => b.id - a.id));
      } else if (message.type === 'stockStateInit') {
        setStockStates(message.data);
      } else if (message.type === 'stockStateUpdate') {
        setStockStates((prevStockStates) => {
          const updatedStockStates = [...prevStockStates];
          const index = updatedStockStates.findIndex((stockState) => stockState.symbol === message.data.symbol);
          if (index !== -1) {
            updatedStockStates[index] = message.data;
          } else {
            updatedStockStates.push(message.data);
          }
          return updatedStockStates;
        });
      }
    };
  }
  return (
    <>
      <Header />
      <main className='container'>
        <section>
          <SubscriptionForm setWs={setWs} />
          <Logs logs={logs} />
          <StockStates stockStates={stockStates} />
        </section>
      </main>
    </>
  );
}
