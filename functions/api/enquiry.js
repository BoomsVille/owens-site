function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function sanitize(input) {
  const body = input || {};
  return {
    name: String(body.name || "").trim().slice(0, 120),
    email: String(body.email || "").trim().slice(0, 180),
    business: String(body.business || "").trim().slice(0, 180),
    budget: String(body.budget || "").trim().slice(0, 120),
    message: String(body.message || "").trim().slice(0, 4000),
    service: String(body.service || "").trim().slice(0, 120),
    pageUrl: String(body.pageUrl || "").trim().slice(0, 500)
  };
}

function isValid(payload) {
  return Boolean(payload.name && payload.email && payload.message && payload.email.includes("@"));
}

function buildContent(payload) {
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

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  try {
    const debugNoZoho = context.request.headers.get("x-debug-no-zoho") === "1";
    const payload = sanitize(await context.request.json());
    if (!isValid(payload)) return json({ ok: false, error: "invalid_payload" }, 400);

    const accountId = context.env.ZOHO_ACCOUNT_ID;
    const clientId = context.env.ZOHO_CLIENT_ID;
    const clientSecret = context.env.ZOHO_CLIENT_SECRET;
    const refreshToken = context.env.ZOHO_REFRESH_TOKEN;
    const apiBaseUrl = context.env.ZOHO_API_BASE_URL || "https://mail.zoho.eu";
    const accountsBaseUrl = context.env.ZOHO_ACCOUNTS_BASE_URL || "https://accounts.zoho.eu";
    const toAddress = context.env.ENQUIRY_TO_EMAIL || "owen@freelancedesign.co.uk";
    const fromAddress = context.env.ENQUIRY_FROM_ADDRESS || toAddress;

    if (debugNoZoho) {
      return json(
        {
          ok: true,
          debug: true,
          envPresent: {
            ZOHO_ACCOUNT_ID: Boolean(accountId),
            ZOHO_CLIENT_ID: Boolean(clientId),
            ZOHO_CLIENT_SECRET: Boolean(clientSecret),
            ZOHO_REFRESH_TOKEN: Boolean(refreshToken)
          },
          accountsBaseUrl,
          apiBaseUrl,
          toAddressSet: Boolean(toAddress),
          fromAddressSet: Boolean(fromAddress)
        },
        200
      );
    }

    if (!accountId || !clientId || !clientSecret || !refreshToken) {
      return json({ ok: false, error: "zoho_not_configured" }, 503);
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
      return json({ ok: false, error: "zoho_token_error", detail: await tokenRes.text() }, 502);
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson && tokenJson.access_token;
    if (!accessToken) {
      return json({ ok: false, error: "zoho_token_missing", detail: tokenJson && tokenJson.error ? tokenJson.error : "missing_access_token" }, 502);
    }

    const subject = payload.service ? `New ${payload.service} enquiry` : "New project enquiry";
    const content = buildContent(payload);

    const mailRes = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Zoho-oauthtoken ${accessToken}`
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
      return json({ ok: false, error: "zoho_mail_send_failed", detail: await mailRes.text() }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    const message = error && typeof error === "object" && "message" in error ? error.message : "server_error";
    return json({ ok: false, error: "server_error", detail: String(message) }, 500);
  }
}
