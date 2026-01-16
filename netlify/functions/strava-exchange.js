// netlify/functions/strava-exchange.js
// Exchange Strava OAuth code for tokens, then UPSERT into Supabase.
// Required Netlify env vars:
// - STRAVA_CLIENT_ID
// - STRAVA_CLIENT_SECRET
// - SUPABASE_URL (e.g. https://xyz.supabase.co)
// - SUPABASE_SERVICE_ROLE_KEY  (server-side only; never expose to client)

exports.handler = async (event) => {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const code = body.code;
  if (!code) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing code" }),
    };
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in environment",
      }),
    };
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment",
      }),
    };
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("code", code);
  params.append("grant_type", "authorization_code");

  // NOTE: If you want strict redirect_uri matching, uncomment and set your redirect_uri exactly.
  // params.append("redirect_uri", "http://localhost/");

  try {
    // 1) Exchange code -> tokens
    const resp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Strava token exchange failed:", resp.status, data);
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Strava token exchange failed", details: data }),
      };
    }

    // 2) Extract athlete_id (store as TEXT in Supabase)
    const athleteId = data?.athlete?.id;
    if (!athleteId) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "No athlete.id in Strava response" }),
      };
    }

    // 3) UPSERT into Supabase tokens table
    // Table schema expectation:
    // tokens(athlete_id text primary key, access_token text, refresh_token text, expires_at int, athlete jsonb, updated_at timestamptz)
    const upsertPayload = [
      {
        athlete_id: String(athleteId),
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        athlete: data.athlete, // jsonb
      },
    ];

    const upsertUrl = `${supabaseUrl}/rest/v1/tokens?on_conflict=athlete_id`;

    const upsertResp = await fetch(upsertUrl, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(upsertPayload),
    });

    if (!upsertResp.ok) {
      const txt = await upsertResp.text();
      console.error("Supabase UPSERT failed:", upsertResp.status, txt);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: "Supabase UPSERT failed",
          status: upsertResp.status,
          details: txt,
        }),
      };
    }

    console.log("Strava exchange OK; token saved for athlete_id:", String(athleteId));

    // 4) Return Strava response as-is (contains access_token etc.)
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Unhandled error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Unhandled error", message: err.message }),
    };
  }
};
