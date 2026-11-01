import { z } from 'zod';
export const healthSchema = z.object({ status: z.enum(['ok', 'degraded']), database: z.boolean(), redis: z.boolean() });
export type Health = z.infer<typeof healthSchema>;

export const scheduleSchema = z.object({ cadence: z.string(), timezone: z.string(), coverageWindow: z.string(), storyBudget: z.number().int().min(0).max(20), postBudget: z.number().int().min(0).max(20) });
export const profileSettingsSchema = z.object({ id: z.string().uuid(), name: z.string(), schedule: scheduleSchema });
export type ProfileSettings = z.infer<typeof profileSettingsSchema>;
export const topicSchema = z.object({
 id: z.string().uuid(), profileId: z.string().uuid(), name: z.string(), description: z.string(),
 includeGuidance: z.string(), excludeGuidance: z.string(), enabled: z.boolean(), position: z.number().int(),
 storyBudget: z.number().int().min(0).max(20), postBudget: z.number().int().min(0).max(20),
 sources: z.array(z.string()), queries: z.array(z.string()), accounts: z.array(z.string())
});
export type Topic = z.infer<typeof topicSchema>;
