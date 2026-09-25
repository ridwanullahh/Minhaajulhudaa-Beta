// BismiLLAH Ar-Rahman Ar-Roheem — Astro SSR supervisor for AppSail.
// Same live-verified pattern as the fleet supervisors:
//   1. Binds $PORT IMMEDIATELY (platform health check never sees a dead port).
//   2. Serves GET /__boot with the captured boot journal (remote crash visibility).
//   3. Boots the Astro Node server (dist/server/entry.mjs) on an internal port,
//      then transparently proxies external traffic to it.
//   4. Never exits on app-boot failure — keeps serving the journal instead.
import http from 'node:http';
import { appendFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const EXT_PORT = Number(process.env.PORT || 8080);
const INT_PORT = Number(process.env.INTERNAL_PORT || 4321);
const BOOT_DIR = resolve(process.cwd(), '.boot');
const journal = [];
let proxyUp = false;

function note(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  journal.push(stamped);
  if (journal.length > 200) journal.shift();
  try { mkdirSync(BOOT_DIR, { recursive: true }); appendFileSync(resolve(BOOT_DIR, 'boot.log'), stamped + '\n'); } catch {}
  console.log('[supervisor]', line);
}

const server = http.createServer((req, res) => {
  if (req.url === '/__boot') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(journal.join('\n'));
    return;
  }
  if (!proxyUp) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Starting — retry shortly.\n\n--- boot journal ---\n' + journal.join('\n'));
    return;
  }
  const p = http.request(
    { host: '127.0.0.1', port: INT_PORT, path: req.url, method: req.method, headers: { ...req.headers, host: req.headers.host } },
    (pr) => {
      res.writeHead(pr.statusCode || 502, pr.headers);
      pr.pipe(res, { end: true });
    }
  );
  p.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Upstream error.');
  });
  req.pipe(p, { end: true });
});

server.listen(EXT_PORT, '0.0.0.0', () => note(`supervisor listening on :${EXT_PORT}, proxying to :${INT_PORT}`));

function boot() {
  note(`spawning Astro entry (dist/server/entry.mjs) with HOST=127.0.0.1 PORT=${INT_PORT}`);
  const child = spawn(process.execPath, ['dist/server/entry.mjs'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(INT_PORT), INTERNAL_PORT: undefined },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => {
    const t = String(d).trim();
    if (t) { note('[astro] ' + t.split('\n').slice(-2).join(' | ')); }
  });
  child.stderr.on('data', (d) => {
    const t = String(d).trim();
    if (t) { note('[astro:err] ' + t.split('\n').slice(-3).join(' | ')); }
  });
  child.on('exit', (code, sig) => {
    proxyUp = false;
    note(`astro exited code=${code} sig=${sig} — respawning in 3s`);
    setTimeout(boot, 3000);
  });
  // Give Astro a moment, then mark the proxy open.
  setTimeout(() => {
    proxyUp = true;
    note('proxy opened (astro boot window elapsed)');
  }, 2500);
}

boot();

process.on('uncaughtException', (err) => note('uncaught: ' + (err?.stack || err)));
process.on('unhandledRejection', (err) => note('unhandled: ' + (err?.stack || err)));
// Bismillah Ar-Rahman Ar-Roheem. AlhamduliLLAH.
