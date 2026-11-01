import { z } from 'zod';
export const healthSchema = z.object({ status: z.enum(['ok', 'degraded']), database: z.boolean(), redis: z.boolean() });
export type Health = z.infer<typeof healthSchema>;

export const scheduleSchema = z.object({ cadence: z.string(), timezone: z.string(), coverageWindow: z.string(), storyBudget: z.number().int().min(0).max(20), postBudget: z.number().int().min(0).max(20) });
export const profileSettingsSchema = z.object({ id: z.string().uuid(), name: z.string(), schedule: scheduleSchema });
export type ProfileSettings = z.infer<typeof profileSettingsSchema>;
export const relevancePolicySchema = z.object({ includeAny: z.array(z.string().trim().min(1).max(80)).max(100), excludeAny: z.array(z.string().trim().min(1).max(80)).max(100) }).strict();
export type RelevancePolicy = z.infer<typeof relevancePolicySchema>;
export const topicSchema = z.object({
 id: z.string().uuid(), profileId: z.string().uuid(), name: z.string(), description: z.string(),
 includeGuidance: z.string(), excludeGuidance: z.string(), enabled: z.boolean(), position: z.number().int(),
 storyBudget: z.number().int().min(0).max(20), postBudget: z.number().int().min(0).max(20),
 relevancePolicy: relevancePolicySchema, sources: z.array(z.string()), queries: z.array(z.string()), accounts: z.array(z.string())
});
export type Topic = z.infer<typeof topicSchema>;
export const contentGroupSchema = z.object({ topicId: z.string().uuid(), items: z.array(z.object({ id: z.string().uuid(), title: z.string(), url: z.string().url(), publishedAt: z.string(), source: z.string() })) });
export type ContentGroup = z.infer<typeof contentGroupSchema>;

export const rankedStorySchema = z.object({
 id: z.string().uuid(), title: z.string(), url: z.string().url(), excerpt: z.string(),
 publishedAt: z.string(), sources: z.array(z.string()), coverage: z.array(z.object({ id: z.string().uuid(), title: z.string(), url: z.string().url(), sources: z.array(z.string()), publishedAt: z.string() })).optional(), score: z.number(), reasons: z.array(z.string())
});
export const digestPreviewSchema = z.object({
 id: z.string().uuid(), createdAt: z.string(), windowStart: z.string(), windowEnd: z.string(),
 method: z.enum(['signals-v1', 'signals-v2', 'signals-v3', 'signals-v4']), topics: z.array(z.object({
 id: z.string().uuid(), name: z.string(), candidateCount: z.number().int(), relevanceRejectedCount: z.number().int().optional(), relevancePolicy: relevancePolicySchema.optional(), qualityRejections: z.array(z.object({ id: z.string().uuid(), title: z.string(), rule: z.string(), reason: z.string() })).optional(), stories: z.array(rankedStorySchema)
 }))
});
export type DigestPreview = z.infer<typeof digestPreviewSchema>;

export const previewRequestSchema = z.object({ windowStart: z.string().datetime({ offset: true }), windowEnd: z.string().datetime({ offset: true }) }).strict();
