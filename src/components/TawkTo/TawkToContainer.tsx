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

  const onTawkToLoaded = () => {
    console.log(isRTL)
  }

  useEffect(() => {
    const affectedPages = ['campaigns/editor', 'editor/landingpages', 'popupeditor'];
    const pathname = location.pathname.toLowerCase();
    const isAffectedPage = affectedPages.some(page => pathname.includes(page));

    const positionWidgets = (attempts = 0) => {
      const maxAttempts = 3;
      
      const node: any = document.querySelector('[title="chat widget"]');
      if (node && node?.style) {
        if (isAffectedPage) {
          node.style.setProperty('bottom', '75px', 'important');
        } else {
          node.style.setProperty('bottom', '15px', 'important');
        }
      }

      // INDmenu-btn positioning
      const indMenuBtn: any = document.getElementById('INDmenu-btn');
      if (indMenuBtn && indMenuBtn?.style) {
        if (isAffectedPage) {
          indMenuBtn.style.setProperty('bottom', '42px', 'important');
        } else {
          indMenuBtn.style.setProperty('bottom', '-10px', 'important');
        }
      }

      if ((!node || !indMenuBtn) && attempts < maxAttempts) {
        setTimeout(() => positionWidgets(attempts + 1), 500);
      }
    };

    positionWidgets();

    const timer = setTimeout(() => positionWidgets(), 300);

    return () => clearTimeout(timer);
  }, [location]);

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