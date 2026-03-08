type Env = {
  ZOHO_ACCOUNT_ID?: string;
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  ZOHO_API_BASE_URL?: string;
  ZOHO_ACCOUNTS_BASE_URL?: string;
  ENQUIRY_TO_EMAIL?: string;
  ENQUIRY_FROM_ADDRESS?: string;
};

type EnquiryBody = {
  name?: string;
  email?: string;
  business?: string;
  budget?: string;
  message?: string;
  service?: string;
  pageUrl?: string;
};

function sanitize(input: EnquiryBody) {
  return {
    name: (input.name ?? "").trim().slice(0, 120),
    email: (input.email ?? "").trim().slice(0, 180),
    business: (input.business ?? "").trim().slice(0, 180),
    budget: (input.budget ?? "").trim().slice(0, 120),
    message: (input.message ?? "").trim().slice(0, 4000),
    service: (input.service ?? "").trim().slice(0, 120),
    pageUrl: (input.pageUrl ?? "").trim().slice(0, 500)
  };
}

function isValid(payload: ReturnType<typeof sanitize>) {
  if (!payload.name || !payload.email || !payload.message) return false;
  if (!payload.email.includes("@")) return false;
  return true;
}

function buildContent(payload: ReturnType<typeof sanitize>) {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const input = (await context.request.json()) as EnquiryBody;
    const payload = sanitize(input);

    if (!isValid(payload)) {
      return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const accountId = context.env.ZOHO_ACCOUNT_ID;
    const clientId = context.env.ZOHO_CLIENT_ID;
    const clientSecret = context.env.ZOHO_CLIENT_SECRET;
    const refreshToken = context.env.ZOHO_REFRESH_TOKEN;
    const apiBaseUrl = context.env.ZOHO_API_BASE_URL || "https://mail.zoho.eu";
    const accountsBaseUrl = context.env.ZOHO_ACCOUNTS_BASE_URL || "https://accounts.zoho.eu";
    const toAddress = context.env.ENQUIRY_TO_EMAIL || "owen@freelancedesign.co.uk";
    const fromAddress = context.env.ENQUIRY_FROM_ADDRESS || toAddress;

    if (!accountId || !clientId || !clientSecret || !refreshToken) {
      return Response.json({ ok: false, error: "zoho_not_configured" }, { status: 503 });
    }

    const tokenBody = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token"
    });

    const tokenRes = await fetch(`${accountsBaseUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString()
    });

    if (!tokenRes.ok) {
      return Response.json({ ok: false, error: "zoho_token_error" }, { status: 502 });
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return Response.json({ ok: false, error: "zoho_token_missing" }, { status: 502 });
    }

    const subject = payload.service ? `New ${payload.service} enquiry` : "New project enquiry";
    const content = buildContent(payload);

    const mailRes = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Zoho-oauthtoken ${tokenJson.access_token}`
      },
      body: JSON.stringify({
        fromAddress,
        toAddress,
        replyTo: payload.email || undefined,
        subject,
        content
      })
    });

    if (!mailRes.ok) {
      return Response.json({ ok: false, error: "zoho_mail_send_failed" }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
};

