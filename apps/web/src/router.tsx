import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { z } from 'zod';

import { App } from './App';
import {
  contentQuery,
  healthQuery,
  profileQuery,
  statusQuery,
  topicsQuery,
} from './queries';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Outlet,
  notFoundComponent: () => (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Back to News Digest</Link>
    </main>
  ),
  errorComponent: ({ reset }) => (
    <main>
      <h1>This page could not be loaded.</h1>
      <button onClick={reset}>Try again</button>
    </main>
  ),
});
// Auxiliary data failures remain local to their panels, never hiding the edition.
function loadPageData({ context }: { context: { queryClient: QueryClient } }) {
  void Promise.allSettled([
    context.queryClient.ensureQueryData(contentQuery),
    context.queryClient.ensureQueryData(topicsQuery),
    context.queryClient.ensureQueryData(profileQuery),
    context.queryClient.ensureQueryData(healthQuery),
    context.queryClient.ensureQueryData(statusQuery),
  ]);
}
const latestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: z.object({ edition: z.string().uuid().optional() }),
  beforeLoad: ({ search, location }) => {
    if (search.edition)
      throw redirect({
        to: '/editions/$id',
        params: { id: search.edition },
        hash: location.hash,
        replace: true,
      });
  },
  loader: loadPageData,
  component: App,
});
const editionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editions/$id',
  loader: loadPageData,
  component: App,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([latestRoute, editionRoute]),
  context: { queryClient },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
