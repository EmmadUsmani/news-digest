import './schema-runtime';
import '@fontsource-variable/inter';
import './style.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { installBrowserErrors } from './browser-errors';
import { queryClient, router } from './router';

installBrowserErrors();
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
