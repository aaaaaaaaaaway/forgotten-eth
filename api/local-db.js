import { execFile } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { requireNonProduction } from './_security.js';

const execFileAsync = promisify(execFile);

function cleanEnum(value, allowed, fallback = 'all') {
  const text = typeof value === 'string' ? value : fallback;
  return allowed.includes(text) ? text : fallback;
}

function cleanBoolish(value) {
  return cleanEnum(value, ['all', '1', '0', 'true', 'false'], 'all');
}

function cleanAddress(value) {
  if (typeof value !== 'string') return '';
  const text = value.toLowerCase();
  return /^0x[0-9a-f]{40}$/.test(text) ? text : '';
}

function cleanSearch(value) {
  if (typeof value !== 'string') return '';
  return value.slice(0, 80);
}

async function runLocalDb(args) {
  const script = join(process.cwd(), 'data', 'local_db_api.py');
  const { stdout } = await execFileAsync('python3', [script, ...args], {
    cwd: process.cwd(),
    maxBuffer: 25 * 1024 * 1024,
    timeout: 30000,
  });
  return JSON.parse(stdout);
}

export default async function handler(req, res) {
  if (!requireNonProduction(res)) return;
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'GET/POST only' });

  try {
    const view = cleanEnum(req.query.view, ['summary', 'candidates', 'contract', 'set-candidate'], 'summary');
    let data;
    if (view === 'summary') {
      data = await runLocalDb(['summary']);
    } else if (view === 'contract') {
      const address = cleanAddress(req.query.address);
      if (!address) return res.status(400).json({ error: 'invalid address' });
      data = await runLocalDb(['contract', address]);
    } else if (view === 'set-candidate') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
      const address = cleanAddress(req.query.address);
      const status = cleanEnum(req.query.status, ['not_reviewed', 'not_candidate', 'candidate'], '');
      const value = cleanEnum(req.query.value, ['0', '1', 'true', 'false'], '0');
      if (!address) return res.status(400).json({ error: 'invalid address' });
      data = await runLocalDb([
        'set-candidate',
        address,
        ...(status ? ['--status', status] : ['--value', value]),
      ]);
    } else {
      const limit = Math.max(1, Math.min(parseInt(req.query.limit || '50', 10) || 50, 200));
      const offset = Math.max(0, parseInt(req.query.offset || '0', 10) || 0);
      data = await runLocalDb([
        'candidates',
        '--priority', cleanEnum(req.query.priority, ['all', 'critical', 'high', 'review', 'low', 'suppressed'], 'all'),
        '--source-status', cleanEnum(req.query.source_status, ['all', 'verified', 'unverified', 'error', 'missing'], 'all'),
        '--user-path', cleanBoolish(req.query.user_path),
        '--accounting', cleanBoolish(req.query.accounting),
        '--integrated', cleanBoolish(req.query.integrated),
        '--candidate', cleanEnum(req.query.candidate, ['all', 'not_reviewed', 'not_candidate', 'candidate'], 'all'),
        '--search', cleanSearch(req.query.search),
        '--sort', cleanEnum(req.query.sort, ['priority', 'score', 'value', 'updated', 'eth', 'weth', 'usdc', 'usdt', 'dai', 'wbtc'], 'priority'),
        '--dir', cleanEnum(req.query.dir, ['asc', 'desc'], 'desc'),
        '--limit', String(limit),
        '--offset', String(offset),
        ...(req.query.include_excluded === '1' ? ['--include-name-excluded'] : []),
      ]);
    }
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json(data);
  } catch (e) {
    console.error('local-db failed:', e.message);
    return res.status(500).json({ error: 'local db unavailable' });
  }
}
