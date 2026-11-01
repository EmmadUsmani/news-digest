// Explicit live check: connects Ars Technica and waits for real worker collection.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { topicSchema, topicUpdateSchema } from '@digest/contracts';
const base='http://localhost:8000';
async function smoke() {
 const browser=await chromium.launch(); const context=await browser.newContext();
 const created: string[]=[];
 try {
 const original=topicSchema.array().parse(await (await context.request.get(`${base}/api/topics`)).json());
 for (const [device,width,height] of [['desktop',1440,1100],['mobile',390,844]] as const) {
 const topic=topicSchema.parse(await (await context.request.post(`${base}/api/topics`,{data:{...topicUpdateSchema.strip().parse(original[0]),name:`Custom feed check ${device}`,relevancePolicy:{includeAny:[],excludeAny:[]}}})).json()); created.push(topic.id);
 const page=await context.newPage(); await page.setViewportSize({width,height}); await page.goto(base);
 await page.getByText('Manage topics',{exact:true}).click(); await page.getByRole('button',{name:`Sources for ${topic.name}`,exact:true}).click();
 const form=page.getByRole('form',{name:`Add feed for ${topic.name}`,exact:true});
 await form.getByLabel('Feed name',{exact:true}).fill('Ars Technica'); await form.getByLabel('Feed URL',{exact:true}).fill('https://127.0.0.1/feed');
 await form.getByRole('button',{name:'Connect feed',exact:true}).click(); await page.getByRole('status').filter({hasText:'Use a public HTTPS'}).waitFor();
 assert.deepEqual(topicSchema.array().parse(await (await context.request.get(`${base}/api/topics`)).json()).find(t=>t.id===topic.id)?.sources,[]);
 await form.getByLabel('Feed URL',{exact:true}).fill('https://arstechnica.com/feed/');
 await form.getByRole('button',{name:'Connect feed',exact:true}).click(); await page.getByRole('status').filter({hasText:'Feed connected.'}).waitFor();
 const saved=topicSchema.array().parse(await (await context.request.get(`${base}/api/topics`)).json()).find(t=>t.id===topic.id)!; assert.equal(saved.sources.length,1);
 for (const url of ['http://arstechnica.com/feed/','https://user:secret@publisher.org/feed','https://169.254.169.254/feed']) assert.equal((await context.request.post(`${base}/api/topics/${topic.id}/feeds`,{data:{name:'Invalid',url}})).status(),400);
 const card=page.locator('.topic-grid article').filter({has:page.getByRole('heading',{name:topic.name,exact:true})});
 // Refresh incoming stories after the worker's minute scheduler discovers the source.
 const deadline=Date.now()+100000;
 while(Date.now()<deadline) {
 const groups=await (await context.request.get(`${base}/api/content`)).json();
 if(groups.find((g:{topicId:string;items:unknown[]})=>g.topicId===topic.id)?.items.length) break;
 await page.waitForTimeout(2000);
 }
 await page.reload(); await card.locator('.headlines a').first().waitFor();
 await page.getByText('Manage topics',{exact:true}).click(); await page.getByRole('button',{name:`Sources for ${topic.name}`,exact:true}).click();
 const sources=page.getByRole('form',{name:`Sources for ${topic.name}`,exact:true}); assert.equal(await sources.getByRole('checkbox',{name:'Ars Technica'}).isChecked(),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('.topic-settings').screenshot({path:`docs/screenshots/custom-feeds-${device}.png`});
 await sources.getByRole('checkbox',{name:'Ars Technica'}).uncheck(); await sources.getByRole('button',{name:'Save sources',exact:true}).click();
 await sources.getByRole('status').filter({hasText:'Source connections saved.'}).waitFor(); await card.getByText('No sources connected yet.',{exact:false}).waitFor();
 await context.request.delete(`${base}/api/topics/${topic.id}`); await page.close();
 }
 // Leave the verified new publisher connected to the owner's Tech & AI topic.
 const connected=await context.request.post(`${base}/api/topics/${original[0].id}/feeds`,{data:{name:'Ars Technica',url:'https://arstechnica.com/feed/'}}); assert.equal(connected.status(),201);
 assert.equal((await context.request.post(`${base}/api/topics/00000000-0000-4000-8000-999999999999/feeds`,{data:{name:'Missing',url:'https://publisher.org/feed'}})).status(),404);
 console.log('Custom feeds desktop/mobile: validation, real scheduled collection, URL reuse, persistence and disconnect passed; Ars Technica connected to Tech & AI');
 } finally { for(const id of created) await context.request.delete(`${base}/api/topics/${id}`); await browser.close(); }
}
void smoke();
