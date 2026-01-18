// netlify/functions/get-activity-streams.js
// Fetch Strava activity streams by id
// Usage: /.netlify/functions/get-activity-streams?activityId=123&keys=time,heartrate,watts,velocity_smooth&key_by_type=true
// Token: Authorization: Bearer ... (preferred) or ?access_token=...

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function getBearerToken(event) {
  const auth = event.headers?.authorization || event.headers?.Authorization;
  if (auth && typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const qs = event.queryStringParameters || {};
    const activityId = qs.activityId || qs.id;
    if (!activityId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing activityId" }),
      };
    }

    const tokenFromHeader = getBearerToken(event);
    const tokenFromQuery = qs.access_token || qs.accessToken;
    const accessToken = tokenFromHeader || tokenFromQuery;

    if (!accessToken) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing access token (Authorization: Bearer ... or ?access_token=...)" }),
      };
    }

    const keys = (qs.keys || "time,heartrate,watts,velocity_smooth,grade_smooth,altitude,temp,cadence").toString();
    const keyByType = (qs.key_by_type ?? "true").toString();

    const url = `https://www.strava.com/api/v3/activities/${encodeURIComponent(activityId)}/streams?keys=${encodeURIComponent(
      keys
    )}&key_by_type=${encodeURIComponent(keyByType)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: "Strava API error",
          status: res.status,
          url,
          raw: text.slice(0, 2000),
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "server error", detail: String(err?.message || err) }),
    };
  }
};
