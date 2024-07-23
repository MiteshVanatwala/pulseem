import 'moment/locale/he';
import i18n from 'i18next';
import moment from 'moment';
import Papa from 'papaparse';
import { AccountExtraFields } from '../../Models/Account/AccountExtraFields';
export interface ExportConditions {
    IsBoolean: boolean;
    OrderItems: boolean;
    FormatDate: boolean;
    ReplaceNull: boolean;
    BooleanToNumber: boolean;
    ReplaceClientStatus: boolean;
    ConvertStatusToString: boolean;
    ConvertStatusDescription: boolean;
}
export interface ExportOption extends ExportConditions {
    Order: any;
    PropertyToReplace: string;
    PropertyDefaultReplaceValue: string;
    Statuses: KeyValue[];
    DeleteProperties: string[];
}
export interface Status {
    STATUS: any;
    StatusDescription: any;
    Status: any;
    SmsStatus: any,
    StatusName: any;
    Attachments: any;
}
export interface ExportData {
    Data: any;
}
export interface KeyValue {
    id: number;
    value: string;
}
const DateOptions: string[] = [
    'SendDate',
    'LastEditDate',
    'UpdateDate',
    'UpdatedDate',
    'CreationDate',
    'ReplyDate',
    'DATE',
    "Schedule",
    "BirthDate",
    "ExtraDate1",
    "ExtraDate2",
    "ExtraDate3",
    "ExtraDate4",
    "ReminderDate"
];

