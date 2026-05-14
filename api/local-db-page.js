import { readFileSync } from 'fs';
import { join } from 'path';
import { requireNonProduction } from './_security.js';

export default function handler(req, res) {
  if (!requireNonProduction(res)) return;

  if (req.query.js !== undefined) {
    const js = readFileSync(join(process.cwd(), 'operator', 'local-db.js'), 'utf8');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(js);
  }

  const html = readFileSync(join(process.cwd(), 'operator', 'local-db.html'), 'utf8')
    .replace('src="/local-db.js"', 'src="/api/local-db-page?js=1"');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).send(html);
}
