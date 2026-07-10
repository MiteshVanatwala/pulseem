let portalRoot: HTMLDivElement | null = null;

// A dedicated container appended straight to <html> (not <body>, which carries
// a `zoom` rule at 1024-1440px viewports that breaks fixed-position children),
// given its own explicit stacking context with a maximal z-index so anything
// portaled into it always renders above the rest of the page.
export const getTooltipPortalRoot = (): HTMLDivElement => {
  if (portalRoot && document.documentElement.contains(portalRoot)) return portalRoot;

  portalRoot = document.createElement('div');
  portalRoot.id = 'app-tooltip-portal-root';
  portalRoot.style.position = 'fixed';
  portalRoot.style.top = '0';
  portalRoot.style.left = '0';
  portalRoot.style.width = '0';
  portalRoot.style.height = '0';
  portalRoot.style.zIndex = '2147483647';
  document.documentElement.appendChild(portalRoot);

  return portalRoot;
};
