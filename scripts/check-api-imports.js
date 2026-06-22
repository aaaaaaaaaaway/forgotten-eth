import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const apiDir = join(process.cwd(), 'api');
const importPattern = /(?:import\s+(?:[^'\"]+?\s+from\s+)?|export\s+[^'\"]+?\s+from\s+|import\s*\()(['\"])(\.\.?\/[^'\"]+)\1/g;
const missing = [];

for (const file of readdirSync(apiDir).filter((name) => name.endsWith('.js')).sort()) {
  const path = join(apiDir, file);
  const text = readFileSync(path, 'utf8');
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[2];
    let target = join(dirname(path), specifier);
    if (!target.endsWith('.js')) target += '.js';
    if (!existsSync(target)) missing.push(`${file} -> ${specifier} (${target})`);
  }
}

if (missing.length) {
  console.error('Missing API relative imports:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('All api/*.js relative imports resolve.');
