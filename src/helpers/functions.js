import { actionURL } from '../config/index';

export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const pulseemNewTab = (path) => {
  const newWindow = window.open(`${actionURL}${path}`, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const preferredOrder = (obj, order) => {
  const arr = [];
  for (var i = 0; i < obj.length; i++) {
    var newObject = {};
    order.map((o) => {
      newObject[o] = obj[i][o];
    });
    arr.push(newObject);
  }
  return arr;
}