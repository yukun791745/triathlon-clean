// netlify/functions/strava-exchange.js
// Minimal Netlify Function to exchange Strava OAuth code for tokens.
// Requires STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in Netlify env vars.
// Do NOT hard-code secrets in repo.

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
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const code = body.code;
  if (!code) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing code" }) };
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in environment" }) };
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("code", code);
  params.append("grant_type", "authorization_code");

  try {
    const resp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Strava token exchange failed:", resp.status, data);
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "Strava token exchange failed", details: data }) };
    }

    console.log("Strava token exchange success for code:", code ? "(present)" : "(missing)");
    // Return the Strava response as-is. Do NOT include secrets.
    return { statusCode: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS }, body: JSON.stringify(data) };
  } catch (err) {
    console.error("Fetch error:", err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Fetch error", message: err.message }) };
  }
};
