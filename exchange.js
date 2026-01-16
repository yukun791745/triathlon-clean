// exchange.js
// Node (v18+) の fetch を使って Strava の token 交換を行う短いスクリプト.
// 実行例:
// CLIENT_ID=171117 CLIENT_SECRET='ここにClientSecret' CODE='ここにcode' REDIRECT_URI='http://localhost/' node exchange.js

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const code = process.env.CODE;
const redirectUri = process.env.REDIRECT_URI || 'http://localhost/';

if (!clientId || !clientSecret || !code) {
  console.error('ERROR: CLIENT_ID, CLIENT_SECRET, and CODE must be set as env vars.');
  process.exit(1);
}

(async () => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);

    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await res.text();
    console.log('HTTP', res.status, res.statusText);
    console.log('RESPONSE BODY:');
    console.log(text);
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
})();
