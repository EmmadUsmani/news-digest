import { chromium } from 'playwright';
import assert from 'node:assert/strict';
async function smoke() {
const browser = await chromium.launch({ headless: true });
try {
 for (const [name, width, height] of [['desktop', 1440, 1100], ['mobile', 390, 844]] as const) {
 const page = await browser.newPage({ viewport: { width, height } });
 const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
 await page.goto('http://localhost:8000');
 await page.getByText('System online · Database and queue connected').waitFor();
 await page.locator('.topic-grid').getByRole('heading', { name: 'Tech & AI', exact: true }).waitFor();
 assert.equal(await page.locator('.topic-grid article').count(), 4);
 if (name === 'desktop') {
 await page.getByRole('button', { name: 'Create edition · last 24 hours' }).click();
 await page.locator('.period').filter({hasText:'Saved edition'}).waitFor();
 }
 await page.locator('.digest-topic').first().waitFor();
 await page.getByText('Topic phrase filtering', { exact: false }).waitFor();
 assert.equal(await page.locator('.selection-count').filter({hasText:'filtered by topic rules'}).count(),4);
 assert.equal(await page.locator('.selection-count').filter({hasText:'filtered by quality rules'}).count(),4);
 await page.locator('.omissions summary').first().click();
 await page.getByText('Monthly schedule guide', {exact:false}).waitFor();
 await page.locator('.digest-topic ol details summary').first().click();
 await page.getByText('Topic phrase:', {exact:false}).first().waitFor();
 assert.equal(await page.locator('.digest-topic').count(), 4);
 assert.ok(await page.locator('.digest-topic ol>li').count() > 0);
 const snapshot = await (await page.request.get('http://localhost:8000/api/digest-previews/latest')).json();
 await page.reload();
 await page.locator('.period').filter({hasText:'Saved edition'}).waitFor();
 const reloaded = await (await page.request.get('http://localhost:8000/api/digest-previews/latest')).json();
 assert.deepEqual(reloaded, snapshot);
 await page.getByText('Browse saved editions', {exact:true}).click();
 const historyResponse = await page.request.get('http://localhost:8000/api/digest-previews');
 const history = await historyResponse.json();
 const older = history.entries[1];
 assert.ok(older);
 await page.locator(`.edition-history a[href="?edition=${older.id}"]`).click();
 await page.waitForURL(`**/?edition=${older.id}`);
 await page.reload();
 await page.locator('.period').filter({hasText:older.id.slice(0,8)}).waitFor();
 await page.getByText('Browse saved editions', {exact:true}).click();
 await page.getByRole('button', {name:'Open latest edition',exact:true}).click();
 await page.locator('.period').filter({hasText:snapshot.id.slice(0,8)}).waitFor();
 if (history.hasMore) {
 await page.getByRole('button', {name:'Older editions',exact:true}).click();
 await page.getByText('Page 2', {exact:true}).waitFor();
 await page.getByRole('button', {name:'Newer editions',exact:true}).click();
 await page.getByText('Page 1', {exact:true}).waitFor();
 }
 await page.getByText('Browse saved editions', {exact:true}).click();
 await page.locator('.headlines a').first().waitFor();
 for (const article of await page.locator('.topic-grid article').all()) assert.ok(await article.locator('.headlines a').count() > 0);
 assert.equal(await page.locator('.headlines a[href*="betting"]').count(), 0);
 await page.getByText('Automatic delivery is not connected yet.', { exact: false }).waitFor();
 assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
 assert.deepEqual(errors, []);
 await page.locator('.omissions summary').first().click();
 await page.getByText('Monthly schedule guide', {exact:false}).waitFor();
 await page.screenshot({ path: `docs/screenshots/foundation-${name}.png`, fullPage: true });
 await page.getByText('Browse saved editions', {exact:true}).click();
 await page.locator('.edition-history a').first().waitFor();
 await page.screenshot({ path: `docs/screenshots/history-${name}.png`, fullPage: false });
 await page.close();
 }
 // Isolated browser-only fixture verifies the multi-article UI when live windows
 // contain no matching headlines. Never persisted or included in live screenshots.
 const page = await browser.newPage();
 const fixture = await (await page.request.get('http://localhost:8000/api/digest-previews/latest')).json();
 const story = fixture.topics[0].stories[0];
 story.coverage = [story.coverage[0], { ...story.coverage[0], id: '00000000-0000-4000-8000-000000000099', title: 'Fixture: additional coverage', url: 'https://example.org/fixture-coverage' }];
 await page.route('**/api/digest-previews/latest', route => route.fulfill({ json: fixture }));
 await page.goto('http://localhost:8000');
 await page.getByText('Related coverage · 2 articles', {exact:true}).click();
 assert.equal(await page.getByRole('link', {name:'Fixture: additional coverage'}).getAttribute('href'), 'https://example.org/fixture-coverage');
 await page.getByText('Grouped by similar headlines; independent reporting is unverified.').waitFor();
 await page.close();
} finally { await browser.close(); }

}
void smoke();
