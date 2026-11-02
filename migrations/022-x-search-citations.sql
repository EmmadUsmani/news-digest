-- Curated account seeds are configuration, not verified recommendations or metrics.
-- Preserve any owner-configured list.
UPDATE topics SET accounts='["OpenAI","AnthropicAI","GoogleDeepMind","sama","karpathy","simonw","huggingface","GoogleAI"]'::jsonb
WHERE id='00000000-0000-4000-8000-000000000011' AND accounts='[]'::jsonb;
UPDATE topics SET accounts='["NBA","NBAOfficial","ShamsCharania","ChrisBHaynes","TheSteinLine","TimBontemps","BleacherReport","NBAPR"]'::jsonb
WHERE id='00000000-0000-4000-8000-000000000012' AND accounts='[]'::jsonb;
UPDATE topics SET accounts='["PlayStation","Xbox","NintendoAmerica","Steam","geoffkeighley","Wario64","jasonschreier","IGN","gameawards"]'::jsonb
WHERE id='00000000-0000-4000-8000-000000000013' AND accounts='[]'::jsonb;
UPDATE topics SET accounts='["Reuters","AP","BBCWorld","BBCBreaking","NPR","AFP","UN","UNHumanRights","ZelenskyyUa"]'::jsonb
WHERE id='00000000-0000-4000-8000-000000000014' AND accounts='[]'::jsonb;

CREATE TABLE x_search_citations (
  call_id uuid NOT NULL REFERENCES x_discovery_calls(id),
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  external_id text NOT NULL,
  canonical_url text NOT NULL,
  verification_url text,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(call_id,external_id)
);
CREATE INDEX x_search_citations_post ON x_search_citations(external_id);
CREATE INDEX x_search_citations_topic ON x_search_citations(topic_id);
