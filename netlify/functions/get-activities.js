// netlify/functions/get-activities.js
// get-activities with CORS headers and OPTIONS handling.
// Overwrite your existing function with this and deploy.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // 開発中は * にしておく。必要なら 'http://localhost:8081' 等に限定する。
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  // "Access-Control-Allow-Credentials": "true", // 必要なら有効化
};

exports.handler = async (event) => {
  // Respond to preflight OPTIONS immediately with CORS headers
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ""
    };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" })
      };
    }

    const userId = (event.queryStringParameters && event.queryStringParameters.userId)
      || (event.body && (() => { try { return JSON.parse(event.body).userId } catch(e){ return null; } })());

    if (!userId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing userId parameter" }) };
    }

    const supaUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/tokens?athlete_id=eq.${encodeURIComponent(userId)}&select=*`;
    const supaResp = await fetch(supaUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Accept': 'application/json'
      }
    });
    const supaText = await supaResp.text();
    let supaJson;
    try { supaJson = JSON.parse(supaText); } catch (e) { supaJson = { parseError: true, raw: supaText }; }

    if (!supaResp.ok) {
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase fetch failed', status: supaResp.status, body: supaJson }) };
    }

    if (!Array.isArray(supaJson) || supaJson.length === 0) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'token not found' }) };
    }

    const tokenRow = supaJson[0];
    const accessToken = tokenRow.access_token;

    if (!accessToken) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'no access_token stored' }) };
    }

    const perPage = (event.queryStringParameters && event.queryStringParameters.per_page) || 30;
    const stravaUrl = `https://www.strava.com/api/v3/athlete/activities?per_page=${encodeURIComponent(perPage)}`;

    const stravaResp = await fetch(stravaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const stravaText = await stravaResp.text();
    let stravaJson;
    try { stravaJson = JSON.parse(stravaText); } catch (e) { stravaJson = { parseError: true, raw: stravaText }; }

    if (!stravaResp.ok) {
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Strava API error', status: stravaResp.status, body: stravaJson }) };
    }

    // Success
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      body: JSON.stringify({ activities: stravaJson })
    };
  } catch (err) {
    console.error('[get-activities] unexpected error', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'internal', message: String(err) }) };
  }
};
