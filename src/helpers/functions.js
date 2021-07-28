import {actionURL} from '../config/index';

export const openInNewTab=(url) => {
  const newWindow=window.open(url,'_blank','noopener,noreferrer')
  if(newWindow) newWindow.opener=null
}

export const pulseemNewTab=(path) => {
  const newWindow=window.open(`${actionURL}${path}`,'_blank','noopener,noreferrer')
  if(newWindow) newWindow.opener=null
}