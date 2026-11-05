import {
  contentGroupSchema,
  healthSchema,
  operationsStatusSchema,
  profileSettingsSchema,
  topicSchema,
} from '@digest/contracts';
import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';

async function read<T>(url: string, schema: z.ZodType<T>, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return schema.parse(await response.json());
}

export const contentQuery = queryOptions({
  queryKey: ['content'],
  queryFn: ({ signal }) =>
    read('/api/content', contentGroupSchema.array(), signal),
});
export const topicsQuery = queryOptions({
  queryKey: ['topics'],
  queryFn: ({ signal }) => read('/api/topics', topicSchema.array(), signal),
});
export const profileQuery = queryOptions({
  queryKey: ['profile'],
  queryFn: ({ signal }) => read('/api/profile', profileSettingsSchema, signal),
});
export const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: ({ signal }) => read('/healthz', healthSchema, signal),
});

export const statusQuery = queryOptions({
  queryKey: ['status'],
  queryFn: ({ signal }) => read('/api/status', operationsStatusSchema, signal),
  refetchInterval: 60_000,
});
