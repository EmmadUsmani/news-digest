import {
  contentGroupSchema,
  digestPreviewSchema,
  healthSchema,
  identitySchema,
  operationsStatusSchema,
  previewHistorySchema,
  profileSettingsSchema,
  readerEditionHistorySchema,
  readerEditionSchema,
  topicSchema,
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

export const contentQuery = queryOptions({
  queryKey: ['content'],
  queryFn: ({ signal }) =>
    read('/api/admin/content', contentGroupSchema.array(), signal),
});
export const topicsQuery = queryOptions({
  queryKey: ['topics'],
  queryFn: ({ signal }) =>
    read('/api/admin/topics', topicSchema.array(), signal),
});
export const profileQuery = queryOptions({
  queryKey: ['profile'],
  queryFn: ({ signal }) =>
    read('/api/admin/profile', profileSettingsSchema, signal),
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
