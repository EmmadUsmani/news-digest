import {
  contentGroupSchema,
  digestPreviewSchema,
  editionCostSchema,
  healthSchema,
  identitySchema,
  monitoringAlertsSchema,
  operationsStatusSchema,
  previewHistorySchema,
  profileSettingsSchema,
  readerEditionHistorySchema,
  readerEditionSchema,
  scheduleSchema,
  topicSettingsSchema,
} from '@digest/contracts';
import { queryOptions } from '@tanstack/react-query';
import { type z, ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    url: string,
  ) {
    super(`Could not load ${url}`);
  }
}

async function read<T>(url: string, schema: z.ZodType<T>, signal: AbortSignal) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  });
  if (!response.ok) throw new HttpError(response.status, url);
  return schema.parse(await response.json());
}

export const identityQuery = queryOptions({
  queryKey: ['identity'],
  staleTime: 0,
  retry: false,
  queryFn: ({ signal }) => read('/api/me', identitySchema, signal),
});

export const topicsQuery = queryOptions({
  queryKey: ['topics'],
  queryFn: ({ signal }) =>
    read('/api/admin/topics', topicSettingsSchema.array(), signal),
});
export const profileQuery = queryOptions({
  queryKey: ['profile'],
  queryFn: ({ signal }) =>
    read('/api/admin/profile', profileSettingsSchema, signal),
});
// Private rollback has no system endpoint; only its explicit 404 permits the
// legacy read. Public-mode failures must never fall back to owner data.
export const scheduleQuery = queryOptions({
  queryKey: ['system-schedule'],
  queryFn: async ({ signal }) => {
    try {
      return await read('/api/settings/schedule', scheduleSchema, signal);
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 404) throw error;
      return (await read('/api/admin/profile', profileSettingsSchema, signal))
        .schedule;
    }
  },
});
export const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: ({ signal }) => read('/healthz', healthSchema, signal),
});

export const statusQuery = queryOptions({
  queryKey: ['status'],
  queryFn: ({ signal }) =>
    read('/api/admin/status', operationsStatusSchema, signal),
  refetchInterval: 60_000,
});

// Timeouts and invalid response data need manual recovery; repeating them
// delays the reader without helping. Transient HTTP failures retain retries.
function retryEditionRead(failureCount: number, error: Error) {
  return (
    error.name !== 'TimeoutError' &&
    !(error instanceof ZodError) &&
    !(error instanceof SyntaxError) &&
    !(error instanceof HttpError && error.status === 404) &&
    failureCount < 3
  );
}

export const editionQuery = (id?: string) =>
  queryOptions({
    queryKey: ['editions', 'detail', id ?? 'latest'],
    retry: retryEditionRead,
    queryFn: ({ signal }) =>
      read(
        `/api/editions/${id ? encodeURIComponent(id) : 'latest'}`,
        readerEditionSchema.nullable(),
        signal,
      ),
  });

export const editionHistoryQuery = (offset = 0) =>
  queryOptions({
    queryKey: ['editions', 'history', offset],
    retry: retryEditionRead,
    queryFn: ({ signal }) =>
      read(
        `/api/editions?offset=${offset}`,
        readerEditionHistorySchema,
        signal,
      ),
  });

export const adminEditionQuery = queryOptions({
  queryKey: ['admin', 'editions', 'latest'],
  queryFn: ({ signal }) =>
    read(
      '/api/admin/digest-previews/latest',
      digestPreviewSchema.nullable(),
      signal,
    ),
});

export const adminHistoryQuery = (offset = 0) =>
  queryOptions({
    queryKey: ['admin', 'editions', 'history', offset],
    queryFn: ({ signal }) =>
      read(
        `/api/admin/digest-previews?offset=${offset}`,
        previewHistorySchema,
        signal,
      ),
  });
export const adminEditionDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['admin', 'editions', 'detail', id],
    retry: retryEditionRead,
    queryFn: ({ signal }) =>
      read(
        `/api/admin/digest-previews/${encodeURIComponent(id)}`,
        digestPreviewSchema,
        signal,
      ),
  });

export const incomingWindowQuery = (
  topicId: string,
  start: string,
  end: string,
) =>
  queryOptions({
    queryKey: ['admin', 'incoming-window', topicId, start, end],
    enabled: Boolean(topicId && start && end),
    queryFn: ({ signal }) =>
      read(
        `/api/admin/content/window?${new URLSearchParams({ topicId, start, end })}`,
        contentGroupSchema.array(),
        signal,
      ),
  });

export const adminEditionCostQuery = (id: string) =>
  queryOptions({
    queryKey: ['admin', 'editions', 'cost', id],
    queryFn: ({ signal }) =>
      read(
        `/api/admin/digest-previews/${encodeURIComponent(id)}/cost`,
        editionCostSchema,
        signal,
      ),
  });

export const alertsQuery = queryOptions({
  queryKey: ['monitoring-alerts'],
  queryFn: ({ signal }) =>
    read('/api/admin/status/alerts', monitoringAlertsSchema, signal),
  refetchInterval: 60_000,
  retry: false,
});
