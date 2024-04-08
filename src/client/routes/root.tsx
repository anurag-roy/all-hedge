import { Header } from '@client/components/header';
import { SubscriptionForm } from '@client/components/subscription-form';
import { api } from '@client/lib/api';
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
  return (
    <>
      <Header />
      <main className='container'>
        <section>
          <SubscriptionForm />
        </section>
      </main>
    </>
  );
}
