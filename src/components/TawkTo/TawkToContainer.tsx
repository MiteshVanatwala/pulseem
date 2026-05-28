import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// @ts-ignore
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { tawkToPropertyId } from '../../config';
import { useLocation } from 'react-router-dom';

const STYLE_TAG_ID = 'tawk-position-override';

const TawkToContainer = ({ itemId }: any) => {
  const { accountSettings } = useSelector((state: any) => state.common);
  const { isRTL } = useSelector((state: any) => state.core);
  const tawkMessengerRef: any = useRef();
  const location = useLocation();

  const onTawkToLoaded = () => {}

  useEffect(() => {
    const affectedPages = ['campaigns/editor', 'editor/landingpages', 'popupeditor', 'whatsapp/chat'];
    const pathname = location.pathname.toLowerCase();
    const isAffectedPage = affectedPages.some(page => pathname.includes(page));
    const bottom = isAffectedPage ? '85px' : '10px';

    const injectCSSFallback = () => {
      const existing = document.getElementById(STYLE_TAG_ID);
      if (existing) existing.remove();
      const style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      style.textContent = `
        @keyframes tawk-glow-pulse {
          0%   { box-shadow: 0 0 0 2px white, 0 0 0 0    rgba(255, 23, 68, 0.4); }
          70%  { box-shadow: 0 0 0 2px white, 0 0 0 10px rgba(255, 23, 68, 0);   }
          100% { box-shadow: 0 0 0 2px white, 0 0 0 0    rgba(255, 23, 68, 0);   }
        }
      `;
      document.head.appendChild(style);
    };

    const getSidebarWidth = (): number => {
      const sidebarPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement | null;
      return sidebarPaper ? sidebarPaper.getBoundingClientRect().width : 70;
    };

    const applyIframeStyles = (iframe: HTMLIFrameElement) => {
      if (isRTL) {
        const sidebarWidth = getSidebarWidth();
        iframe.style.setProperty('bottom', bottom, 'important');
        iframe.style.setProperty('right', `${sidebarWidth + 5}px`, 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('transform', 'scale(0.89)', 'important');
        iframe.style.setProperty('transform-origin', 'bottom right', 'important');
        iframe.style.setProperty('border-radius', '50%', 'important');
        iframe.style.setProperty('animation', 'tawk-glow-pulse 2s infinite', 'important');

        const parent = iframe.parentElement as HTMLElement | null;
        if (parent) {
          parent.style.setProperty('overflow', 'visible', 'important');
        }
      } else {
        // LTR: restore Tawk.to's default position and remove all RTL-only styles
        iframe.style.setProperty('right', '20px', 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.removeProperty('transform');
        iframe.style.removeProperty('transform-origin');
        iframe.style.removeProperty('border-radius');
        iframe.style.removeProperty('animation');

        const parent = iframe.parentElement as HTMLElement | null;
        if (parent) {
          parent.style.removeProperty('overflow');
        }
      }
    };

    let compactRef: HTMLIFrameElement | null = null;

    const findCompact = (): HTMLIFrameElement | null => {
      const iframes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];
      return iframes.find(f =>
        (f.src === 'about:blank' || f.src === '') &&
        (f.title || '') === '' &&
        f.id !== '' &&
        !f.id.toLowerCase().includes('ind') &&
        parseInt(window.getComputedStyle(f).width || '999') <= 100
      ) || null;
    };

    const applyAll = () => {
      if (!compactRef) compactRef = findCompact();
      if (compactRef) applyIframeStyles(compactRef);

      const indMenuBtn = document.getElementById('INDmenu-btn') as HTMLElement;
      if (indMenuBtn?.style) {
        indMenuBtn.style.setProperty('bottom', isAffectedPage ? '55px' : '-10px', 'important');
      }
    };

    injectCSSFallback();
    applyAll();

    // RAF loop for first 5 seconds to beat Tawk.to's init-time style resets
    let rafId: number | null = null;
    const rafLoop = () => {
      if (compactRef) {
        applyIframeStyles(compactRef);
      } else {
        compactRef = findCompact();
      }
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);
    const stopRaf = setTimeout(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    }, 5000);

    // MutationObserver for new iframes injected after 5 seconds
    const observer = new MutationObserver(() => {
      compactRef = findCompact();
      if (compactRef) applyIframeStyles(compactRef);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ResizeObserver on sidebar paper — tracks sidebar width as it opens/closes
    let sidebarObserver: ResizeObserver | null = null;
    if (isRTL) {
      const sidebarPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement | null;
      if (sidebarPaper) {
        sidebarObserver = new ResizeObserver(() => {
          if (compactRef) applyIframeStyles(compactRef);
        });
        sidebarObserver.observe(sidebarPaper);
      }
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(stopRaf);
      observer.disconnect();
      sidebarObserver?.disconnect();
    };
  }, [location, isRTL]);

  return (accountSettings?.Account?.ReferrerID === 0) ?
    <>
      <TawkMessengerReact
        onLoad={onTawkToLoaded}
        propertyId={tawkToPropertyId}
        widgetId="default"
        ref={tawkMessengerRef} />
    </>
    : (<></>)
}

export default TawkToContainer;
