/**
 * TESTS — OUTILS PARTAGÉS : dossier de données temporaire, faux serveur SMTP, faux réseau, mini-runner
 * Outbound Sniper / Tests
 * À requérir AVANT tout module engine/ : fixe SNIPER_DATA_DIR sur un dossier jetable.
 */
const fs = require('node:fs');
const os = require('node:os');
const net = require('node:net');
const path = require('node:path');
const { EventEmitter } = require('node:events');

if (!process.env.SNIPER_DATA_DIR) process.env.SNIPER_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sniper-test-'));

/** Faux MX : `rcptCode(address)` renvoie le code SMTP (nombre) ou la ligne complète à répondre pour chaque RCPT TO. */
function startFakeSmtp(rcptCode) {
  const server = net.createServer((sock) => {
    sock.write('220 fake.mx ESMTP\r\n');
    let buf = '';
    sock.on('data', (chunk) => {
      buf += chunk;
      const lines = buf.split('\r\n');
      buf = lines.pop();
      for (const line of lines) {
        if (/^EHLO/i.test(line)) sock.write('250-fake.mx\r\n250 OK\r\n');
        else if (/^MAIL FROM/i.test(line)) sock.write('250 OK\r\n');
        else if (/^RCPT TO/i.test(line)) {
          const r = rcptCode(line.match(/<([^>]+)>/)[1]);
          sock.write(`${typeof r === 'number' ? `${r} ${r === 250 ? 'OK' : 'No such user'}` : r}\r\n`);
        }
        else if (/^QUIT/i.test(line)) sock.end('221 Bye\r\n');
      }
    });
    sock.on('error', () => {});
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

/** Remplace globalThis.fetch par une suite de réponses [fragment d'URL attendu, statut, corps JSON]. */
function stubFetch(steps) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    const step = steps[calls.length];
    calls.push({ url: String(url), opts });
    if (!step || !String(url).includes(step[0])) throw new Error(`fetch inattendu : ${url}`);
    return { ok: step[1] >= 200 && step[1] < 300, status: step[1], json: async () => step[2] };
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

/** Remplace mod.get (http ou https) par une réponse fixe ; aucune connexion n'est ouverte. */
function stubGet(mod, statusCode, body) {
  const original = mod.get;
  const calls = [];
  mod.get = (url, opts, cb) => {
    calls.push({ url: String(url), headers: opts?.headers || {} });
    const req = new EventEmitter();
    req.destroy = () => {};
    const res = new EventEmitter();
    res.statusCode = statusCode;
    process.nextTick(() => { cb(res); res.emit('data', JSON.stringify(body)); res.emit('end'); });
    return req;
  };
  return { calls, restore: () => { mod.get = original; } };
}

async function run(name, tests) {
  let failed = 0;
  console.log(`🧪 ${name}`);
  for (const [label, fn] of tests) {
    try { await fn(); console.log(`  ✅ ${label}`); } catch (e) { failed++; console.error(`  ❌ ${label}\n     ${e.stack.split('\n').slice(0, 3).join('\n     ')}`); }
  }
  return failed;
}

module.exports = { startFakeSmtp, stubFetch, stubGet, run, DATA_DIR: process.env.SNIPER_DATA_DIR };
