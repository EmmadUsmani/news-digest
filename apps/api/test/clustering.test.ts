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
