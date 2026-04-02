/**
 * Bee editor "special links" are opened inside an iframe preview in some cases.
 * For PDFs, we route through an in-app page that performs a top-level navigation,
 * avoiding iframe embedding restrictions.
 */
export function getClientDocsPdfRedirectLink(originalUrl, sitePrefix, fileName) {
  if (!originalUrl) return originalUrl;

  const urlString = String(originalUrl);
  const lower = urlString.toLowerCase();

  const nameLower = fileName ? String(fileName).toLowerCase() : '';

  const isPdf =
    nameLower.endsWith('.pdf') ||
    nameLower.includes('pdf.') ||
    lower.endsWith('.pdf') ||
    lower.includes('.pdf?') ||
    lower.includes('.pdf#') ||
    lower.includes('.pdf&') ||
    // Some systems provide FileURL without the .pdf suffix (e.g. blob/download handlers)
    lower.includes('pdf');

  if (!isPdf) return originalUrl;

  const prefix = sitePrefix ? String(sitePrefix) : '';
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  const wrapperPath = 'clientdocs/view';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (!origin) return originalUrl;

  return `${origin}${normalizedPrefix}${wrapperPath}?url=${encodeURIComponent(urlString)}`;
}

