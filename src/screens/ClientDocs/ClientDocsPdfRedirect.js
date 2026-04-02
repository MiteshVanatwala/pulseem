import React from 'react';
import { useLocation } from 'react-router-dom';

const isProbablySafeUrl = (url) => {
  // Basic allowlist to reduce risk of open redirect to javascript: or data:
  const lower = String(url).toLowerCase();
  return lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('/');
};

const ClientDocsPdfRedirect = () => {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const url = params.get('url');
  const safeFinalUrl =
    url && isProbablySafeUrl(url)
      ? String(url).startsWith('/') ? `${window.location.origin}${url}` : url
      : null;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 8 }}>Open the PDF using the button below.</div>
      {safeFinalUrl && (
        <div>
          <button
            type="button"
            onClick={(e) => {
              // Prevent Bee's internal click handler from intercepting this.
              e.preventDefault();
              e.stopPropagation();

              try {
                window.open(safeFinalUrl, '_blank', 'noopener,noreferrer');
              } catch (err) {
                // If popups are blocked, user can use the link below.
              }
            }}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.2)',
              background: '#fff'
            }}
          >
            Open PDF in new tab
          </button>
          <div style={{ marginTop: 8 }}>
            <a
              href={safeFinalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // Defensive: also stop propagation for the anchor.
                e.stopPropagation();
              }}
            >
              Open PDF link
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocsPdfRedirect;

