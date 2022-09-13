import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/he';


export interface ExportConditions {
    OrderItems: boolean;
    TranslateStatusToString: boolean;
    TranslateStatusDescription: boolean;
    ReplaceNull: boolean;
    BooleanToNumber: boolean;
    IsBoolean: boolean;
    FormatDate: boolean;
}
export interface ExportOption extends ExportConditions {
    Order: any;
    PropertyToReplace: string;
    PropertyDefaultReplaceValue: string;
    Statuses: KeyValue[];
}
export interface ExportData {
    Data: any;
}

export interface KeyValue {
    id: number;
    value: string;
}

export const HandleExportData = async (exportData: ExportData, options: ExportOption) => {
    let finalExportData: any = [];
    const promises: any = [];

    if (options.OrderItems === true) {
        const p1 = new Promise((resolve, reject) => {
            try {
                finalExportData = OrderItems(exportData.Data, options.Order);
                resolve(finalExportData)
            } catch (error) {
                console.error('OrderItems');
                reject();
            }
        })
        promises.push(p1);
    }
    if (options.ReplaceNull === true) {
        if (options.PropertyToReplace && options.PropertyDefaultReplaceValue) {
            const p2 = new Promise((resolve, reject) => {
                try {
                    finalExportData = ReplaceNull(exportData.Data, options.PropertyToReplace, options.PropertyDefaultReplaceValue);
                    resolve(finalExportData);
                } catch (error) {
                    console.error('ReplaceNull');
                    reject();
                }
            })
            promises.push(p2);
        }
        else {
            console.warn("ReplaceNull cannot running due to null values: ", `${options.PropertyToReplace} - ${options.PropertyDefaultReplaceValue}`);
        }
    }
    if ((options.TranslateStatusDescription === true || options.TranslateStatusToString === true) && options.Statuses !== null) {
        const p3 = new Promise((resolve, reject) => {
            try {
                finalExportData = SwitchStatus(exportData.Data, options.Statuses, options);
                resolve(finalExportData)
            } catch (error) {
                console.error('SwitchStatusDescription');
                reject();
            }
        })
        promises.push(p3);
    }
    if (options.BooleanToNumber === true) {
        const p4 = new Promise((resolve, reject) => {
            try {
                finalExportData = BooleanToNumber(exportData.Data, options.PropertyToReplace, options.IsBoolean);
                resolve(finalExportData)
            } catch (error) {
                console.error('SwitchStatusDescription');
                reject();
            }
        })
        promises.push(p4);
    }
    if (options.FormatDate === true) {
        const p5 = new Promise((resolve, reject) => {
            try {
                finalExportData = FormatDateTime(exportData.Data);
                resolve(finalExportData)
            } catch (error) {
                console.error('SwitchStatusDescription');
                reject();
            }
        })
        promises.push(p5);
    }

    Promise.all(promises).then((finalResult) => {
        return finalResult;
    });
}

export const OrderItems = async (obj: any, order: any) => {
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
            console.error('ExportHelper => OrderItems', error);
            reject(error);
        }
    });
}
export const SwitchStatus = async (obj: any, statuses: KeyValue[], options: ExportOption) => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o: { STATUS: any; StatusDescription: any; Status: any; StatusName: any; Attachments: any; }) => {
                if (options.TranslateStatusDescription === true) {
                    if (o.STATUS) {
                        let status = statuses.find((s: { id: any; }) => { return s.id === o.STATUS });
                        if (status && status.value !== '') {
                            o.StatusDescription = i18n.t(status.value);
                        }
                    }
                    else if (o.Status) {
                        let status = statuses.find((s: { id: any; }) => { return s.id === o.Status });
                        if (status && status.value !== '') {
                            o.StatusDescription = i18n.t(status.value);
                        }
                    }
                }
                if (options.TranslateStatusToString === true) {
                    if (o.Status) {
                        let status = statuses.find((s) => { return s.id === o.Status });
                        if (status && status.value !== '') {
                            o.StatusName = i18n.t(status.value);
                        }
                    }
                    if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
                        o.Attachments = i18n.t('emailStatus.noAttachments');
                    }
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

export const BooleanToNumber = (obj: any, property: string, isBoolean: boolean = false) => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o: any) => {
                if (!o[property]) {
                    o[property] = isBoolean ? i18n.t('common.No') : 0;
                }
                else {
                    o[property] = isBoolean ? i18n.t('common.Yes') : 1;
                }
            });
            resolve(obj);
        } catch (error) {
            console.error('ExportHelper => SwitchStatusDescription', error);
            reject(error);
        }
    });
}
export const FormatDateTime = (arr: any) => {
    const newArr = [...arr];
    return new Promise((resolve, reject) => {
        try {
            newArr.forEach((a: any) => {
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
                    a.SendDate = i18n.t('common.notSent');
                }

            });

            resolve(newArr);
        } catch (error) {
            console.error('ExportHelper => FormatDateTime', error);
            reject(error);
        }
    });
}











export const SwitchStatusDescription = async (obj: any, statuses: KeyValue[]) => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o: { STATUS: any; StatusDescription: any; Status: any; }) => {
                if (o.STATUS) {
                    let status = statuses.find((s: { id: any; }) => { return s.id === o.STATUS });
                    if (status && status.value !== '') {
                        o.StatusDescription = i18n.t(status.value);
                    }
                }
                else if (o.Status) {
                    let status = statuses.find((s: { id: any; }) => { return s.id === o.Status });
                    if (status && status.value !== '') {
                        o.StatusDescription = i18n.t(status.value);
                    }
                }
            });
            resolve(obj);
        } catch (error) {
            console.error('ExportHelper => SwitchStatusDescription', error);
            reject(error);
        }
    });
}
export const StatusNumberToString = (obj: any[], statuses: any[]) => {
    return new Promise((resolve, reject) => {
        try {
            obj.forEach((o) => {
                if (o.Status) {
                    let status = statuses.find((s) => { return s.id === o.Status });
                    o.StatusName = i18n.t(status ? status.value : null);
                }
                if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
                    o.Attachments = i18n.t('emailStatus.noAttachments');
                }
            });
            resolve(obj);
        } catch (error) {
            console.error('ExportHelper => SwitchStatusDescription', error);
            reject(error);
        }
    });
}

