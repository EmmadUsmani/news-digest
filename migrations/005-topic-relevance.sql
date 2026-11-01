-- Explicit phrase rules are data; free-text guidance remains for the future editor.
ALTER TABLE topics ADD COLUMN relevance_policy jsonb NOT NULL
 DEFAULT '{"includeAny":[],"excludeAny":[]}'
 CHECK (jsonb_typeof(relevance_policy) = 'object'
   AND jsonb_typeof(relevance_policy->'includeAny') = 'array'
   AND jsonb_typeof(relevance_policy->'excludeAny') = 'array');
UPDATE topics SET relevance_policy = '{"includeAny":["AI","artificial intelligence","machine learning","LLM","OpenAI","Anthropic","Claude","GPT","Gemini","DeepMind","software","programming","developer","code","coding","computer","computing","technology","tech","chip","semiconductor","GPU","Apple","Microsoft","Google","Meta","Linux","browser","internet","cybersecurity","robot","robotics","design","startup","smartphone","iPhone","Android","database","JavaScript","Python","Rust"],"excludeAny":["sponsored","promo code","gift guide","best deals"]}'
WHERE id='00000000-0000-4000-8000-000000000011';
UPDATE topics SET relevance_policy = '{"includeAny":["NBA","Lakers","Celtics","Warriors","Knicks","Nets","Bulls","Cavaliers","Mavericks","Nuggets","Pistons","Rockets","Pacers","Clippers","Grizzlies","Bucks","Timberwolves","Pelicans","Thunder","Magic","76ers","Suns","Trail Blazers","Kings","Spurs","Raptors","Jazz","Wizards","Hornets","Hawks","Miami Heat","LeBron","Wembanyama"],"excludeAny":["WNBA","NCAA","college basketball","EuroLeague","NFL","MLB","NHL","fantasy","best bets","odds"]}'
WHERE id='00000000-0000-4000-8000-000000000012';
UPDATE topics SET relevance_policy = '{"includeAny":["game","games","gaming","studio","studios","PlayStation","Xbox","Nintendo","Steam","Ubisoft","EA","Activision","Blizzard","Sony","console","esports"],"excludeAny":["walkthrough","promo code","gift guide","best deals"]}'
WHERE id='00000000-0000-4000-8000-000000000013';
-- Broad world coverage has no required phrase: avoid a brittle political entity allowlist.
UPDATE topics SET relevance_policy = '{"includeAny":[],"excludeAny":["sponsored","promo code","horoscope","gift guide"]}'
WHERE id='00000000-0000-4000-8000-000000000014';
