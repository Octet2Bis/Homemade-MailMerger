// Rule of the repo: no JavaScript file over 250 lines (split it instead).
// node scripts/check-lines.mjs — exit code 1 if a file is too long.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX = 250;
const SKIP = new Set(['.git', 'node_modules']);
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.js') || name.endsWith('.mjs')) files.push(path);
  }
})('.');

const tooLong = files
  .map((file) => ({ file, lines: readFileSync(file, 'utf8').split('\n').length }))
  .filter(({ lines }) => lines > MAX);
for (const { file, lines } of tooLong) console.log(`✗ ${file}: ${lines} lines (max ${MAX})`);
console.log(`${files.length - tooLong.length}/${files.length} files within ${MAX} lines`);
if (tooLong.length > 0) process.exitCode = 1;
