import './index.css';

import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@client/components/theme-provider';
import { Toaster } from '@client/components/ui/sonner';
import Root from '@client/routes/root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <RouterProvider router={router} />
      <Toaster richColors />
    </ThemeProvider>
  </React.StrictMode>
);
