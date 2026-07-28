# WhatsApp Release Checklist

Do not set `PUBLIC_WHATSAPP_READY=true` until every item below has evidence attached to the deployment record.

| Check | Evidence required | Status / reference |
| --- | --- | --- |
| Provider | Approved provider account and production configuration | Pending |
| Consent | Applicable consent flow and legal approval | Pending |
| Templates | Required message templates approved by the provider | Pending |
| Production flow | Successful end-to-end production-like send and reply test | Pending |
| Readiness | Owner, monitoring, incident response, and rollback confirmed | Pending |

## Release record

- Deployment: Pending
- Reviewer: Pending
- Date: Pending
- Decision: WhatsApp remains disabled until all checks pass.

## Pre-launch manual verification (task 5.2)

Real verification performed against a running instance (`npm run dev`, `http://localhost:4321`) with no `.env` configured (matches the pre-launch/unconfigured state) and via source/build inspection where a live browser was not available in this environment. Date: 2026-07-27.

| Area | Method | Result |
| --- | --- | --- |
| WhatsApp off | `curl http://localhost:4321/` + grep rendered HTML for `whatsapp` (case-insensitive) | No match. `PUBLIC_WHATSAPP_READY` unset defaults to `false` in `src/lib/env.ts` (`source.PUBLIC_WHATSAPP_READY === 'true'`); `src/content/demo.ts` gates the WhatsApp variant behind that flag. Confirmed off by default. |
| No pricing / no `$`/USD/ARS copy | grep rendered `/` HTML | No match. |
| No secrets in rendered HTML | grep rendered `/` HTML for `RESEND_API_KEY`, `LEAD_RECIPIENTS`, `LEAD_EMAIL_FROM`, `re_...` key pattern | No match. |
| SEO files | `curl -i http://localhost:4321/`, `/robots.txt`, `/sitemap-index.xml` | All `200`. `<html lang="es-AR">`, unique `<title>`/`<meta name="description">`, `rel="canonical"`, Open Graph + Twitter card, `application/ld+json` with `Organization`/`WebSite` all present. `robots.txt` allows crawling and points to the sitemap; `sitemap-index.xml` lists only the public `/` URL (no auth/form routes indexed). |
| Synthetic media privacy | `Read` on `public/demos/clinician-workflow-v1.svg` and `public/brand/logo.png` | Demo SVG is hand-authored vector shapes/text only (no photos, no PII, no real screenshots). Logo is the approved brand mark. Neither contains patient data. |
| Lead delivery states | `curl -X POST http://localhost:4321/api/leads` with invalid, honeypot-filled, valid, and repeated-valid payloads | `400` with `{code:"invalid", fields:[...]}` for empty/invalid fields; `400` with `fields:["website"]` for a filled honeypot; `503` with `{code:"unavailable"}` for a valid lead when mail is unconfigured (safe failure, no false success); `429` with `retry-after` once the in-memory rate limit (5/min/IP) is exceeded. |
| Responsive layout | Source review of `src/styles/global.css` (`@media (max-width: 42rem)` stacks `.site-header` and `.demo-workflow` to a single column) | Breakpoint present and applies to header/demo grid. **Not exercised in a real browser/viewport** — no browser automation tool was available in this environment. |
| Keyboard focus visibility | Source review of `src/styles/global.css` and `LeadForm.astro`/`Header.astro` markup | `a:focus-visible` has an explicit outline; form `<input>`/`<button>` elements carry no custom styling and are not focus-suppressed (no `outline: none` reset anywhere in the stylesheet), so they keep the browser's native visible focus ring. **Not exercised with real keyboard-only navigation in a browser** — same tooling limitation as above. |

### Gap found and fixed during this verification

Manual `curl` testing of `/api/leads` uncovered a real defect not caught by the existing unit tests: `POST` built the default Resend delivery adapter eagerly (`delivery: createDefaultDelivery()`), before validation ran. With no mail configuration present (the actual pre-launch state), the adapter constructor threw immediately, so **every** request — including invalid ones that should return `400` — was swallowed by the outer handler and returned `503 unavailable`. Fixed by making `createDefaultDelivery()` build the concrete adapter lazily inside `deliver()`, so validation and rate-limiting still run first; delivery-configuration failures now only surface as `503` for otherwise-valid submissions, per the design's data-flow contract. Covered by a new RED→GREEN test in `src/pages/api/leads.test.ts` ("validates before touching the delivery provider, even when mail is unconfigured"); full suite (33/33) still green after the fix.

**Outstanding**: responsive layout and keyboard-only navigation still need a human pass in a real browser/device before production release — this environment has no browser automation tooling to exercise them interactively.
