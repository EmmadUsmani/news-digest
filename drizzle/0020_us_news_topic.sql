-- Data-only setup: retain World identity and reader visibility preferences.
UPDATE topics SET description='Global news and international affairs, including US foreign policy.',
 include_guidance='Consequential international developments: wars, diplomacy, cross-border trade and US foreign policy.',
 exclude_guidance='Principally domestic US politics, policy, courts, elections and events.',
 relevance_policy=jsonb_set(relevance_policy,'{includeAny}','[]'::jsonb)
WHERE id='00000000-0000-4000-8000-000000000014';

INSERT INTO topics(id,profile_id,name,description,include_guidance,exclude_guidance,position,story_budget,post_budget,queries,accounts,bluesky_query,relevance_policy)
SELECT '00000000-0000-4000-8000-000000000015',profile_id,'U.S. news & politics',
 'News that mainly plays out inside the United States.',
 'US domestic government, Congress, courts, elections, federal and state policy, and major domestic events.',
 'Principally international affairs, including US foreign policy, wars, diplomacy and international trade.',
 position+1,5,5,'["US Congress courts elections domestic policy"]'::jsonb,
 '["AP","Reuters","NPR","PBS","AP_Politics","JakeSherman","PunchbowlNews","AndrewDesiderio","SCOTUSblog"]'::jsonb,
 'US Congress courts elections',relevance_policy
FROM topics WHERE id='00000000-0000-4000-8000-000000000014';

INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
 ('npr-politics',NULL,'NPR Politics','feed','https://feeds.npr.org/1014/rss.xml'),
 ('pbs-politics',NULL,'PBS NewsHour Politics','feed','https://www.pbs.org/newshour/feeds/rss/politics');
DELETE FROM topic_source_connections WHERE topic_id='00000000-0000-4000-8000-000000000014' AND source_id='guardian-us';
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT t.id,s.id FROM topics t CROSS JOIN content_sources s
WHERE t.id='00000000-0000-4000-8000-000000000015' AND s.id IN ('guardian-us','npr-politics','pbs-politics');
INSERT INTO x_search_topic_settings(topic_id,reaction_min_faves,trending_min_faves,exclusions)
SELECT id,200,2000,ARRAY[]::text[] FROM topics WHERE id='00000000-0000-4000-8000-000000000015';
