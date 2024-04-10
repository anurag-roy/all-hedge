import { Header } from '@client/components/header';
import { Logs } from '@client/components/logs';
import { SubscriptionForm } from '@client/components/subscription-form';
import { api } from '@client/lib/api';
import * as React from 'react';
import { redirect } from 'react-router-dom';

export async function loader() {
  try {
    await api('loginStatus').json();
  } catch (error) {
    return redirect('/login');
  }
  return null;
}

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
