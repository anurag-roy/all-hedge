import * as React from 'react';

import { StockStates } from '@client/components/stock-states';
import { SubscriptionForm } from '@client/components/subscription-form';
import { StockState } from '@shared/types/state';

export function Entry() {
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [stockStates, setStockStates] = React.useState<StockState[]>([]);

  if (ws && !ws.onmessage) {
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'stockStateInit') {
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
    <section>
      <SubscriptionForm setWs={setWs} />
      <StockStates stockStates={stockStates} />
    </section>
  );
}
