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
import { loadOperationsOverview } from './operations-overview-loader';
import { OperationsOverviewPage } from './OperationsOverviewPage';
import { Privacy } from './Privacy';
import { PublicPreviewDetail } from './PublicPreviewDetail';
import { PublicPreviewHistory } from './PublicPreviewHistory';
import { editionHistoryQuery, editionQuery, identityQuery } from './queries';
import { ReaderArchive } from './ReaderArchive';
import { ReaderSaved } from './ReaderSaved';

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
// Built explicitly with the matching server mode at activation/rollback.
const publicMode = import.meta.env.VITE_PUBLIC_MODE === '1';
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
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: Privacy,
});
const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved',
  beforeLoad: () => {
    if (import.meta.env.VITE_READER_PREFERENCES === '0') throw notFound();
  },
  component: ReaderSaved,
});
const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editions',
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).max(500000).catch(1),
  }),
  component: ReaderArchive,
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
  beforeLoad: async ({ context, location }) => {
    // Only reviewed read-only pages allow anonymous reads.
    if (
      publicMode &&
      (/^\/admin\/?$/.test(location.pathname) ||
        location.pathname === '/admin/editions' ||
        location.pathname === '/admin/schedule' ||
        location.pathname === '/admin/sources' ||
        location.pathname === '/admin/topics' ||
        (location.pathname.startsWith('/admin/topics/') &&
          z.string().uuid().safeParse(location.pathname.slice(14)).success) ||
        (location.pathname.startsWith('/admin/editions/') &&
          z.string().uuid().safeParse(location.pathname.slice(16)).success))
    )
      return;
    const identity = await context.queryClient.fetchQuery(identityQuery);
    if (!identity.isAdmin) throw notFound();
  },
  component: AdminLayout,
});

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  loader: ({ context }) => {
    void loadOperationsOverview(context.queryClient, publicMode);
  },
  component: () => <OperationsOverviewPage publicMode={publicMode} />,
});
const adminToolsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/tools',
  component: AdminTools,
});

const adminSourcesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/sources',
  component: () => <AdminSources publicMode={publicMode} />,
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
  component: () => <AdminSchedule publicMode={publicMode} />,
});

const adminSpendRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/spend',
  component: AdminSpend,
});

const adminEditionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/editions',
  component: publicMode ? PublicPreviewHistory : AdminEditions,
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
  component: publicMode ? PublicPreviewDetail : AdminEditionInspector,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    latestRoute,
    archiveRoute,
    savedRoute,
    privacyRoute,
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
