const FALLBACK_SITE_ORIGIN = "http://localhost:3000";

export function getSiteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_ORIGIN;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_SITE_ORIGIN;
  }
}

export function getMetadataBase() {
  return new URL(getSiteOrigin());
}
