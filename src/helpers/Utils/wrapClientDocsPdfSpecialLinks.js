import { getClientDocsPdfRedirectLink } from './getClientDocsPdfRedirectLink';

/**
 * Bee's `specialLinks` can come from multiple sources (gallery + landing page items).
 * To ensure PDFs are always wrapped, we post-process the entire list.
 */
export function wrapClientDocsPdfSpecialLinks(specialLinks, sitePrefix) {
  if (!Array.isArray(specialLinks)) return specialLinks;

  return specialLinks.map((item) => {
    if (!item || typeof item !== 'object') return item;

    const originalLink = item.link;
    const fileName = item.label;

    const wrappedLink = getClientDocsPdfRedirectLink(originalLink, sitePrefix, fileName);
    if (wrappedLink && wrappedLink !== originalLink) {
      return { ...item, link: wrappedLink };
    }

    return item;
  });
}

