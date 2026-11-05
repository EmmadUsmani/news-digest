import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Link,
  notFound,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { z } from 'zod';

import { AdminEditionInspector, AdminEditions } from './AdminEditions';
import { AdminLayout, AdminTools } from './AdminLayout';
import { AdminNewEdition } from './AdminNewEdition';
import { AdminSchedule } from './AdminSchedule';
import { AdminSources } from './AdminSources';
import { AdminSpend } from './AdminSpend';
import { AdminTopicEditor } from './AdminTopicEditor';
import { AdminTopics } from './AdminTopics';
import { App } from './App';
import {
  adminEditionQuery,
  editionHistoryQuery,
  editionQuery,
  healthQuery,
  identityQuery,
  statusQuery,
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
    context.queryClient.ensureQueryData(adminEditionQuery),
    context.queryClient.ensureQueryData(healthQuery),
    context.queryClient.ensureQueryData(statusQuery),
  ]);
}
const latestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: z.object({
    edition: z.preprocess(
      (value) => (value === undefined ? undefined : String(value)),
      z.string().optional(),
    ),
  }),
  beforeLoad: ({ search, location }) => {
    if (
      search.edition !== undefined &&
      !z.string().uuid().safeParse(search.edition).success
    )
      throw notFound();
    if (search.edition)
      throw redirect({
        to: '/editions/$id',
        params: { id: search.edition },
        hash: location.hash,
        replace: true,
      });
  },
  loader: ({ context }) => {
    void Promise.allSettled([
      context.queryClient.ensureQueryData(editionQuery()),
      context.queryClient.ensureQueryData(editionHistoryQuery()),
    ]);
  },
  component: App,
});
const editionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editions/$id',
  beforeLoad: ({ params }) => {
    if (!z.string().uuid().safeParse(params.id).success) throw notFound();
  },
  loader: ({ context, params }) => {
    void Promise.allSettled([
      context.queryClient.ensureQueryData(editionQuery(params.id)),
      context.queryClient.ensureQueryData(editionHistoryQuery()),
    ]);
  },
  component: App,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: async ({ context }) => {
    const identity = await context.queryClient.fetchQuery(identityQuery);
    if (!identity.isAdmin) throw notFound();
  },
  component: AdminLayout,
});

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  loader: ({ context }) => loadPageData({ context }),
  component: () => <App admin />,
});
const adminToolsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/tools',
  component: AdminTools,
});

const adminSourcesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/sources',
  component: AdminSources,
});

const adminTopicsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/topics',
  component: AdminTopics,
});

const adminTopicEditorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/topics/$id',
  beforeLoad: ({ params }) => {
    if (!z.string().uuid().safeParse(params.id).success) throw notFound();
  },
  component: AdminTopicEditor,
});

const adminScheduleRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/schedule',
  component: AdminSchedule,
});

const adminSpendRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/spend',
  component: AdminSpend,
});

const adminEditionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/editions',
  component: AdminEditions,
});
const adminNewEditionRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/editions/new',
  component: AdminNewEdition,
});
const adminInspectorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/editions/$id',
  beforeLoad: ({ params }) => {
    if (!z.string().uuid().safeParse(params.id).success) throw notFound();
  },
  component: AdminEditionInspector,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    latestRoute,
    editionRoute,
    adminRoute.addChildren([
      adminOverviewRoute,
      adminEditionsRoute,
      adminInspectorRoute,
      adminNewEditionRoute,
      adminSourcesRoute,
      adminTopicsRoute,
      adminTopicEditorRoute,
      adminScheduleRoute,
      adminSpendRoute,
      adminToolsRoute,
    ]),
  ]),
  context: { queryClient },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
