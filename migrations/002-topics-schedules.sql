CREATE TABLE digest_schedules (
 profile_id uuid PRIMARY KEY REFERENCES profiles(id),
 cadence text NOT NULL DEFAULT '0 8 * * *',
 timezone text NOT NULL DEFAULT 'America/Los_Angeles',
 coverage_window text NOT NULL DEFAULT 'P1D',
 story_budget integer NOT NULL DEFAULT 5 CHECK (story_budget BETWEEN 0 AND 20),
 post_budget integer NOT NULL DEFAULT 5 CHECK (post_budget BETWEEN 0 AND 20)
);
INSERT INTO digest_schedules(profile_id) SELECT id FROM profiles;
CREATE TABLE topics (
 id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES profiles(id),
 name text NOT NULL, description text NOT NULL, include_guidance text NOT NULL,
 exclude_guidance text NOT NULL DEFAULT '', enabled boolean NOT NULL DEFAULT true,
 position integer NOT NULL, story_budget integer NOT NULL DEFAULT 5 CHECK (story_budget BETWEEN 0 AND 20),
 post_budget integer NOT NULL DEFAULT 5 CHECK (post_budget BETWEEN 0 AND 20),
 sources jsonb NOT NULL DEFAULT '[]', queries jsonb NOT NULL DEFAULT '[]', accounts jsonb NOT NULL DEFAULT '[]'
);
INSERT INTO topics(id, profile_id, name, description, include_guidance, exclude_guidance, position) VALUES
('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','Tech & AI','Technology, programming, AI and digital design.','Prioritize AI models, tools, agents, research and launches useful to builders.','Promotional content and SEO filler',0),
('00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001','NBA','NBA basketball news and analysis.','Teams, players, trades, injuries and important games.','Other sports and non-NBA basketball',1),
('00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000001','Gaming','The gaming industry across studios and platforms.','Major releases, announcements, studios and industry business.','Walkthroughs, listicles and promotional filler',2),
('00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000001','World news & politics','US and global news, politics and major public issues.','Consequential developments with credible reporting.','Unsourced rumors and clickbait',3);
