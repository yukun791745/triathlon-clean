exports.handler = async (event) => {
  // Echo back what the function received (query, headers, body) for debugging.
  // Do NOT include any secrets. This is temporary—remove after debugging.
  const received = {
    timestamp: new Date().toISOString(),
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters || null,
    headers: Object.fromEntries(
      Object.entries(event.headers || {}).map(([k, v]) => [k, v])
    ),
    body: event.body || null,
    isBase64Encoded: !!event.isBase64Encoded
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received }, null, 2)
  };
};
