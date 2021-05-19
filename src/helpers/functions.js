export const openInNewTab=(url) => {
  const newWindow=window.open(url,'_blank','noopener,noreferrer')
  if(newWindow) newWindow.opener=null
}

export const pulseemNewTab=(path) => {
  const newWindow=window.open(`https://www.pulseemdev.co.il/Pulseem/${path}`,'_blank','noopener,noreferrer')
  if(newWindow) newWindow.opener=null
}
