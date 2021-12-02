import { actionURL } from '../config/index';
import i18n from 'i18next';

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

export const switchStatusDescription = (obj, statuses) => {
  obj.map((o) => {
    if (o.Status) {
      o.StatusDescription = i18n.t(statuses[o.Status] ? statuses[o.Status].value : null);
    }
  });
  return obj;
}

export const statusNumberToString = (t, obj, statuses) => {
  obj.map((o) => {
    if (o.Status) {
      o.Status = t(statuses[o.Status] ? statuses[o.Status].value : null);
    }
    if (o.Attachments && o.Attachments === 'No_Attachments') {
      o.Attachments = t('emailStatus.noAttachments');
    }
  });
  return obj;
}