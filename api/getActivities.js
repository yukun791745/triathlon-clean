// api/getActivities.js
// fetchActivities(site, userId) -> Promise<activitiesArray>
export async function fetchActivities(site, userId, per_page = 30) {
  if (!site || !userId) throw new Error('site and userId are required');
  const base = site.replace(/\/$/, '');
  const url = `${base}/.netlify/functions/get-activities?userId=${encodeURIComponent(userId)}&per_page=${per_page}`;

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON from get-activities: ${text}`);
  }

  // Support two shapes:
  // 1) { activities: [...] }  (recommended)
  // 2) [...] (direct array)
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.activities)) return json.activities;
  // If wrapper object, try common keys
  if (json && Array.isArray(json.data)) return json.data;
  throw new Error('Unexpected response shape from get-activities');
}
