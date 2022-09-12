import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/he';

export const PreferredOrder = async (obj: any, order: any) => {
    return new Promise((resolve, reject) => {
        try {
            const finalOrder: any = [];

            for (var i = 0; i < obj.length; i++) {
                let newObject: any = {};
                // eslint-disable-next-line no-loop-func
                order.forEach((o: string | number) => {
                    newObject[o] = obj[i][o];
                });

                finalOrder.push(newObject);
            }
            resolve(finalOrder);
        } catch (error) {
            console.error('ExportHelper => PreferredOrder', error);
            reject(error);
        }
    });
}

export const SwitchStatusDescription = async (obj: any, statuses: any) => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o: { STATUS: any; StatusDescription: any; Status: any; }) => {
                if (o.STATUS) {
                    let status = statuses.find((s: { id: any; }) => { return s.id === o.STATUS });
                    o.StatusDescription = i18n.t(status ? status.value : null);
                }
                else if (o.Status) {
                    let status = statuses.find((s: { id: any; }) => { return s.id === o.Status });
                    o.StatusDescription = i18n.t(status ? status.value : null);
                }
            });
            resolve(obj);
        } catch (error) {
            console.error('ExportHelper => SwitchStatusDescription', error);
            reject(error);
        }
    });
}

export const ReplaceNull = async (obj: any, property: string, val: string = '') => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o: { [x: string]: string; }) => {
                if (o[property] === null || o[property] === '') {
                    o[property] = val;
                }
            });
            resolve(obj);
        } catch (error) {
            console.error('ExportHelper => SwitchStatusDescription', error);
            reject(error);
        }
    });
}

export const StatusNumberToString = (t: (arg0: string) => any, obj: any[], statuses: any[]) => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o) => {
                if (o.Status) {
                    let status = statuses.find((s) => { return s.id === o.Status });
                    o.StatusName = t(status ? status.value : null);
                }
                if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
                    o.Attachments = t('emailStatus.noAttachments');
                }
            });
            resolve(obj);
        } catch (error) {
            console.error('ExportHelper => SwitchStatusDescription', error);
            reject(error);
        }
    });
}