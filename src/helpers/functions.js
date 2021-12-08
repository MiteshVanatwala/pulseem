import { actionURL } from '../config/index';
import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/he';

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
      o.StatusName = t(statuses[o.Status] ? statuses[o.Status].value : null);
    }
    if (o.Attachments && o.Attachments === 'No_Attachments' || o.Attachments === '') {
      o.Attachments = t('emailStatus.noAttachments');
    }
  });
  return obj;
}

export const formatDateTime = (arr) => {
  const newArr = [...arr];
  newArr.map((a) => {
    if (a.SendDate) {
      a.SendDate = moment(a.SendDate).format("DD/MM/YYYY HH:mm");
    }
    if (a.LastEditDate) {
      a.LastEditDate = moment(a.LastEditDate).format("DD/MM/YYYY HH:mm");
    }
    if (a.UpdatedDate) {
      a.UpdatedDate = moment(a.UpdatedDate).format("DD/MM/YYYY HH:mm");
    }
    if (a.UpdateDate) {
      a.UpdateDate = moment(a.UpdateDate).format("DD/MM/YYYY HH:mm");
    }
  });

  return newArr;
}