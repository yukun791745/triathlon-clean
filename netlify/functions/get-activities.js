// Netlify Function: get-activities
// Query: ?userId=<athlete.id>
// Env vars:
// - STRAVA_CLIENT_ID
// - STRAVA_CLIENT_SECRET
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing required env vars: STRAVA_CLIENT_ID/STRAVA_CLIENT_SECRET/SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabaseGetToken = async (athleteId) => {
  const url = `${SUPABASE_URL}/rest/v1/tokens?athlete_id=eq.${encodeURIComponent(
    athleteId
  )}&select=*`;
  const r = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!r.ok) throw new Error(`Supabase GET failed ${r.status}: ${await r.text()}`);
  const arr = await r.json();
  return arr[0] || null;
};

const supabaseUpsertToken = async (athleteId, tokenObj) => {
  const url = `${SUPABASE_URL}/rest/v1/tokens?on_conflict=athlete_id`;
  const body = [
    {
      athlete_id: String(athleteId),
      access_token: tokenObj.access_token,
      refresh_token: tokenObj.refresh_token,
      expires_at: tokenObj.expires_at,
      athlete: tokenObj.athlete || null,
    },
  ];
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Supabase upsert failed ${r.status}: ${await r.text()}`);
  return r.json();
};

const refreshStravaToken = async (refresh_token) => {
  const params = new URLSearchParams();
  params.append("client_id", STRAVA_CLIENT_ID);
  params.append("client_secret", STRAVA_CLIENT_SECRET);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refresh_token);

  const resp = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const json = await resp.json();
  if (!resp.ok) throw new Error(`Strava refresh failed ${resp.status}: ${JSON.stringify(json)}`);
  return json; // access_token, refresh_token, expires_at, athlete
};

const fetchActivities = async (accessToken, perPage = 30) => {
  const url = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: CORS_HEADERS };
    }
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const athleteId = event.queryStringParameters?.userId;
    if (!athleteId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "missing userId" }) };
    }

    // 1) Load token
    const tokenRecord = await supabaseGetToken(athleteId);
    if (!tokenRecord) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: "no token for athlete_id" }) };
    }

    // 2) Always try with stored access_token first
    let accessToken = tokenRecord.access_token;
    let r1 = await fetchActivities(accessToken, 30);
    if (r1.ok) {
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(r1.body) };
    }

    // 3) If 401 invalid -> refresh ONCE, upsert, retry
    if (r1.status === 401) {
      const refreshed = await refreshStravaToken(tokenRecord.refresh_token);

      await supabaseUpsertToken(athleteId, {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: refreshed.expires_at,
        athlete: refreshed.athlete || tokenRecord.athlete || null,
      });

      accessToken = refreshed.access_token;
      const r2 = await fetchActivities(accessToken, 30);

      if (r2.ok) {
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(r2.body) };
      }

      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Strava API error after refresh", status: r2.status, body: r2.body }),
      };
    }

    // 4) other errors
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Strava API error", status: r1.status, body: r1.body }),
    };
  } catch (err) {
    console.error("get-activities fatal:", err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "server error", detail: err.message }) };
  }
};
