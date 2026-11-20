# Homemade MailMerger · Outbound Sniper Studio

[![CI](https://github.com/Octet2Bis/Homemade-MailMerger/actions/workflows/ci.yml/badge.svg)](https://github.com/Octet2Bis/Homemade-MailMerger/actions/workflows/ci.yml)

**A local studio for small, careful B2B outreach campaigns.** Import a CSV, prove each address exists, send from your own Google account at a human pace, and track clicks without a tracking pixel.
No mass mailing: a daily quota, working hours, and a random delay between two sends.

Node.js 20+, **zero dependencies**, runs on `127.0.0.1` only.

> **Status: v2.0.0, pre-production.** The whole send path is tested against simulated servers. No real campaign has been sent end to end with a Google account yet.

## The QA story

Version 1 had green quality gates (137/137 and 5/5) and still shipped **7 critical defects**. An audit run on a throwaway copy proved each one in execution ([`AUDIT.md`](AUDIT.md)):

| # | Defect in v1 | Now |
|---|---|---|
| P0-1 | A "live" send without credentials returned `success: true`: contacts marked sent, no email left | Fails loudly; nothing ever simulates a success |
| P0-2 | Dry runs consumed the real daily quota | Simulation never touches the quota |
| P0-3 | The SMTP probe never ran, so every domain with an MX came out `VERIFIED` | Real `RCPT TO` probe with catch-all detection; `VERIFIED` only on proof |
| P0-4 | Import filled missing names with "Contact", so emails went out as "Hello Contact," | Missing variable blocks the launch |
| P0-5 | Gmail secrets readable by any web page open in the browser (CORS `*`, all interfaces) | Localhost only, no secret ever sent to the browser |
| P0-6 | Cross-site config change (CSRF): daily limit pushed to 500 from another origin | Host, Origin and Content-Type guard |
| P0-7 | XSS through CSV content | Every CSV or server string escaped |

Each defect now has a regression test named after it (`P0-1`, `P0-5`…), so it cannot come back silently.

## What it does

| Step | How |
|---|---|
| Import | Robust CSV parser (quotes, `;` `,` tab, BOM); never invents a value |
| Verify | Syntax → typo → disposable → MX → SMTP probe (`RCPT TO` then `QUIT`, no message sent) → optional Hunter.io |
| Find | Email pattern resolver (firstname.lastname…), kept only when proven |
| Check before send | Replayed by the server at launch: opt-out sentence, missing variables, secrets in the body, local tracking URL, SPF / DKIM / DMARC, links, SpamAssassin score |
| Send | Gmail API (OAuth2), text + HTML MIME, `List-Unsubscribe`; quota, working hours, random delay, circuit breaker on fatal Gmail errors |
| Track | Clicks only, through HMAC-signed links and a small public gateway (no open-redirect). Opens are not measured: image proxies make them unreliable and pixels hurt deliverability |

Address statuses and what gets sent are explained in [`docs/README.fr.md`](docs/README.fr.md) (French).

## Run it

```bash
node server.js            # or npm start → http://localhost:3500
npm test                  # 26 regression tests, no external network call
```

Connecting the Google account (Gmail API, OAuth consent screen, redirect URI) is described step by step in [`docs/README.fr.md`](docs/README.fr.md).

## Tests & quality

| Check | What it proves | Where |
|---|---|---|
| 26 regression tests | Verifier statuses, CSV import, MIME, preflight, quota, signed clicks, API guard (no secret, no CORS, cross-site write refused), path traversal | `npm test`, CI on Node 20 and 22 |
| Fake SMTP server | The probe reads 5.1.x as "mailbox does not exist" but an IP block (5.7.x) as `UNVERIFIED` | [`tests/helpers.js`](tests/helpers.js) |
| File size rule | No JavaScript file over 250 lines | `node scripts/check-lines.mjs` |
| Product gates | Brief → PRD → design contract before code | [`BRIEF.md`](BRIEF.md), [`PRD.md`](PRD.md), [`DESIGN_CONTRACT.md`](DESIGN_CONTRACT.md) |
| Decisions | Why it is built this way, and what it will not do | [`DECISIONS.md`](DECISIONS.md) |

Known limits (bounces are not detected yet, the send queue lives in memory) are listed in [`STATE.md`](STATE.md).

## Structure

```
server.js     HTTP orchestrator: security guard, routing, clicks, static files
api/          Routes: campaigns, contacts, Google, Hunter, audits, delivery, stats
engine/       Business logic without DOM: store, OAuth, dispatch, verifier, composer, tracking, preflight
gateway/      Public click gateway (small VM behind HTTPS)
public/       Interface (vanilla JS, 5 tabs)
data/         Versioned reference data; local state (config, tokens, contacts, clicks) is git-ignored
tests/        Regression tests
```

Built by Antoine Lecerf, with Claude Code.
