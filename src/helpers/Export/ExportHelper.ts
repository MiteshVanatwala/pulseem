import 'moment/locale/he';
import i18n from 'i18next';
import moment from 'moment';
import Papa from 'papaparse';

export interface ExportConditions {
    IsBoolean: boolean;
    OrderItems: boolean;
    FormatDate: boolean;
    ReplaceNull: boolean;
    BooleanToNumber: boolean;
    ReplaceClientStatus: boolean;
    TranslateStatusToString: boolean;
    TranslateStatusDescription: boolean;
}
export interface ExportOption extends ExportConditions {
    Order: any;
    PropertyToReplace: string;
    PropertyDefaultReplaceValue: string;
    Statuses: KeyValue[];
    DeleteProperties: string[];
}
export interface ExportData {
    Data: any;
}
export interface KeyValue {
    id: number;
    value: string;
}
const DateOptions: string[] = ['SendDate', 'LastEditDate', 'UpdateDate', 'UpdatedDate', 'CreationDate', 'ReplyDate', 'DATE'];

export const HandleExportData = async (exportData: ExportData, options: ExportOption) => {
    let finalExportData: ExportData | any = exportData;

    return new Promise(async (resolve, reject) => {
        if (options.OrderItems === true) {
            try {
                finalExportData = await OrderItems(finalExportData, options.Order, options);
            } catch (error) {
                console.error('OrderItems');
                reject();
            }
        }
        if (options.ReplaceNull === true) {
            try {
                finalExportData = await ReplaceNull(finalExportData, options.PropertyToReplace, options.PropertyDefaultReplaceValue);
            } catch (error) {
                console.error('ReplaceNull');
                reject();
            }
        }
        if ((options.TranslateStatusDescription === true || options.TranslateStatusToString === true) && options.Statuses !== null) {
            try {
                finalExportData = await SwitchStatus(finalExportData, options.Statuses, options);
            } catch (error) {
                console.error('SwitchStatus');
                reject();
            }
        }
        if (options.BooleanToNumber === true) {
            try {
                finalExportData = await BooleanToNumber(finalExportData, options.PropertyToReplace, options.IsBoolean);
            } catch (error) {
                console.error('BooleanToNumber');
                reject();
            }
        }
        if (options.DeleteProperties?.length > 0) {
            finalExportData = await DeletePropertyFromArrayObject(finalExportData, options.DeleteProperties);
        }
        resolve(finalExportData);
    });
}
export const OrderItems = async (data: ExportData | any, order: any, options: ExportOption) => {
    return new Promise((resolve, reject) => {
        try {
            const finalOrder: any = [];

            for (var i = 0; i < data.length; i++) {
                let newObject: any = {};
                // eslint-disable-next-line no-loop-func
                order.forEach((o: string | number) => {
                    let value = data[i][o];
                    if (options.ReplaceClientStatus === true && o?.toString()?.toLowerCase() === 'clientstatus') {
                        value = data[i][o] === 0 ? i18n.t("common.Subscribed") : i18n.t("common.Unsubscribed");
                    }
                    if (options.FormatDate === true && DateOptions.filter(e => { return e === o })?.length > 0) {
                        value = FormatDate(value);
                    }
                    newObject[o] = value;
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
export const SwitchStatus = async (data: ExportData | any, statuses: KeyValue[], options: ExportOption) => {
    return new Promise((resolve, reject) => {
        try {
            const retValData: any[] = [];
            data.forEach((o: { STATUS: any; StatusDescription: any; Status: any; SmsStatus: any, StatusName: any; Attachments: any; }) => {
                const tempData = { ...o };
                if (options.TranslateStatusDescription === true) {
                    if (o.STATUS) {
                        let status = statuses.find((s: { id: any; }) => { return s.id === o.STATUS });
                        if (status && status.value !== '') {
                            tempData["StatusDescription"] = i18n.t(status.value);
                        }
                    }
                    if (o.Status) {
                        let status = statuses.find((s: { id: any; }) => { return s.id === o.Status });
                        if (status && status.value !== '') {
                            tempData["StatusDescription"] = i18n.t(status.value);
                        }
                    }
                    if (o.SmsStatus || o.SmsStatus === 0) {
                        const status = statuses.find((x) => { return x.id === o.SmsStatus });
                        if (status) {
                            tempData["SmsStatus"] = i18n.t(status.value);
                        }
                    }
                }
                if (options.TranslateStatusToString === true) {
                    if (o.Status) {
                        let status = statuses.find((s) => { return s.id === o.Status });
                        if (status && status.value !== '') {
                            tempData["StatusName"] = i18n.t(status.value);
                        }
                    }
                    if (o.SmsStatus || o.SmsStatus === 0) {
                        const status = statuses.find((x) => { return x.id === o.SmsStatus });
                        if (status) {
                            tempData["SmsStatus"] = i18n.t(status.value);
                        }
                    }
                    if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
                        tempData["Attachments"] = i18n.t('emailStatus.noAttachments');
                    }
                }

                retValData.push(tempData);
            });
            resolve(retValData);
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
export const FormatDate = (date: string) => {
    if (date === '' || !date) {
        return date = i18n.t('common.notSent');
    }
    return moment(date).format("DD/MM/YYYY HH:mm");
}
export const ReplaceClientStatus = (obj: any) => {
    obj.forEach((o: any) => {
        o.ClientStatus = o.ClientStatus === 0 ? i18n.t("common.Subscribed") : i18n.t("common.Unsubscribed");
    });
    return obj;
}
export const DeletePropertyFromArrayObject = (data: ExportData | any, properties: string[]) => {
    try {
        return new Promise((resolve) => {
            const retValData: any[] = [];

            data.forEach((obj: { [x: string]: any; }) => {
                properties.forEach((property: string) => {
                    delete obj[property];
                })
                retValData.push(obj);
            });
            resolve(retValData);
        });
    } catch (ex) {
        console.error(ex);
    }
}

export const JsonToCSV = async (data: any, options: any) => {
    return new Promise((resolve, reject) => {
        try {
            if (!options) {
                options = {
                    quotes: false,
                    quoteChar: '"',
                    escapeChar: '"',
                    delimiter: ",",
                    header: false,
                    newline: "\r\n",
                    skipEmptyLines: true, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
                    columns: undefined, //or array of strings
                    encoding: "UTF-8"
                }
            }
            const { array } = data;
            const p = Papa.unparse(array, options);

            StringToArrayBuffer(p).then((output) => {
                resolve(output);
            });
        }
        catch (e) {
            console.error('jsonToCsv', e);
            reject(e);
        }
    });
}

export const CreateFile = (data: any, type: string) => {
    return new Promise((resolve, reject) => {
        try {
            const f = new File([data], `${Date.now()}.${type}`, { type: `text/${type}` });
            resolve(f);
        } catch (error) {
            reject(error);
        }
    })
}

export const StringToArrayBuffer = (str: string) => {
    return new Promise((resolve, reject) => {
        try {
            var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            resolve(buf);
        } catch (e) {
            console.error('stringToArrayBuffer', e);
            reject(null);
        }
    })
}