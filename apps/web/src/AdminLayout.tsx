import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight, Menu } from 'lucide-react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Sheet, SheetClose } from './components/ui/sheet';

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label="Admin navigation"
      className="grid gap-2 [&_a]:rounded-md [&_a]:px-3 [&_a]:py-2 [&_a]:text-sm [&_a]:font-medium [&_a:hover]:bg-[var(--muted)]"
    >
      {(
        [
          { to: '/admin', label: 'Overview' },
          { to: '/admin/editions', label: 'Editions' },
          { to: '/admin/editions/new', label: 'New edition' },
          { to: '/admin/sources', label: 'Sources' },
          { to: '/admin/topics', label: 'Topics' },
          { to: '/admin/schedule', label: 'Schedule' },
          { to: '/admin/spend', label: 'Spend' },
          { to: '/admin/tools', label: 'Tools' },
        ] as const
      ).map(({ to, label }) => {
        const link = (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-[var(--muted)]',
              'aria-current': 'page',
            }}
          >
            {label}
          </Link>
        );
        return mobile ? (
          <SheetClose key={to} asChild>
            {link}
          </SheetClose>
        ) : (
          link
        );
      })}
      <a href="/" className="mt-6 flex items-center gap-2">
        <ArrowLeft size={16} /> Reader
      </a>
    </nav>
  );
}

export function AdminLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)] p-6 md:block">
        <p className="mt-0 mb-1 text-lg font-semibold">News Digest</p>
        <p className="mb-8 text-xs tracking-widest text-[var(--secondary)]">
          ADMIN
        </p>
        <Navigation />
      </aside>
      <div className="min-w-0">
        <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4 md:px-8">
          <div className="md:hidden">
            <Sheet
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open admin menu"
                >
                  <Menu />
                </Button>
              }
            >
              <Navigation mobile />
            </Sheet>
          </div>
          <h1 className="m-0 flex-1 font-sans text-xl leading-7 font-semibold tracking-tight">
            {pathname === '/admin/editions/new'
              ? 'New edition'
              : pathname.startsWith('/admin/tools')
                ? 'Tools'
                : pathname.startsWith('/admin/sources')
                  ? 'Sources'
                  : pathname.startsWith('/admin/topics')
                    ? 'Topics'
                    : pathname.startsWith('/admin/schedule')
                      ? 'Schedule'
                      : pathname.startsWith('/admin/spend')
                        ? 'Spend'
                        : pathname.startsWith('/admin/editions')
                          ? 'Editions'
                          : 'Overview'}
          </h1>
          <span className="text-xs tracking-wide text-[var(--secondary)]">
            PRODUCTION
          </span>
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const tools = [
  [
    'Grafana',
    '/grafana/',
    'Dashboards for product spend, sources and service health.',
  ],
  ['Logs', '/logs/', 'Search API, worker and supporting service logs.'],
  ['Metrics', '/metrics/', 'Explore counters, timings and resource use.'],
  ['Queues', '/queues/', 'Inspect waiting, active, completed and failed jobs.'],
  ['DB explorer', '/db/', 'Browse tables, relationships and saved data.'],
  ['Handbook', '/docs/', 'Read how the system works and how to operate it.'],
] as const;

export function AdminTools() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map(([name, href, description]) => (
        <Card key={href}>
          <h2 className="mt-0 mb-3 font-sans text-base font-semibold">
            <Button asChild variant="ghost" className="h-auto p-0 text-base">
              <a href={href} target="_blank" rel="noreferrer">
                {name}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </h2>
          <p className="m-0 text-sm leading-6 text-[var(--secondary)]">
            {description}
          </p>
        </Card>
      ))}
    </div>
  );
}
