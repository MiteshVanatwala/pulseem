import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/he';

export const preferredOrder = (obj, order) => {
    const arr = [];
    for (var i = 0; i < obj.length; i++) {
        let newObject = {};
        // eslint-disable-next-line no-loop-func
        order.forEach((o) => {
            newObject[o] = obj[i][o];
        });
        arr.push(newObject);
    }
    return arr;
}

export const statusNumberToString = (t, obj, statuses) => {
    obj.forEach((o) => {
        if (o.Status) {
            o.StatusName = t(statuses[o.Status] ? statuses[o.Status].value : null);
        }
        if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
            o.Attachments = t('emailStatus.noAttachments');
        }
    });
    return obj;
}

export const booleanToNumber = (obj, column) => {
    obj.forEach((o) => {
        if (!o[column]) {
            o[column] = 0;
        }
        else {
            o[column] = 1;
        }
    });

    return obj;
}

export const formatDateTime = (arr) => {
    const newArr = [...arr];
    newArr.forEach((a) => {
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