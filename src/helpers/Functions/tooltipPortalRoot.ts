let portalRoot: HTMLDivElement | null = null;

const DEFAULT_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
const POLISH_FONT_FAMILY = "'Helvetica', 'Helvetica Neue', Arial, sans-serif";

// A dedicated container appended straight to <html> (not <body>, which carries
// a `zoom` rule at 1024-1440px viewports that breaks fixed-position children),
// given its own explicit stacking context with a maximal z-index so anything
// portaled into it always renders above the rest of the page.
export const getTooltipPortalRoot = (): HTMLDivElement => {
  if (!portalRoot || !document.documentElement.contains(portalRoot)) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'app-tooltip-portal-root';
    portalRoot.style.position = 'fixed';
    portalRoot.style.top = '0';
    portalRoot.style.left = '0';
    portalRoot.style.width = '0';
    portalRoot.style.height = '0';
    portalRoot.style.zIndex = '2147483647';
    document.documentElement.appendChild(portalRoot);
  }

  // Sitting outside <body> means this container won't inherit body's font-family
  // (src/index.css), including the Polish-account override, so both must be
  // applied explicitly here, re-checked on every fetch to stay in sync.
  portalRoot.style.fontFamily = document.body.classList.contains('polish-account')
    ? POLISH_FONT_FAMILY
    : DEFAULT_FONT_FAMILY;

  return portalRoot;
};
