import { BeeFormModel, ElementTypes } from '../../../Models/BeeModels/BeeModel';
import { ClientFields } from '../../../model/PulseemFields/Fields'

export const initExtraDataField = (extraData, t) => {

    return new Promise((resolve, reject) => {
        try {
            let exData = [...ClientFields];
            Object.keys(extraData).forEach((item, i) => {
                if (Object.values(extraData)[i] && Object.values(extraData)[i] !== '') {
                    exData.push({ value: item, name: Object.values(extraData)[i], isExtraField: true })
                }
            });

            exData.forEach((ed) => {
                ed.name = !ed.isExtraField ? t(ed.label) : t(ed.name);
                ed.value = "##" + ed.value + "##";
            });
            resolve(exData);
        } catch (e) {
            reject(e);
        }
    });
}

export const initLandingPages = (previousLandingData, t) => {
    return new Promise((resolve, reject) => {
        try {
            const titleName = t('landingPages.landingPages');
            const items = [];

            previousLandingData.forEach((item, i) => {
                items.push({
                    type: titleName,
                    label: item.CampaignName,
                    link: item.PageHref
                });
            });

            resolve(items);
        }
        catch (e) {
            reject(e);
        }
    });
}

export const initClientForm = (extraFields, t, isRTL) => {
    return new Promise((resolve, reject) => {
        try {
            const clientForm = {
                Email: new BeeFormModel(ElementTypes.text, t('common.email'), true, false, { dir: isRTL ? 'rtl' : 'ltr' }),
                FirstName: new BeeFormModel(ElementTypes.text, t('common.first_name'), true, false, { dir: isRTL ? 'rtl' : 'ltr' }),
                LastName: new BeeFormModel(ElementTypes.text, t('common.last_name'), true, false, { dir: isRTL ? 'rtl' : 'ltr' }),
                Cellphone: new BeeFormModel(ElementTypes.text, t('common.cellphone'), true, false, { dir: isRTL ? 'rtl' : 'ltr' }),
                Zip: new BeeFormModel(ElementTypes.text, t('common.zip'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                City: new BeeFormModel(ElementTypes.text, t('common.city'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                State: new BeeFormModel(ElementTypes.text, t('common.state'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                Company: new BeeFormModel(ElementTypes.text, t('common.company'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                Country: new BeeFormModel(ElementTypes.text, t('common.country'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                Address: new BeeFormModel(ElementTypes.text, t('common.address'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                Telephone: new BeeFormModel(ElementTypes.text, t('common.telephone'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                BirthDate: new BeeFormModel(ElementTypes.date, t('common.birth_date'), true, true, { dir: isRTL ? 'rtl' : 'ltr' }),
                ReminderDate: new BeeFormModel(ElementTypes.date, t('common.reminder_date'), true, true, { dir: isRTL ? 'rtl' : 'ltr' })
            }

            if (extraFields && Object.keys(extraFields)?.length > 0) {
                Object.keys(extraFields).forEach((key) => {
                    const val = extraFields[key];
                    if (val !== '') {
                        const _type = key?.toLowerCase()?.indexOf('date') > -1 ? ElementTypes.date : ElementTypes.text;
                        clientForm[key] = new BeeFormModel(_type, val, true, true, { dir: isRTL ? 'rtl' : 'ltr' });
                    }
                });
            }

            resolve(clientForm);
        } catch (e) {
            reject(e);
        }
    });
}