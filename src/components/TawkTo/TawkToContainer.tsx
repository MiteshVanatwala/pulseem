import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// @ts-ignore
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { tawkToPropertyId } from '../../config';
import { useLocation } from 'react-router-dom';

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

    const getSidebarWidth = (): number => {
      const sidebarPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement | null;
      return sidebarPaper ? sidebarPaper.getBoundingClientRect().width : 70;
    };

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
        const sidebarWidth = getSidebarWidth();
        iframe.style.setProperty('bottom', bottom, 'important');
        // Slide the bubble left of the sidebar edge as sidebar opens/closes
        iframe.style.setProperty('right', `${sidebarWidth + 5}px`, 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('transform', 'scale(0.82)', 'important');
        iframe.style.setProperty('transform-origin', 'bottom right', 'important');
      } else {
        // LTR: restore Tawk.to's default position
        iframe.style.setProperty('right', '20px', 'important');
        iframe.style.setProperty('left', 'auto', 'important');
        iframe.style.setProperty('bottom', bottom, 'important');
        iframe.style.removeProperty('transform');
        iframe.style.removeProperty('transform-origin');
      }
    };

    let iframeRef: HTMLIFrameElement | null = null;

    const applyAll = () => {
      if (!iframeRef) iframeRef = findTawkBubbleIframe();
      if (iframeRef) applyIframeStyles(iframeRef);

      // INDmenu-btn (accessibility widget) vertical positioning
      const indMenuBtn = document.getElementById('INDmenu-btn') as HTMLElement;
      if (indMenuBtn?.style) {
        indMenuBtn.style.setProperty('bottom', isAffectedPage ? '55px' : '-10px', 'important');
      }
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

    // ResizeObserver on sidebar paper — re-positions bubble as sidebar opens/closes
    let sidebarObserver: ResizeObserver | null = null;
    if (isRTL) {
      const sidebarPaper = document.querySelector('.MuiDrawer-paper') as HTMLElement | null;
      if (sidebarPaper) {
        sidebarObserver = new ResizeObserver(() => {
          if (iframeRef) applyIframeStyles(iframeRef);
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
