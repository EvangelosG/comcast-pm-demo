// Watch-progress store behind the "Continue Watching" row.
//
// Progress is saved per profile AND per device. A title started on the living
// room TV does not appear in Continue Watching on a phone signed in to the same
// profile. Epic STR-101 in backlog/epics.csv proposes changing this.

const MIN_PERCENT = 5; // below this the title counts as "not really started"
const MAX_PERCENT = 95; // above this the title counts as finished
const MAX_ROW_ITEMS = 10;
const EXPIRY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function createProgressStore(now) {
  const clock = now || (() => Date.now());
  const entries = new Map();

  function key(profileId, deviceId) {
    return profileId + ':' + deviceId;
  }

  function saveProgress(profileId, deviceId, titleId, positionMin, runtimeMin) {
    const k = key(profileId, deviceId);
    if (!entries.has(k)) entries.set(k, new Map());
    const percent = Math.min(100, Math.round((positionMin / runtimeMin) * 100));
    entries.get(k).set(titleId, { titleId, positionMin, runtimeMin, percent, updatedAt: clock() });
    return entries.get(k).get(titleId);
  }

  function getContinueWatching(profileId, deviceId) {
    const perDevice = entries.get(key(profileId, deviceId));
    if (!perDevice) return [];
    const cutoff = clock() - EXPIRY_DAYS * DAY_MS;
    return Array.from(perDevice.values())
      .filter((e) => e.percent > MIN_PERCENT && e.percent < MAX_PERCENT)
      .filter((e) => e.updatedAt >= cutoff)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_ROW_ITEMS);
  }

  function removeFromRow(profileId, deviceId, titleId) {
    const perDevice = entries.get(key(profileId, deviceId));
    return perDevice ? perDevice.delete(titleId) : false;
  }

  return { saveProgress, getContinueWatching, removeFromRow };
}

module.exports = { createProgressStore, MIN_PERCENT, MAX_PERCENT, MAX_ROW_ITEMS, EXPIRY_DAYS };
