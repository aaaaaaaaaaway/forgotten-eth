# Forgotten ETH Public Mirror Guardrails

This repository is the public/output-shaped mirror for Forgotten ETH. Keep it clean and publication-focused.

## Non-negotiable rules

1. Do not push or publish unless the user explicitly asks in the current message.
2. Do not copy private source-workspace internals into this repo. Public artifacts only.
3. Never add secrets, API keys, webhook code, monitoring endpoints, dashboard internals, local DB tooling, or paid-API scripts.
4. If syncing from `/home/syf/claude/forgotteneth`, copy only intended public files and verify `git status --short` before commit/push.
5. Keep public report language clear: no stale/internal metrics, no confusing verification counters, and no unrelated workspace files.

## Intended public artifact shape

Typical public files may include:
- root `README.md`
- static app/public data that is already intended for public release
- canonical public report markdown
- intentionally public PoC/evidence folders
- `docs/templates/banteg-forensic-report.md`

## Report style

For security/recovery reports, use the banteg-style forensic structure:
- exact scope/entities
- bounded claims
- layered evidence
- negative results/falsifiers
- operator detection/triage
- concrete remediation or next actions
- concise conclusion and references

Avoid oversized marketing framing, stale internal replay/coverage metrics, and unsupported claims.
