const DEFAULT_SITE_URL = 'http://127.0.0.1:3006';

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function canonicalUrl(pathname = '/') {
  return new URL(pathname, getSiteUrl()).toString();
}

export function summarizeDescription(text: string, max = 160) {
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}
