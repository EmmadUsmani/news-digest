import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clusterCandidates, sameEvent } from '../src/modules/digests/domain/cluster';
import { rank, type Candidate } from '../src/modules/digests/domain/rank';
const item = (id: string, title: string, source = 'Publisher'): Candidate => ({ id, title, sources: [source], url: `https://example.org/${id}`, excerpt: '', publishedAt: '2026-11-01T12:00:00Z', points: 0 });
test('headline clusters retain coverage, spend one slot and do not reward unverified syndication', () => {
 const a = item('a', 'Nintendo announces new console launch date', 'Publisher');
 const b = item('b', 'Nintendo announces the new console launch date', 'Syndicator');
 const c = item('c', 'Studio closes following bankruptcy filing');
 const stories = rank([a,b,c],new Date('2026-11-01'),new Date('2026-11-02'),2);
 assert.equal(stories.length,2);
 assert.deepEqual(stories[0].coverage.map(a=>a.id),['a','b']);
 assert.deepEqual(stories[0].sources,['Publisher','Syndicator']);
 assert.equal(stories[0].score,5);
 assert.equal(clusterCandidates([a,b,c]).length,2);
});
test('clustering separates different versions, dates, short generic titles and related events', () => {
 const pairs = [
 ['Lakers beat Celtics 110 105 in overtime','Lakers beat Celtics 112 105 in overtime'],
 ['Nintendo announces new console launch date','Nintendo delays new console launch date'],
 ['Company announces update','Company releases update'],
 ];
 for (const [a,b] of pairs) assert.equal(sameEvent(item('a',a),item('b',b)),false);
 const a = item('a','Nintendo announces new console launch date');
 assert.equal(sameEvent(a,{...a,publishedAt:'2026-11-04T12:00:00Z'}),false);
});

test('complete-link grouping prevents an overlap chain from merging distinct headlines', () => {
 const a = item('a','Alpha bravo charlie delta echo foxtrot');
 const b = item('b','Alpha bravo charlie delta echo golf');
 const c = item('c','Alpha bravo charlie delta golf hotel');
 assert.equal(sameEvent(a,b),true);
 assert.equal(sameEvent(b,c),true);
 assert.equal(sameEvent(a,c),false);
 assert.deepEqual(clusterCandidates([a,b,c]).map(group => group.length),[2,1]);
});

test('repeated discovery cannot outrank fresher reporting or change cluster leads', () => {
 const start = new Date('2026-11-01'), end = new Date('2026-11-02');
 const older = { ...item('a', 'Research lab publishes model evaluation results'), publishedAt: '2026-11-01T06:00:00Z' };
 const fresh = { ...item('b', 'Studio closes following bankruptcy filing'), publishedAt: '2026-11-01T18:00:00Z' };
 const repeated = { ...older, sources: ['Publisher', 'Hacker News', 'Google News: AI', 'Google News: technology'] };
 const baseline = rank([older,fresh],start,end,1);
 const discovered = rank([repeated,fresh],start,end,1);
 assert.equal(discovered[0].id,fresh.id);
 assert.deepEqual(discovered,baseline);
 const story = rank([repeated],start,end,1)[0];
 assert.equal(story.score,rank([older],start,end,1)[0].score);
 assert.deepEqual(story.coverage[0].sources,repeated.sources);
 assert.ok(story.reasons.some(reason => reason.includes('independence unverified; no score bonus')));
 const alternate = { ...older, id: 'c', sources: ['Syndicator'], publishedAt: '2026-11-01T12:00:00Z' };
 const cluster = rank([repeated,alternate],start,end,1)[0];
 assert.equal(cluster.id,alternate.id);
 assert.equal(cluster.coverage.length,2);
 assert.equal(cluster.score,5);
});
