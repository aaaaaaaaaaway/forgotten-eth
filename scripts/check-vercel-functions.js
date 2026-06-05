import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const vercelPath = join(root, 'vercel.json');
const config = JSON.parse(readFileSync(vercelPath, 'utf8'));
const missing = [];

for (const functionPath of Object.keys(config.functions ?? {})) {
  if (!existsSync(join(root, functionPath))) missing.push(functionPath);
}

if (missing.length) {
  console.error('vercel.json references missing functions:');
  for (const functionPath of missing) console.error(`- ${functionPath}`);
  process.exit(1);
}

console.log('All vercel.json function targets exist.');
