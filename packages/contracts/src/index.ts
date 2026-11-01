import { z } from 'zod';
export const healthSchema = z.object({ status: z.enum(['ok', 'degraded']), database: z.boolean(), redis: z.boolean() });
export type Health = z.infer<typeof healthSchema>;
