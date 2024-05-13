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
            const fieldDirection = { dir: isRTL ? 'rtl' : 'ltr' };
            const clientForm = {
                FirstName: new BeeFormModel(ElementTypes.text, t('common.first_name'), false, { ...fieldDirection, placeholder: t('common.first_name') }),
                LastName: new BeeFormModel(ElementTypes.text, t('common.last_name'), false, { ...fieldDirection, placeholder: t('common.last_name') }),
                Email: new BeeFormModel(ElementTypes.email, t('common.email'), false, { ...fieldDirection, required: 'true', maxlength: '100', placeholder: t('common.email') }),
                Cellphone: new BeeFormModel(ElementTypes.text, t('common.cellphone'), false, { ...fieldDirection, required: 'true', pattern: '\\d*', placeholder: t('common.cellphone') }),
                Zip: new BeeFormModel(ElementTypes.number, t('common.zip'), true, { ...fieldDirection, maxlength: '50', pattern: '\\d*', placeholder: t('common.zip') }),
                City: new BeeFormModel(ElementTypes.text, t('common.city'), true, { ...fieldDirection, maxlength: '100', placeholder: t('common.city') }),
                State: new BeeFormModel(ElementTypes.text, t('common.state'), true, { ...fieldDirection, maxlength: '100', placeholder: t('common.state') }),
                Company: new BeeFormModel(ElementTypes.text, t('common.company'), true, { ...fieldDirection, maxlength: '100', placeholder: t('common.company') }),
                Country: new BeeFormModel(ElementTypes.text, t('common.country'), true, { ...fieldDirection, maxlength: '100', placeholder: t('common.country') }),
                Address: new BeeFormModel(ElementTypes.text, t('common.address'), true, { ...fieldDirection, maxlength: '100', placeholder: t('common.address') }),
                Telephone: new BeeFormModel(ElementTypes.text, t('common.telephone'), true, { ...fieldDirection, size: '100', pattern: '\\d*', placeholder: t('common.telephone') }),
                BirthDate: new BeeFormModel(ElementTypes.date, t('common.birth_date'), true, { ...fieldDirection, placeholder: t('common.birth_date') }),
                ReminderDate: new BeeFormModel(ElementTypes.date, t('common.reminder_date'), true, { ...fieldDirection, placeholder: t('common.reminder_date') }),
                PulseemSurvey1: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion'), true, { ...fieldDirection, required: 'true', placeholder: t('common.surveyQuestion') }, 'PulseemSurvey')
            }
            if (extraFields && Object.keys(extraFields)?.length > 0) {
                Object.keys(extraFields).forEach((key) => {
                    const val = extraFields[key];
                    if (val !== '') {
                        const _type = key?.toLowerCase()?.indexOf('date') > -1 ? ElementTypes.date : ElementTypes.text;
                        clientForm[key] = new BeeFormModel(_type, val, true, true, { ...fieldDirection, placeholder: val });
                    }
                });
            }
            resolve(clientForm);
        } catch (e) {
            reject(e);
        }
    });
}