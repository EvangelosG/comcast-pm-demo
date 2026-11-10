const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const catalog = require('./src/catalog');
const { createProgressStore } = require('./src/progressStore');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const TOKENS_FILE = path.join(__dirname, '..', 'design-system', 'tokens.css');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const store = createProgressStore();

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (err) { reject(err); }
    });
  });
}

function serveFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/api/catalog') return sendJson(res, 200, catalog);

  if (parsed.pathname === '/api/continue-watching' && req.method === 'GET') {
    const { profileId, deviceId } = parsed.query;
    if (!profileId || !deviceId) return sendJson(res, 400, { error: 'profileId and deviceId are required' });
    return sendJson(res, 200, store.getContinueWatching(profileId, deviceId));
  }

  if (parsed.pathname === '/api/progress' && req.method === 'POST') {
    try {
      const { profileId, deviceId, titleId, positionMin } = await readBody(req);
      const title = catalog.find((t) => t.id === titleId);
      if (!profileId || !deviceId || !title) return sendJson(res, 400, { error: 'unknown profile, device or title' });
      return sendJson(res, 200, store.saveProgress(profileId, deviceId, titleId, positionMin, title.runtimeMin));
    } catch (err) {
      return sendJson(res, 400, { error: 'invalid JSON body' });
    }
  }

  if (parsed.pathname === '/api/progress' && req.method === 'DELETE') {
    const { profileId, deviceId, titleId } = parsed.query;
    return sendJson(res, 200, { removed: store.removeFromRow(profileId, deviceId, titleId) });
  }

  if (parsed.pathname === '/tokens.css') return serveFile(res, TOKENS_FILE);
  const file = parsed.pathname === '/' ? 'index.html' : path.normalize(parsed.pathname).replace(/^[/\\]+/, '');
  if (file.indexOf('..') !== -1) { res.writeHead(400); return res.end('Bad path'); }
  return serveFile(res, path.join(PUBLIC_DIR, file));
});

server.listen(PORT, () => console.log('Stream demo running at http://localhost:' + PORT));
