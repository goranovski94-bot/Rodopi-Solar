/**
 * Rodopi Solar – прост Node.js сървър
 * Обслужва статичните файлове и записва контактни запитвания в data/contacts.json
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT    = process.env.PORT || 3000;
const ROOT    = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'contacts.json');

// Създай data/ папка ако не съществува
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');

// MIME типове
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50_000) req.destroy(new Error('Payload too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`]/g, '').trim().slice(0, 500);
}

function serveFile(res, filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=3600',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ----- API: Запиши контактното запитване -----
  if (pathname === '/api/contact' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      const raw  = await readBody(req);
      let body;
      try { body = JSON.parse(raw); } catch { body = {}; }

      const entry = {
        id:        Date.now(),
        date:      new Date().toISOString(),
        name:      sanitize(body.name),
        phone:     sanitize(body.phone),
        email:     sanitize(body.email),
        message:   sanitize(body.message),
      };

      // Валидация
      if (!entry.name || !entry.phone || !entry.email) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, error: 'Попълнете задължителните полета.' }));
        return;
      }

      // Прочети → добави → запиши
      const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      existing.push(entry);
      fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), 'utf8');

      console.log(`[${entry.date}] Ново запитване от: ${entry.name} <${entry.email}>`);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error('Грешка при запис:', err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: 'Сървърна грешка.' }));
    }
    return;
  }

  // ----- API: Прочети всички запитвания -----
  if (pathname === '/api/contacts' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.writeHead(200);
    res.end(data);
    return;
  }

  // ----- Статични файлове -----
  const requestPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.normalize(path.join(ROOT, requestPath));

  // Предотвратяване на path traversal
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Ако е директория – опитай index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  serveFile(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║       Rodopi Solar – Сървърът стартира!  ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  Локален адрес:  http://localhost:${PORT}     ║`);
  console.log('║  Запитванията се записват в data/contacts.json  ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
});
