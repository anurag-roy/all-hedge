import { Button } from '@client/components/ui/button';
import * as React from 'react';

function App() {
  const [count, setCount] = React.useState(0);

  return <Button onClick={() => setCount((count) => count + 1)}>count is {count}</Button>;
}

export default App;
