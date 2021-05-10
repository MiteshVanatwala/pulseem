export const openInNewTab=(url) => {
  const newWindow=window.open(url,'_blank','noopener,noreferrer')
  if(newWindow) newWindow.opener=null
}

export const pulseemNewTab=(path) => {
  const newWindow=window.open(`https://www.pulseemdev.co.il/Pulseem/${path}`,'_blank','noopener,noreferrer')
  if(newWindow) newWindow.opener=null
}

export const setCookie=(name,value,options={}) => {
  options={
    path: '/',
    samesite: 'strict',
    ...options
  };
  if(options.expires&&options.expires.toUTCString) {
    options.expires=options.expires.toUTCString();
  }
  let updatedCookie=encodeURIComponent(name)+"="+encodeURIComponent(value);
  for(let optionKey in options) {
    updatedCookie+="; "+optionKey;
    let optionValue=options[optionKey];
    if(optionValue!==true) {
      updatedCookie+="="+optionValue;
    }
  }
  document.cookie=updatedCookie;
  return value;
}

export const getCookie=(name) => {
  let matches=document.cookie.match(new RegExp(
    "(?:^|; )"+name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1')+"=([^;]*)"
  ));
  return matches? decodeURIComponent(matches[1]):undefined;
}