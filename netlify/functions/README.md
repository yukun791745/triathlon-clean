# strava-exchange Netlify Function

Purpose:
- Exchange a Strava OAuth `code` for tokens (access_token, refresh_token) on the server side.
- Keep Strava client secret out of the repo; use Netlify environment variables.

Required environment variables (set in Netlify Site > Site settings > Build & deploy > Environment):
- STRAVA_CLIENT_ID — your Strava app client ID
- STRAVA_CLIENT_SECRET — your Strava app client secret

Deployment notes:
1. Place `strava-exchange.js` under `netlify/functions/`.
2. Push and merge the branch to trigger Netlify deploy (functions are deployed automatically).
3. Add the two required environment variables in Netlify before testing.

How to call:
- POST JSON to the function endpoint (e.g. `/.netlify/functions/strava-exchange`) with body: `{ "code": "<authorization_code>" }`.
- The function returns Strava's JSON response on success (contains `access_token`, `refresh_token`, `athlete`, ...).

Security:
- Never commit STRAVA_CLIENT_SECRET (or any secret) in source code.
- Use Netlify environment variables to store secrets and rotate them if leaked.

Logs & debugging:
- View function execution logs in Netlify Dashboard → Functions → (select function) → Logs.
- On error, inspect the function logs; they contain the Strava response or fetch error.

Why this is minimal:
- Implemented in plain JS to avoid TypeScript build steps.
- Returns Strava response directly so client can continue flow or you can add server-side storage later.

```
