// Shared security helpers. See CLAUDE.md security section for background.
//
// Primitives:
//   isProduction()          — true iff VERCEL_ENV === 'production'
//   requireNonProduction()  — gate local-only endpoints (dashboard, simulate, etc.)
//   getClientIP()           — returns cf-connecting-ip only in production
//   requireCloudflare()     — rejects requests that bypass Cloudflare
//
// Background: the previous `req.headers.host.startsWith('localhost')` guard
// was spoofable — Host is a client header and Vercel routes by SNI, so a
// forged `Host: localhost.attacker.com` still reached production functions.
// VERCEL_ENV is set server-side by Vercel and is unspoofable.

import { timingSafeEqual } from 'crypto';

export function isProduction() {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * Local-only endpoint guard. Returns false and sends 404 in production.
 * Use at the top of any handler that should only be reachable under
 * `vercel dev` (dashboards, analytics, simulate, etc.).
 *
 *   if (!requireNonProduction(res)) return;
 */
export function requireNonProduction(res) {
  if (isProduction()) {
    res.status(404).json({ error: 'Not found' });
    return false;
  }
  return true;
}

/**
 * Returns the client IP for rate limiting / hashing / logging.
 *
 * Production: trusts ONLY `cf-connecting-ip`. This header is set
 *   authoritatively by Cloudflare on every request; any client-supplied
 *   value is overwritten. If the header is absent the request did not
 *   come through Cloudflare — callers should reject it via
 *   requireCloudflare() before reaching this function, but we return
 *   null as a safety default.
 *
 * Dev: falls back to x-real-ip / x-forwarded-for / 'localhost' so
 *   `vercel dev` works as before.
 *
 * The old x-real-ip / x-forwarded-for fallback was unsafe in production:
 * both headers are client-controlled at Vercel's origin, so an attacker
 * reaching .vercel.app directly could spoof them to evade per-IP limits.
 */
export function getClientIP(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return cf;
  if (isProduction()) return null;
  return req.headers['x-real-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || 'localhost';
}

// Timing-safe string compare. Pads both buffers to equal length before
// comparison so the early length-check doesn't leak secret length.
export function safeEq(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  const len = Math.max(bufA.length, bufB.length);
  const padA = Buffer.alloc(len); bufA.copy(padA);
  const padB = Buffer.alloc(len); bufB.copy(padB);
  // Run timingSafeEqual unconditionally — short-circuiting on length
  // would leak whether the secret length matches (CLAUDE.md invariant).
  const match = timingSafeEqual(padA, padB);
  return match && bufA.length === bufB.length;
}

// Log the "shared-secret flag off" warning once per cold container so
// we notice the gap in Vercel logs without spamming every request.
let _warnedSecretMissing = false;

/**
 * Reject requests that didn't come through Cloudflare.
 *
 * Two layered checks in production:
 *
 *   1. `cf-connecting-ip` presence. Baseline signal that the request
 *      at least claims to be from Cloudflare. Easily spoofable alone
 *      (any attacker hitting .vercel.app directly can set this header),
 *      so it is necessary but not sufficient.
 *
 *   2. `x-origin-secret` equality with `process.env.ORIGIN_SHARED_SECRET`.
 *      The secret is injected by a Cloudflare Transform Rule on the
 *      forgotteneth.com zone — it's added to every request CF proxies
 *      to Vercel, but never leaves CF's infrastructure. An attacker
 *      hitting .vercel.app directly has no way to obtain the value.
 *      THIS is the check that actually locks the origin.
 *
 * Fail-closed: `ORIGIN_SHARED_SECRET` must be set in production. A bare
 * `cf-connecting-ip` check is only a hint, not a security boundary:
 * direct `.vercel.app` callers can spoof it. Shipping without the secret
 * would leave the origin bypassable, so misconfiguration returns 503.
 *
 * Dev: always allows (isProduction() === false).
 *
 *   if (!requireCloudflare(req, res)) return;
 */
export function requireCloudflare(req, res) {
  if (!isProduction()) return true;

  // Baseline: must claim to be from CF.
  if (!req.headers['cf-connecting-ip']) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(403).json({ error: 'Direct origin access not permitted' });
    return false;
  }

  // Strong: shared secret injected by CF Transform Rule.
  const expected = process.env.ORIGIN_SHARED_SECRET;
  if (!expected) {
    if (!_warnedSecretMissing) {
      _warnedSecretMissing = true;
      console.error('requireCloudflare: ORIGIN_SHARED_SECRET unset in production — failing closed');
    }
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(503).json({ error: 'Origin lock not configured' });
    return false;
  }

  const provided = req.headers['x-origin-secret'];
  if (!safeEq(provided, expected)) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(403).json({ error: 'Direct origin access not permitted' });
    return false;
  }

  return true;
}
