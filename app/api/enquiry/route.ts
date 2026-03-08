import { NextRequest, NextResponse } from "next/server";

import { sanitizeEnquiry, validateEnquiry } from "@/lib/enquiryPayload";

const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID;
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_API_BASE_URL = process.env.ZOHO_API_BASE_URL || "https://mail.zoho.eu";
const ZOHO_ACCOUNTS_BASE_URL = process.env.ZOHO_ACCOUNTS_BASE_URL || "https://accounts.zoho.eu";
const ENQUIRY_TO_EMAIL = process.env.ENQUIRY_TO_EMAIL || "owen@freelancedesign.co.uk";
const ENQUIRY_FROM_ADDRESS = process.env.ENQUIRY_FROM_ADDRESS || ENQUIRY_TO_EMAIL;

function renderEnquiryContent(payload: ReturnType<typeof sanitizeEnquiry>) {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.business ? `Business: ${payload.business}` : "",
    payload.budget ? `Budget: ${payload.budget}` : "",
    payload.service ? `Service: ${payload.service}` : "",
    payload.pageUrl ? `Page: ${payload.pageUrl}` : "",
    "",
    "Message:",
    payload.message
  ];

  return lines.filter(Boolean).join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const payload = sanitizeEnquiry(await request.json());
    if (!validateEnquiry(payload)) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    if (!ZOHO_ACCOUNT_ID || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
      return NextResponse.json({ ok: false, error: "zoho_not_configured" }, { status: 503 });
    }

    const tokenBody = new URLSearchParams({
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token"
    });

    const tokenResponse = await fetch(`${ZOHO_ACCOUNTS_BASE_URL}/oauth/v2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
      cache: "no-store"
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ ok: false, error: "zoho_token_error" }, { status: 502 });
    }

    const tokenJson = (await tokenResponse.json()) as { access_token?: string };
    const accessToken = tokenJson.access_token;

    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "zoho_token_missing" }, { status: 502 });
    }

    const subject = payload.service ? `New ${payload.service} enquiry` : "New project enquiry";
    const content = renderEnquiryContent(payload);

    const response = await fetch(`${ZOHO_API_BASE_URL}/api/accounts/${ZOHO_ACCOUNT_ID}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Zoho-oauthtoken ${accessToken}`
      },
      body: JSON.stringify({
        fromAddress: ENQUIRY_FROM_ADDRESS,
        toAddress: ENQUIRY_TO_EMAIL,
        replyTo: payload.email || undefined,
        subject,
        content
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "zoho_mail_send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
