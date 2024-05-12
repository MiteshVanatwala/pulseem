import { ClientFields } from '../../../model/PulseemFields/Fields'
import { BeeFormModel, ElementTypes } from '../../../Models/BeeModels/BeeModel';

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
                FirstName: new BeeFormModel(ElementTypes.text, t('common.first_name'), true, false, { dir: isRTL ? 'rtl' : 'ltr', placeholder: t('common.first_name') }),
                LastName: new BeeFormModel(ElementTypes.text, t('common.last_name'), true, false, { dir: isRTL ? 'rtl' : 'ltr', placeholder: t('common.last_name') }),
                Email: new BeeFormModel(ElementTypes.email, t('common.email'), true, false, { required: 'true', dir: isRTL ? 'rtl' : 'ltr', maxlength: '100', placeholder: t('common.email') }),
                Cellphone: new BeeFormModel(ElementTypes.text, t('common.cellphone'), true, false, { required: 'true', dir: isRTL ? 'rtl' : 'ltr', pattern: '\\d*', placeholder: t('common.cellphone') }),
                Zip: new BeeFormModel(ElementTypes.text, t('common.zip'), true, true, { dir: isRTL ? 'rtl' : 'ltr', maxlength: '50', pattern: '\\d*', placeholder: t('common.zip') }),
                City: new BeeFormModel(ElementTypes.text, t('common.city'), true, true, { dir: isRTL ? 'rtl' : 'ltr', maxlength: '100', placeholder: t('common.city') }),
                State: new BeeFormModel(ElementTypes.text, t('common.state'), true, true, { dir: isRTL ? 'rtl' : 'ltr', maxlength: '100', placeholder: t('common.state') }),
                Company: new BeeFormModel(ElementTypes.text, t('common.company'), true, true, { dir: isRTL ? 'rtl' : 'ltr', maxlength: '100', placeholder: t('common.company') }),
                Country: new BeeFormModel(ElementTypes.text, t('common.country'), true, true, { dir: isRTL ? 'rtl' : 'ltr', maxlength: '100', placeholder: t('common.country') }),
                Address: new BeeFormModel(ElementTypes.text, t('common.address'), true, true, { dir: isRTL ? 'rtl' : 'ltr', maxlength: '100', placeholder: t('common.address') }),
                Telephone: new BeeFormModel(ElementTypes.text, t('common.telephone'), true, true, { dir: isRTL ? 'rtl' : 'ltr', size: '100', pattern: '\\d*', placeholder: t('common.telephone') }),
                BirthDate: new BeeFormModel(ElementTypes.date, t('common.birth_date'), true, true, { dir: isRTL ? 'rtl' : 'ltr', placeholder: t('common.birth_date') }),
                ReminderDate: new BeeFormModel(ElementTypes.date, t('common.reminder_date'), true, true, { dir: isRTL ? 'rtl' : 'ltr', placeholder: t('common.reminder_date') }),
                PulseemSurvey1: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion'), true, true, { required: 'true', dir: isRTL ? 'rtl' : 'ltr', placeholder: t('common.surveyQuestion') }, 'PulseemSurvey')
            }
            if (extraFields && Object.keys(extraFields)?.length > 0) {
                Object.keys(extraFields).forEach((key) => {
                    const val = extraFields[key];
                    if (val !== '') {
                        const _type = key?.toLowerCase()?.indexOf('date') > -1 ? ElementTypes.date : ElementTypes.text;
                        clientForm[key] = new BeeFormModel(_type, val, true, true, { dir: isRTL ? 'rtl' : 'ltr', placeholder: val });
                    }
                });
            }
            resolve(clientForm);
        } catch (e) {
            reject(e);
        }
    });
}