import { actionURL } from '../config/index';

export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const pulseemNewTab = (path) => {
  const newWindow = window.open(`${actionURL}${path}`, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const verifyGetUrl = async (url) => {
  return new Promise((resolve, reject) => {
    try {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
          resolve(xmlhttp.status && xmlhttp.status !== 404)
        }
      }
      await xmlhttp.open("HEAD", url, true);
      xmlhttp.send();
    } catch (error) {
      reject(false);
    }
  });
}