export const HandleExportData = async (exportData: ExportData, options: ExportOption) => {
    let finalExportData: ExportData = exportData;

    return new Promise(async (resolve, reject) => {
        if (options.OrderItems === true) {
            try {
                finalExportData = await OrderItems(finalExportData, options.Order, options);
            } catch (error) {
                // Log({
                //     MethodName: 'HandleExportData',
                //     ComponentName: 'ExportHelper.ts',
                //     Text: 'OrderItems'
                // })
                console.error('OrderItems');
                // reject(error);
            }
        }
        if (options.ReplaceNull === true) {
            try {
                finalExportData = await ReplaceNull(finalExportData, options?.PropertyToReplace, options?.PropertyDefaultReplaceValue) as unknown as ExportData;
            } catch (error) {
                // Log({
                //     MethodName: 'ReplaceNull',
                //     ComponentName: 'ExportHelper.ts',
                //     Text: 'ReplaceNull'
                // })
                console.error('ReplaceNull');
                // reject(error);
            }
        }
        if ((options.ConvertStatusDescription === true || options.ConvertStatusToString === true) && options.Statuses !== null) {
            try {
                finalExportData = await SwitchStatus(finalExportData, options.Statuses, options);
            } catch (error) {
                // Log({
                //     MethodName: 'SwitchStatus',
                //     ComponentName: 'ExportHelper.ts',
                //     Text: 'SwitchStatus'
                // })
                console.error('ConvertStatusDescription');
                // reject(error);
            }
        }
        if (options.BooleanToNumber === true) {
            try {
                finalExportData = await BooleanToNumber(finalExportData, options.PropertyToReplace, options.IsBoolean) as ExportData;
            } catch (error) {
                // Log({
                //     MethodName: 'BooleanToNumber',
                //     ComponentName: 'ExportHelper.ts',
                //     Text: 'BooleanToNumber'
                // })
                console.error('BooleanToNumber');
                // reject(error);
            }
        }
        if (options.DeleteProperties?.length > 0) {
            finalExportData = await DeletePropertyFromArrayObject(finalExportData, options.DeleteProperties);
        }
        resolve(finalExportData);
    });
}
export async function OrderItems(data: ExportData | any, order: any, options: ExportOption) {
    const finalOrder: any = [];

    for (var i = 0; i < data?.length; i++) {
        let newObject: any = {};
        // eslint-disable-next-line no-loop-func
        order.forEach((o: string | number) => {
            let value = data[i][o];
            if (options.ReplaceClientStatus === true && o?.toString()?.toLowerCase() === 'clientstatus') {
                value = data[i][o] === 0 ? i18n.t("common.Subscribed") : i18n.t("common.Unsubscribed");
            }
            if (options.FormatDate === true && DateOptions.filter(e => { return e.toLowerCase() === o.toString().toLowerCase() })?.length > 0) {
                const preventText = o.toString().toLowerCase() !== 'senddate' && o.toString().toLowerCase() !== 'date';
                value = FormatDate(value, preventText);
            }
            newObject[o] = value;
        });

        finalOrder.push(newObject);
    }
    return finalOrder as ExportData;
}
export async function SwitchStatus(data: ExportData | any, statuses: KeyValue[], options: ExportOption) {
    const retValData: any = [];
    data?.forEach((o: Status) => {
        const tempData = { ...o } as Status;
        if (options.ConvertStatusDescription === true) {
            if (o.STATUS || o.STATUS === 0) {
                let status = statuses.find((s: { id: any; }) => { return s.id === o.STATUS });
                if (status && status.value !== '') {
                    tempData.StatusDescription = i18n.t(status.value);
                }
            }
            if (o.Status || o.Status === 0) {
                let status = statuses.find((s: { id: any; }) => { return s.id === o.Status });
                if (status && status.value !== '') {
                    tempData.StatusDescription = i18n.t(status.value);
                }
            }
            if (o.SmsStatus || o.SmsStatus === 0) {
                const status = statuses.find((x) => { return x.id === o.SmsStatus });
                if (status) {
                    tempData.SmsStatus = i18n.t(status.value);
                }
            }
        }
        if (options.ConvertStatusToString === true) {
            if (o.Status || o.Status === 0) {
                let status = statuses.find((s) => { return s.id === o.Status });
                if (status && status.value !== '') {
                    tempData.Status = i18n.t(status.value);
                    tempData.StatusName = i18n.t(status.value);
                }
            }
            if (o.SmsStatus || o.SmsStatus === 0) {
                const status = statuses.find((x) => { return x.id === o.SmsStatus });
                if (status) {
                    tempData.SmsStatus = i18n.t(status.value);
                }
            }
            if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
                tempData.Attachments = i18n.t('emailStatus.noAttachments');
            }
        }

        retValData.push(tempData);
    });
    return retValData as ExportData;
}
export async function ReplaceNull(obj: ExportData | any, property: string, val: string = '') {
    return new Promise((resolve) => {
        obj?.forEach((o: { [x: string]: string; }) => {
            if (!property || property === '') {
                Object.keys(o).forEach((key: any) => {
                    const currentValue = o[key];
                    if (currentValue === null || currentValue === undefined || currentValue === 'null') {
                        o[key] = '';
                    }
                });
            }
            else {
                if (o[property] === null || o[property] === '' || o[property] === 'null') {
                    o[property] = val;
                }
            }
        });
        resolve(obj);
    });
}
export async function BooleanToNumber(obj: ExportData | any, property: string, isBoolean: boolean = false) {
    return new Promise((resolve) => {
        const newObject: any = [];
        obj.forEach((o: any) => {
            Object.freeze(o);
            let item = { ...o };
            if (!item[property]) {
                item[property] = isBoolean ? i18n.t('common.No') : 0;
            }
            else {
                item[property] = isBoolean ? i18n.t('common.Yes') : 1;
            }
            newObject.push(item);
        });
        resolve(newObject);
    })
}
export const FormatDate = (date: string, preventText: boolean = false) => {
    if (date === '' || !date) {
        if (!preventText) {
            return date = i18n.t('common.notSent');
        }
        return '';
    }
    return moment(date).format("DD/MM/YYYY HH:mm");
}
export async function ReplaceClientStatus(obj: ExportData | any) {
    obj.forEach((o: any) => {
        o.ClientStatus = o.ClientStatus === 0 ? i18n.t("common.Subscribed") : i18n.t("common.Unsubscribed");
    });
    return obj as ExportData;
}
export async function DeletePropertyFromArrayObject(data: ExportData | any, properties: string[]) {
    const retValData: any = [];
    if (data && data?.length > 0) {
        data.forEach((obj: { [x: string]: any; }) => {
            properties.forEach((property: string) => {
                delete obj[property];
            })
            retValData.push(obj);
        });
    }
    return retValData as ExportData;
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
            // Log({
            //     MethodName: 'jsonToCsv',
            //     ComponentName: 'ExportHelper.ts',
            //     Text: e as string
            // })
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
            // Log({
            //     MethodName: 'CreateFile',
            //     ComponentName: 'ExportHelper.ts',
            //     Text: error as string
            // })
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
export const FlatObject = (obj: any = {}) => Object.keys(obj || {}).reduce((o: any, cur) => {
    if (typeof obj[cur] === 'object') {
        o = { ...o, ...FlatObject(obj[cur]) }
    } else { o[cur] = obj[cur] }
    return o
}, {})

export async function SwitchStatusByCondition(data: ExportData | any, statuses: KeyValue[], isEmail: boolean) {
    const retValData: any = [];
    data.forEach((o: Status) => {
        const tempData = { ...o } as Status;

        if (isEmail === true && o.Status) {
            let status = statuses.find((s) => { return s.id === o.Status });
            if (status && status.value !== '') {
                tempData.Status = i18n.t(status.value);
                tempData.StatusName = i18n.t(status.value);
            }
        }
        if (!isEmail && (o.SmsStatus || o.SmsStatus === 0)) {
            const status = statuses.find((x) => { return x.id === o.SmsStatus });
            if (status) {
                tempData.SmsStatus = i18n.t(status.value);
            }
        }
        if (o.Attachments && (o.Attachments === 'No_Attachments' || o.Attachments === '')) {
            tempData.Attachments = i18n.t('emailStatus.noAttachments');
        }
        retValData.push(tempData);
    });
    return retValData as ExportData;
}

export async function SwitchIsOptIn(data: ExportData | any) {
    const retValData: any = [];
    data.forEach((o: any) => {
        const tempData = { ...o } as any;
        if (o?.IsOptIn && (o?.IsOptIn === true || o?.IsOptIn?.toLowerCase() === 'true')) {
            tempData.IsOptIn = i18n.t('landingPages.approved');
        }
        else {
            tempData.IsOptIn = i18n.t('landingPages.notApproved');
        }
        retValData.push(tempData);
    });
    return retValData as ExportData;
}