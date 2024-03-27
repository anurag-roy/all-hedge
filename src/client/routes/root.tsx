import { Button } from '@client/components/ui/button';
import ky from 'ky';
import * as React from 'react';
import { redirect } from 'react-router-dom';

export async function loader() {
  try {
    await ky.get('api/loginStatus').json();
  } catch (error) {
    return redirect('/login');
  }
}

export default function Root() {
  const [count, setCount] = React.useState(0);

  return <Button onClick={() => setCount((count) => count + 1)}>count is {count}</Button>;
}
