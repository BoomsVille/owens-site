# Zoho Enquiry Wire-Up

This project sends contact submissions directly through Zoho Mail API using OAuth refresh-token flow (not SMTP).
For Cloudflare Pages static deploys (`output: "export"`), the live endpoint is:

- `functions/api/enquiry.ts` (Cloudflare Pages Function at `/api/enquiry`)

## 1) Environment variables

Copy `.env.example` to `.env.local` and set:

- `ZOHO_ACCOUNT_ID`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_API_BASE_URL` (optional, default `https://mail.zoho.eu`)
- `ZOHO_ACCOUNTS_BASE_URL` (optional, default `https://accounts.zoho.eu`)
- `ENQUIRY_TO_EMAIL` (optional fallback default is `owen@freelancedesign.co.uk`)
- `ENQUIRY_FROM_ADDRESS` (optional fallback uses `ENQUIRY_TO_EMAIL`)

## 2) Data flow

- UI forms post to `POST /api/enquiry`.
- Cloudflare Function validates and sanitizes fields.
- Route exchanges refresh token for an access token:
  - `POST {ZOHO_ACCOUNTS_BASE_URL}/oauth/v2/token`
- Route sends message through Zoho Mail API:
  - `POST {ZOHO_API_BASE_URL}/api/accounts/{ZOHO_ACCOUNT_ID}/messages`
  - `Authorization: Zoho-oauthtoken <access_token>`
- If Zoho is not configured/rejects, UI falls back to `mailto:` so enquiries are still deliverable.

## 3) Payload sent to Zoho Mail API

```json
{
  "fromAddress": "hello@yourdomain.com",
  "toAddress": "you@yourdomain.com",
  "replyTo": "lead@client.com",
  "subject": "New Web Development enquiry",
  "content": "Name: Jane Doe\nEmail: lead@client.com\n..."
}
```

## 4) Files

- `functions/api/enquiry.ts` (Cloudflare Pages runtime)
- `lib/enquiryPayload.ts`
- `components/EnquiryModalButton.tsx`
- `components/DesktopExperience.tsx`
