# Vercel Deployment

The application uses Astro server output with the current `@astrojs/vercel`
serverless adapter. Its package entrypoint replaces the legacy
`@astrojs/vercel/serverless` import path.
Vercel deploys `POST /api/leads` as a serverless function; static pages remain
served as static assets.

## Environment variables

Configure these in Vercel, not in browser-exposed `PUBLIC_*` values:

- `RESEND_API_KEY`: Resend API key.
- `LEAD_EMAIL_FROM`: verified Resend sender, for example `Leads <leads@example.com>`.
- `LEAD_RECIPIENTS`: comma-separated internal recipients.

`PUBLIC_SITE_URL`, `PUBLIC_LOGIN_URL`, and `PUBLIC_WHATSAPP_READY` are the only
public configuration values. Keep `PUBLIC_WHATSAPP_READY=false` until the
WhatsApp release checklist has complete evidence.

## Release checks

1. Verify the sender domain and recipients in Resend.
2. Set the server-only variables in Vercel and deploy.
3. Submit a synthetic lead in the deployed environment and confirm receipt.
4. Never log lead payloads, API keys, sender addresses, or recipient addresses.

On delivery incidents, remove the server-only Resend variables or roll back the
Vercel deployment. The endpoint then returns a safe `503` response.
