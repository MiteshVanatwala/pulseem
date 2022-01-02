import { actionURL } from '../config/index';

export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const pulseemNewTab = (path) => {
  const newWindow = window.open(`${actionURL}${path}`, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const verifyGetUrl = (url) => {
  return new Promise((resolve, reject) => {
    try {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          resolve(true);
        }
      }
      request.open("GET", url);
      request.send(null);
    } catch (error) {
      reject(false);
    }
  });
}