import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { database } from '../apps/api/src/libs/db/connections';
const base = 'http://localhost:8000';
async function smoke() {
 const browser = await chromium.launch(); const context = await browser.newContext(); const db = database();
 const created: string[] = [];
 try {
 const original = topicSchema.array().parse(await (await context.request.get(`${base}/api/topics`)).json());
 const latest = await (await context.request.get(`${base}/api/digest-previews/latest`)).json();
 for (const [device,width,height] of [['desktop',1440,1100],['mobile',390,844]] as const) {
 const input = {...topicUpdateSchema.strip().parse(original[0]), name:`Source check ${device}`, relevancePolicy:{includeAny:[],excludeAny:[]}};
 const topic = topicSchema.parse(await (await context.request.post(`${base}/api/topics`,{data:input})).json()); created.push(topic.id);
 const page = await context.newPage(); await page.setViewportSize({width,height}); await page.goto(base);
 await page.getByText('Manage topics',{exact:true}).click();
 await page.getByRole('button',{name:`Sources for ${topic.name}`,exact:true}).click();
 const form = page.getByRole('form',{name:`Sources for ${topic.name}`,exact:true});
 await form.getByRole('checkbox',{name:'The Verge'}).check();
 await form.getByRole('button',{name:'Save sources',exact:true}).click();
 await form.getByRole('status').filter({hasText:'Source connections saved.'}).waitFor();
 const card = page.locator('.topic-grid article').filter({has:page.getByRole('heading',{name:topic.name,exact:true})});
 await card.locator('.headlines a').first().waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await form.screenshot({path:`docs/screenshots/topic-sources-${device}.png`});
 await page.reload(); await page.getByText('Manage topics',{exact:true}).click(); await page.getByRole('button',{name:`Sources for ${topic.name}`,exact:true}).click();
 await form.getByRole('checkbox',{name:'The Verge'}).waitFor(); assert.equal(await form.getByRole('checkbox',{name:'The Verge'}).isChecked(),true);
 const saved = topicSchema.array().parse(await (await context.request.get(`${base}/api/topics`)).json()).find(t=>t.id===topic.id)!;
 assert.deepEqual(saved.sources,['verge']);
 for (const ids of [['verge','missing'],['verge','verge']]) assert.equal((await context.request.put(`${base}/api/topics/${topic.id}/sources`,{data:{ids}})).status(),400);
 assert.deepEqual(topicSchema.array().parse(await (await context.request.get(`${base}/api/topics`)).json()).find(t=>t.id===topic.id),saved);
 const end=new Date();
 const edition = await (await context.request.post(`${base}/api/digest-previews`,{data:{windowStart:new Date(end.getTime()-86400000).toISOString(),windowEnd:end.toISOString()}})).json();
 assert.ok(edition.topics.find((t:{id:string})=>t.id===topic.id).stories.length>0);
 await form.getByRole('checkbox',{name:'The Verge'}).uncheck(); await form.getByRole('button',{name:'Save sources',exact:true}).click();
 await form.getByRole('status').filter({hasText:'Source connections saved.'}).waitFor();
 await card.getByText('No sources connected yet.',{exact:false}).waitFor();
 assert.deepEqual(await (await context.request.get(`${base}/api/digest-previews/${edition.id}`)).json(),edition);
 if(latest) assert.deepEqual(await (await context.request.get(`${base}/api/digest-previews/${latest.id}`)).json(),latest);
 await db.query('DELETE FROM topics WHERE id=$1',[topic.id]); await page.close();
 }
 assert.equal((await context.request.put(`${base}/api/topics/00000000-0000-4000-8000-999999999999/sources`,{data:{ids:[]}})).status(),404);
 assert.deepEqual(await (await context.request.get(`${base}/api/topics`)).json(),original);
 console.log('Source connections desktop/mobile: real incoming content, persistence, validation atomicity, new editions, disconnect and immutable history passed');
 } finally { await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])',[created]); await db.end(); await browser.close(); }
}
void smoke();
