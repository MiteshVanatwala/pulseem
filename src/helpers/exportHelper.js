import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/he';

// export const preferredOrder = (obj, order) => {
//     const arr = [];
//     for (var i = 0; i < obj.length; i++) {
//         let newObject = {};
//         // eslint-disable-next-line no-loop-func
//         order.forEach((o) => {
//             newObject[o] = obj[i][o];
//         });
//         arr.push(newObject);
//     }
//     return arr;
// }

// export const switchStatusDescription = (obj, statuses) => {
//     obj.forEach((o) => {
//         if (o.STATUS) {
//             let status = statuses.find((s) => { return s.id === o.STATUS });
//             o.StatusDescription = i18n.t(status ? status.value : null);
//         }
//         else if (o.Status) {
//             let status = statuses.find((s) => { return s.id === o.Status });
//             o.StatusDescription = i18n.t(status ? status.value : null);
//         }
//     });
//     return obj;
// }

// export const replaceNull = (obj, property, val = '') => {
//     obj.forEach((o) => {
//         if (o[property] === null || o[property] === '') {
//             o[property] = val;
//         }
//     });
//     return obj;
// }

export const statusNumberToString = (t, obj, statuses) => {
    obj.forEach((o) => {
        if (o.Status) {
            let status = statuses.find((s) => { return s.id === o.Status });
            o.StatusName = t(status ? status.value : null);
        }
        if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
            o.Attachments = t('emailStatus.noAttachments');
        }
    });
    return obj;
}

export const booleanToNumber = (obj, column, isBoolean = false, t) => {
    obj.forEach((o) => {
        if (!o[column]) {
            o[column] = isBoolean ? t('common.No') : 0;
        }
        else {
            o[column] = isBoolean ? t('common.Yes') : 1;
        }
    });

    return obj;
}

export const formatDateTime = (arr, t) => {
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
        if (a.CreationDate) {
            a.CreationDate = moment(a.CreationDate).format("DD/MM/YYYY HH:mm");
        }
        if (a.CreatedDate) {
            a.CreatedDate = moment(a.CreatedDate).format("DD/MM/YYYY HH:mm");
        }
        if (a.ReplyDate) {
            a.ReplyDate = moment(a.ReplyDate).format("DD/MM/YYYY HH:mm");
        }
        if (a.DATE) {
            a.DATE = moment(a.DATE).format("DD/MM/YYYY HH:mm");
        }
        if (a.SendDate === '' || !a.SendDate) {
            a.SendDate = t('common.notSent');
        }

    });

    return newArr;
}

export const emailStatusNumberToString = (t, obj, statuses) => {
    obj.forEach((o) => {
        if (o.Status || o.Status === 0) {
            const translatedStatus = statuses.find((x) => { return x.id === o.Status });
            if (translatedStatus) {
                o.Status = t(translatedStatus.value);
            }
        }
    });
    return obj;
}
export const smsStatusNumberToString = (t, obj, statuses) => {
    obj.forEach((o) => {
        if (o.SmsStatus || o.SmsStatus === 0) {
            const translatedStatus = statuses.find((x) => { return x.id === o.SmsStatus });
            if (translatedStatus) {
                o.SmsStatus = t(translatedStatus.value);
            }
        }
    });
    return obj;
}

export const deletePropertyFromArrayObject = (arr, property) => {
    const newArr = [...arr];
    newArr.forEach((obj) => {
        delete obj[property];
    });
    return newArr;
}

export const replaceClientStatus = (obj) => {
    obj.forEach((o) => {
        o.ClientStatus = o.ClientStatus === 0 ? i18n.t("common.Subscribed") : i18n.t("common.Unsubscribed");
    });
    return obj;
}