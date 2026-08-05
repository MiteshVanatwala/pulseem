import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// @ts-ignore
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { tawkToPropertyId } from '../../config';
import { useLocation } from 'react-router-dom';

const TawkToContainer = ({ itemId }: any) => {
  const { accountSettings } = useSelector((state: any) => state.common);
  const { isRTL, isDrawerOpen, windowSize } = useSelector((state: any) => state.core);
  const isMobile = windowSize === 'xs' || windowSize === 'sm';
  const tawkMessengerRef: any = useRef();
  const location = useLocation();

  const onTawkToLoaded = () => {}

  useEffect(() => {
    const affectedPages = ['campaigns/editor', 'editor/landingpages', 'popupeditor', 'whatsapp/chat'];
    const pathname = location.pathname.toLowerCase();
    const isAffectedPage = affectedPages.some(page => pathname.includes(page));
    const bottom = isAffectedPage ? '85px' : '10px';
    const sidebarWidthOffset = isDrawerOpen ? 75 : 249;
    // On mobile the sidebar is a full overlay rather than a rail, so widgets on its side
    // (Tawk bubble in RTL, accessibility icon in LTR) hide while it's open instead of sliding with it.
    const hideForMobileDrawer = isMobile && isDrawerOpen;

    // Find the Tawk.to bubble iframe by its actual rendered size.
    // The bubble is a small fixed iframe (≤120px). The chat window is large.
    // This is more reliable than checking src/title/id which varies per environment.
    const findTawkBubbleIframe = (): HTMLIFrameElement | null => {
      const iframes = Array.from(document.querySelectorAll('iframe')) as HTMLIFrameElement[];
      return iframes.find(f => {
        const rect = f.getBoundingClientRect();
        const style = window.getComputedStyle(f);
        return (
          style.position === 'fixed' &&
          rect.width > 0  && rect.width  <= 120 &&
          rect.height > 0 && rect.height <= 120 &&
          !f.id.toLowerCase().includes('ind')   // exclude INDmenu iframe
        );
      }) || null;
    };

    // Apply position to the bubble iframe so it actually moves in the viewport
    const applyIframeStyles = (iframe: HTMLIFrameElement) => {
      if (isRTL) {
        // RTL: Tawk sits on the sidebar's side (right), so on mobile it hides while the drawer is open
        // instead of sliding — the desktop rail-width offset doesn't correspond to the mobile overlay.
        iframe.style.setProperty('bottom', bottom, 'important');
        iframe.style.setProperty('right', isMobile ? '12px' : `${sidebarWidthOffset + 5}px`, 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('transform', 'scale(0.82)', 'important');
        iframe.style.setProperty('transform-origin', 'bottom right', 'important');
        iframe.style.setProperty('transition', 'right 0.3s ease, opacity 0.2s ease', 'important');
        iframe.style.setProperty('opacity', hideForMobileDrawer ? '0' : '1', 'important');
        iframe.style.setProperty('visibility', hideForMobileDrawer ? 'hidden' : 'visible', 'important');
      } else {
        // LTR: Tawk is opposite the sidebar (right, static) — never obstructed, no hide needed.
        iframe.style.setProperty('right', '20px', 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('bottom', bottom, 'important');
        iframe.style.removeProperty('transform');
        iframe.style.removeProperty('transform-origin');
        iframe.style.removeProperty('transition');
        iframe.style.removeProperty('opacity');
        iframe.style.removeProperty('visibility');
      }
    };

    let iframeRef: HTMLIFrameElement | null = null;

    const applyIndMenuStyles = () => {
      const indMenuBtn = document.getElementById('INDmenu-btn') as HTMLElement;
      if (!indMenuBtn?.style) return;

      indMenuBtn.style.setProperty('bottom', isAffectedPage ? '55px' : '-10px', 'important');

      if (!isRTL) {
        // LTR: accessibility icon sits on the sidebar's side (left), so on mobile it hides while the
        // drawer is open instead of sliding — the desktop rail-width offset doesn't apply to the mobile overlay.
        indMenuBtn.style.setProperty('left', isMobile ? '12px' : `${sidebarWidthOffset + 5}px`, 'important');
        indMenuBtn.style.setProperty('transition', 'left 0.3s ease, opacity 0.2s ease', 'important');
        indMenuBtn.style.setProperty('opacity', hideForMobileDrawer ? '0' : '1', 'important');
        indMenuBtn.style.setProperty('visibility', hideForMobileDrawer ? 'hidden' : 'visible', 'important');
      } else {
        // RTL: accessibility icon is opposite the sidebar — never obstructed, keep its own default position.
        indMenuBtn.style.removeProperty('left');
        indMenuBtn.style.removeProperty('transition');
        indMenuBtn.style.removeProperty('opacity');
        indMenuBtn.style.removeProperty('visibility');
      }
    };

    const applyAll = () => {
      if (!iframeRef) iframeRef = findTawkBubbleIframe();
      if (iframeRef) applyIframeStyles(iframeRef);
      applyIndMenuStyles();
    };

    applyAll();

    // RAF loop for first 5 seconds — beats Tawk.to's init-time style resets
    let rafId: number | null = null;
    const rafLoop = () => {
      if (iframeRef) {
        applyIframeStyles(iframeRef);
      } else {
        iframeRef = findTawkBubbleIframe();
      }
      rafId = requestAnimationFrame(rafLoop);
    };
    rafId = requestAnimationFrame(rafLoop);
    const stopRaf = setTimeout(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    }, 5000);

    // MutationObserver — catches the iframe if Tawk.to injects it after 5 seconds
    const observer = new MutationObserver(() => {
      if (!iframeRef) iframeRef = findTawkBubbleIframe();
      if (iframeRef) applyIframeStyles(iframeRef);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(stopRaf);
      observer.disconnect();
    };
  }, [location, isRTL, isDrawerOpen, isMobile]);

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
