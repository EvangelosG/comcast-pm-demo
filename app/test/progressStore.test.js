const assert = require('assert');
const { createProgressStore } = require('../src/progressStore');

const DAY_MS = 24 * 60 * 60 * 1000;
let now = 1000000;
const store = createProgressStore(() => now);

store.saveProgress('p1', 'tv', 't01', 20, 52);
assert.strictEqual(store.getContinueWatching('p1', 'tv').length, 1, 'in-progress title shows on the same device');
assert.strictEqual(store.getContinueWatching('p1', 'phone').length, 0, 'progress is not shared across devices');

store.saveProgress('p1', 'tv', 't03', 2, 127);
assert.strictEqual(store.getContinueWatching('p1', 'tv').length, 1, 'barely started titles are hidden');

store.saveProgress('p1', 'tv', 't04', 43, 44);
assert.strictEqual(store.getContinueWatching('p1', 'tv').length, 1, 'finished titles are hidden');

now += 31 * DAY_MS;
assert.strictEqual(store.getContinueWatching('p1', 'tv').length, 0, 'entries expire after 30 days');

console.log('progressStore tests passed');
