import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// @ts-ignore
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { tawkToPropertyId } from '../../config';
import { useLocation } from 'react-router-dom';

const TawkToContainer = ({ itemId }: any) => {
  const { accountSettings } = useSelector((state: any) => state.common);
  const { isRTL, isDrawerOpen } = useSelector((state: any) => state.core);
  const tawkMessengerRef: any = useRef();
  const location = useLocation();

  const onTawkToLoaded = () => {}

  useEffect(() => {
    const affectedPages = ['campaigns/editor', 'editor/landingpages', 'popupeditor', 'whatsapp/chat'];
    const pathname = location.pathname.toLowerCase();
    const isAffectedPage = affectedPages.some(page => pathname.includes(page));
    const bottom = isAffectedPage ? '85px' : '10px';
    const sidebarWidthOffset = isDrawerOpen ? 75 : 249;

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
        iframe.style.setProperty('bottom', bottom, 'important');
        // Slide the bubble left of the sidebar edge as sidebar opens/closes
        iframe.style.setProperty('right', `${sidebarWidthOffset + 5}px`, 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('transform', 'scale(0.82)', 'important');
        iframe.style.setProperty('transform-origin', 'bottom right', 'important');
        iframe.style.setProperty('transition', 'right 0.3s ease', 'important');
      } else {
        // LTR: restore Tawk.to's default position
        iframe.style.setProperty('right', '20px', 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('bottom', bottom, 'important');
        iframe.style.removeProperty('transform');
        iframe.style.removeProperty('transform-origin');
        iframe.style.removeProperty('transition');
      }
    };

    let iframeRef: HTMLIFrameElement | null = null;

    const applyIndMenuStyles = () => {
      const indMenuBtn = document.getElementById('INDmenu-btn') as HTMLElement;
      if (!indMenuBtn?.style) return;
      
      indMenuBtn.style.setProperty('bottom', isAffectedPage ? '55px' : '-10px', 'important');
      
      if (!isRTL) {
        indMenuBtn.style.setProperty('left', `${sidebarWidthOffset + 5}px`, 'important');
        indMenuBtn.style.setProperty('transition', 'left 0.3s ease', 'important');
      } else {
        indMenuBtn.style.removeProperty('left');
        indMenuBtn.style.removeProperty('transition');
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
  }, [location, isRTL, isDrawerOpen]);

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
