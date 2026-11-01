import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRelevance } from '../src/modules/digests/domain/relevance';
import { database } from '../src/libs/db/connections';
import { relevancePolicySchema } from '@digest/contracts';
test('phrase matching respects token boundaries, Unicode, punctuation and exclusion precedence', () => {
 const policy = { includeAny: ['AI', 'machine learning'], excludeAny: ['sponsored'] };
 const assess = (title: string, excerpt = '') => assessRelevance({title, excerpt}, policy);
 assert.equal(assess('Air travel is booming').eligible,false);
 assert.equal(assess('New ＡＩ tools').eligible,true);
 assert.equal(assess('Machine-learning research').eligible,true);
 assert.equal(assess('New release', 'AI tools for builders').eligible,true);
 assert.equal(assess('Sponsored AI launch').eligible,false);
 assert.equal(assess('New release', 'x '.repeat(301) + 'AI').eligible,false);
 assert.equal(assessRelevance({title:'Any story',excerpt:''},{includeAny:[],excludeAny:[]}).eligible,true);
 assert.equal(assessRelevance({title:'Any story',excerpt:''},{includeAny:['   '],excludeAny:[]}).eligible,false);
 assert.equal(relevancePolicySchema.safeParse({includeAny:[''],excludeAny:[]}).success,false);
});
test('seeded topic policies pass a small labeled relevance regression set', async () => {
 const db = database();
 try {
 const rows = (await db.query('SELECT name,relevance_policy FROM topics ORDER BY position')).rows;
 const policies = new Map(rows.map(row => [row.name,relevancePolicySchema.parse(row.relevance_policy)]));
 // Synthetic labels, not live content and not an editorial-quality benchmark.
 const cases: [string,string,boolean][] = [
 ['Tech & AI','Patrick Stewart reflects on a life on stage',false],
 ['Tech & AI','Air travel demand grows',false],
 ['Tech & AI','OpenAI announces new developer tools',true],
 ['Tech & AI','Linux kernel security update released',true],
 ['Tech & AI','Sponsored: best deals on AI software',false],
 ['NBA','NBA trade reshapes Lakers roster',true],
 ['NBA','LeBron injury update',true],
 ['NBA','NCAA college basketball tournament announced',false],
 ['NBA','NFL stars visit Lakers game',false],
 ['Gaming','Nintendo announces new console',true],
 ['Gaming','Game walkthrough: every hidden item',false],
 ['Gaming','Local council approves new park',false],
 ['World news & politics','Parliament approves election reforms',true],
 ['World news & politics','Sponsored holiday gift guide',false]
 ];
 for (const [topic,title,expected] of cases) {
 const policy = policies.get(topic); assert.ok(policy);
 assert.equal(assessRelevance({title,excerpt:''},policy).eligible,expected,topic + ': ' + title);
 }
 } finally { await db.end(); }
});
