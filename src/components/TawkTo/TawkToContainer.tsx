import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// @ts-ignore
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { tawkToPropertyId } from '../../config';
import { useLocation } from 'react-router-dom';

const TawkToContainer = ({ itemId }: any) => {
  const { accountSettings } = useSelector((state: any) => state.common);
  const tawkMessengerRef: any = useRef();
  const location = useLocation();

  const onTawkToLoaded = () => {
    console.log('loaded')
  }

  useEffect(() => {
    const node: any = document.querySelector('[title="chat widget"]');
    const affectedPages = ['campaigns/editor', 'editor/landingpages'];

    if (node && node?.style) {
      if (affectedPages.indexOf(location.pathname.toLowerCase()) > -1) {
        node.style.bottom = '75px';
      }
      else {
        node.style.bottom = '15px';
      }
    }
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