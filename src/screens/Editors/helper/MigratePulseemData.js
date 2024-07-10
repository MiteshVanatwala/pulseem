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
                FirstName: new BeeFormModel(ElementTypes.text, t('common.first_name'), false, { ...fieldDirection, placeholder: t('landingPages.placeholder.first_name') }),
                LastName: new BeeFormModel(ElementTypes.text, t('common.last_name'), false, { ...fieldDirection, placeholder: t('landingPages.placeholder.last_name') }),
                Email: new BeeFormModel(ElementTypes.email, t('common.email'), false, { ...fieldDirection, maxlength: '100', placeholder: t('landingPages.placeholder.email') }),
                Cellphone: new BeeFormModel(ElementTypes.number, t('common.cellphone'), false, { ...fieldDirection, pattern: '\\d*', placeholder: t('landingPages.placeholder.cellphone') }),
                Zip: new BeeFormModel(ElementTypes.number, t('common.zip'), true, { ...fieldDirection, maxlength: '50', pattern: '\\d*', placeholder: t('landingPages.placeholder.zip') }),
                City: new BeeFormModel(ElementTypes.text, t('common.city'), true, { ...fieldDirection, maxlength: '100', placeholder: t('landingPages.placeholder.city') }),
                State: new BeeFormModel(ElementTypes.text, t('common.state'), true, { ...fieldDirection, maxlength: '100', placeholder: t('landingPages.placeholder.state') }),
                Company: new BeeFormModel(ElementTypes.text, t('common.company'), true, { ...fieldDirection, maxlength: '100', placeholder: t('landingPages.placeholder.company') }),
                Country: new BeeFormModel(ElementTypes.text, t('common.country'), true, { ...fieldDirection, maxlength: '100', placeholder: t('landingPages.placeholder.country') }),
                Address: new BeeFormModel(ElementTypes.text, t('common.address'), true, { ...fieldDirection, maxlength: '100', placeholder: t('landingPages.placeholder.address') }),
                Telephone: new BeeFormModel(ElementTypes.number, t('common.telephone'), true, { ...fieldDirection, size: '100', pattern: '\\d*', placeholder: t('landingPages.placeholder.telephone') }),
                BirthDate: new BeeFormModel(ElementTypes.date, t('common.birth_date'), true, { ...fieldDirection, placeholder: t('landingPages.placeholder.birth_date') }),
                ReminderDate: new BeeFormModel(ElementTypes.date, t('common.reminder_date'), true, { ...fieldDirection, placeholder: t('landingPages.placeholder.reminder_date') }),
                PulseemSurvey1: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey1" }, 'PulseemSurvey'),
                PulseemSurvey2: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion2'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey2" }, 'PulseemSurvey'),
                PulseemSurvey3: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion3'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey3" }, 'PulseemSurvey'),
                PulseemSurvey4: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion4'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey4" }, 'PulseemSurvey'),
                PulseemSurvey5: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion5'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey5" }, 'PulseemSurvey'),
                PulseemSurvey6: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion6'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey6" }, 'PulseemSurvey'),
                PulseemSurvey7: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion7'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey7" }, 'PulseemSurvey'),
                PulseemSurvey8: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion8'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey8" }, 'PulseemSurvey'),
                PulseemSurvey9: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion9'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey9" }, 'PulseemSurvey'),
                PulseemSurvey10: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion10'), true, { ...fieldDirection, required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey10" }, 'PulseemSurvey')
            }
            if (extraFields && Object.keys(extraFields)?.length > 0) {
                Object.keys(extraFields).forEach((key) => {
                    const val = extraFields[key];
                    if (val !== '') {
                        const _type = key?.toLowerCase()?.indexOf('date') > -1 ? ElementTypes.date : ElementTypes.text;
                        clientForm[key] = new BeeFormModel(_type, val, true, { ...fieldDirection, placeholder: t('landingPages.placeholder.typeHere') + ' ' + val, name: key });
                    }
                });
            }
            resolve(clientForm);
        } catch (e) {
            reject(e);
        }
    });
}