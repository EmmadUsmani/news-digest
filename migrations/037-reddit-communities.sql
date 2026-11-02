-- Configuration only: public access is blocked; this does not enable fetching.
ALTER TABLE topics ADD COLUMN reddit_communities jsonb NOT NULL DEFAULT '[]'
  CHECK (jsonb_typeof(reddit_communities) = 'array' AND jsonb_array_length(reddit_communities) <= 20);

-- Curated owner choices apply only to the original seed topics.
UPDATE topics SET reddit_communities = '["LocalLLaMA","MachineLearning","singularity","technology","programming","OpenAI","ClaudeAI"]'
WHERE id='00000000-0000-4000-8000-000000000011';
UPDATE topics SET reddit_communities = '["nba"]'
WHERE id='00000000-0000-4000-8000-000000000012';
UPDATE topics SET reddit_communities = '["Games","gaming","pcgaming","GamingLeaks"]'
WHERE id='00000000-0000-4000-8000-000000000013';
UPDATE topics SET reddit_communities = '["worldnews","politics","geopolitics"]'
WHERE id='00000000-0000-4000-8000-000000000014';
