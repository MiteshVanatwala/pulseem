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
    if (tawkMessengerRef.current.onBeforeLoaded()) {
      tawkMessengerRef?.current?.hideWidget();
      tawkMessengerRef?.current?.showWidget();
    }
  }

  useEffect(() => {
    tawkMessengerRef.current.onBeforeLoaded();
  }, [location]);


  const style = {
    visibility: {
      desktop: {
        xOffset: '15',
        yOffset: location.pathname.toLowerCase().indexOf('edit') > -1 ? '75' : '15',
        position: 'br'
      },
      mobile: {
        xOffset: 15,
        yOffset: 15,
        position: 'br'
      }
    }
  };



  // return (process.env.REACT_APP_MODE === "PROD" && (accountSettings?.Account?.ReferrerID === 0 || !accountSettings?.Account?.ReferrerID)) ?
  return (accountSettings?.Account?.ReferrerID === 0 || !accountSettings?.Account?.ReferrerID) ?
    <>
      <TawkMessengerReact
        onLoad={onTawkToLoaded}
        propertyId={tawkToPropertyId}
        widgetId="default"
        customStyle={style}
        ref={tawkMessengerRef} />
    </>
    : (<></>)
}

export default TawkToContainer;