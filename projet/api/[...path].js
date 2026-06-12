const RAILWAY_URL = 'https://safehaven-production-05cb.up.railway.app';

module.exports = async function handler(req, res) {
  const segments = req.query.path;
  const targetPath = Array.isArray(segments) ? segments.join('/') : segments;
  const targetUrl = `${RAILWAY_URL}/api/${targetPath}`;

  const headers = { 'Content-Type': 'application/json' };
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend inaccessible' });
  }
};
