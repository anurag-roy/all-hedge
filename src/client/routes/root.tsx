import { Header } from '@client/components/header';
import { Logs } from '@client/components/logs';
import { SubscriptionForm } from '@client/components/subscription-form';
import * as React from 'react';

export default function Root() {
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [logs, setLogs] = React.useState<{ id: number; timeStamp: number; message: string }[]>([]);
  if (ws && !ws.onmessage) {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs((prevLogs) => [...prevLogs, data.data].sort((a, b) => b.id - a.id));
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
        </section>
      </main>
    </>
  );
}
