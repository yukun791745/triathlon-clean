// Netlify Function: get-activities
// Expects query param: ?userId=<athlete.id> (athlete.id used as primary key -> column: athlete_id)
// Env vars required:
// - STRAVA_CLIENT_ID
// - STRAVA_CLIENT_SECRET
// - SUPABASE_URL (e.g. https://xyz.supabase.co)
// - SUPABASE_SERVICE_ROLE_KEY

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required env vars: STRAVA_CLIENT_ID/STRAVA_CLIENT_SECRET/SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY');
}

// Fetch token record by athlete_id
const supabaseGetToken = async (athleteId) => {
  const url = `${SUPABASE_URL}/rest/v1/tokens?athlete_id=eq.${encodeURIComponent(athleteId)}&select=*`;
  const r = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Supabase GET failed ${r.status}: ${txt}`);
  }
  const arr = await r.json();
  return arr[0] || null;
};

// Upsert token record using athlete_id as primary key
const supabaseUpsertToken = async (athleteId, tokenObj) => {
  const url = `${SUPABASE_URL}/rest/v1/tokens?on_conflict=athlete_id`;
  const body = [{
    athlete_id: athleteId,
    access_token: tokenObj.access_token,
    refresh_token: tokenObj.refresh_token,
    expires_at: tokenObj.expires_at,
    athlete: tokenObj.athlete || null
  }];
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Supabase upsert failed ${r.status}: ${txt}`);
  }
  return r.json();
};

const refreshStravaToken = async (refresh_token) => {
  const params = new URLSearchParams();
  params.append('client_id', STRAVA_CLIENT_ID);
  params.append('client_secret', STRAVA_CLIENT_SECRET);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refresh_token);

  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(`Strava refresh failed ${resp.status}: ${JSON.stringify(json)}`);
  }
  return json; // contains access_token, refresh_token, expires_at, athlete (maybe)
};

exports.handler = async (event) => {
  try {
    const athleteId = event.queryStringParameters?.userId;
    if (!athleteId) return { statusCode: 400, body: JSON.stringify({ error: 'missing userId (athlete.id)' }) };

    // 1) load token record from Supabase
    const tokenRecord = await supabaseGetToken(athleteId);
    if (!tokenRecord) return { statusCode: 404, body: JSON.stringify({ error: 'no token for athlete_id' }) };

    let accessToken = tokenRecord.access_token;
    const now = Math.floor(Date.now() / 1000);

    // 2) refresh if expired or near expiry
    if (!tokenRecord.expires_at || tokenRecord.expires_at <= now + 30) {
      try {
        const refreshed = await refreshStravaToken(tokenRecord.refresh_token);
        accessToken = refreshed.access_token;
        await supabaseUpsertToken(athleteId, {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at,
          athlete: refreshed.athlete || tokenRecord.athlete || null
        });
      } catch (err) {
        console.error('refresh failed', err);
        return { statusCode: 500, body: JSON.stringify({ error: 'token refresh failed', detail: err.message }) };
      }
    }

    // 3) call Strava activities API
    const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!activitiesRes.ok) {
      // If unauthorized, try a single refresh & retry
      if (activitiesRes.status === 401) {
        try {
          const refreshed = await refreshStravaToken(tokenRecord.refresh_token);
          accessToken = refreshed.access_token;
          await supabaseUpsertToken(athleteId, {
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token,
            expires_at: refreshed.expires_at,
            athlete: refreshed.athlete || tokenRecord.athlete || null
          });
          const retryRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!retryRes.ok) {
            const txt = await retryRes.text();
            return { statusCode: retryRes.status, body: txt };
          }
          const activities = await retryRes.json();
          return { statusCode: 200, body: JSON.stringify(activities) };
        } catch (err) {
          console.error('refresh & retry failed', err);
          return { statusCode: 500, body: JSON.stringify({ error: 'refresh & retry failed', detail: err.message }) };
        }
      }
      const txt = await activitiesRes.text();
      return { statusCode: activitiesRes.status, body: txt };
    }

    const activities = await activitiesRes.json();
    return { statusCode: 200, body: JSON.stringify(activities) };

  } catch (err) {
    console.error('get-activities error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
