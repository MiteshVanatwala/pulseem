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
            // const fieldDirection = { dir: isRTL ? 'rtl' : 'ltr' };
            const clientForm = {
                FirstName: new BeeFormModel(ElementTypes.text, t('common.first_name'), false, { placeholder: t('landingPages.placeholder.first_name') }),
                LastName: new BeeFormModel(ElementTypes.text, t('common.last_name'), false, { placeholder: t('landingPages.placeholder.last_name') }),
                Email: new BeeFormModel(ElementTypes.text, t('common.email'), false, { maxlength: '100', required: 'true', placeholder: t('landingPages.placeholder.email') }),
                Cellphone: new BeeFormModel(ElementTypes.text, t('common.cellphone'), false, { pattern: '\\d*', required: 'true', placeholder: t('landingPages.placeholder.cellphone') }),
                Zip: new BeeFormModel(ElementTypes.text, t('common.zip'), true, { maxlength: '50', pattern: '\\d*', placeholder: t('landingPages.placeholder.zip') }),
                City: new BeeFormModel(ElementTypes.text, t('common.city'), true, { maxlength: '100', placeholder: t('landingPages.placeholder.city') }),
                State: new BeeFormModel(ElementTypes.text, t('common.state'), true, { maxlength: '100', placeholder: t('landingPages.placeholder.state') }),
                Company: new BeeFormModel(ElementTypes.text, t('common.company'), true, { maxlength: '100', placeholder: t('landingPages.placeholder.company') }),
                Country: new BeeFormModel(ElementTypes.text, t('common.country'), true, { maxlength: '100', placeholder: t('landingPages.placeholder.country') }),
                Address: new BeeFormModel(ElementTypes.text, t('common.address'), true, { maxlength: '100', placeholder: t('landingPages.placeholder.address') }),
                Telephone: new BeeFormModel(ElementTypes.text, t('common.telephone'), true, { size: '100', pattern: '\\d*', placeholder: t('landingPages.placeholder.telephone') }),
                BirthDate: new BeeFormModel(ElementTypes.text, t('common.birth_date'), true, { placeholder: t('landingPages.placeholder.birth_date') }, 'frm-1 bee-date'),
                ReminderDate: new BeeFormModel(ElementTypes.text, t('common.reminder_date'), true, { placeholder: t('landingPages.placeholder.reminder_date') }, 'frm-1 bee-date'),
                PulseemSurvey1: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey1" }, 'PulseemSurvey'),
                PulseemSurvey2: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion2'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey2" }, 'PulseemSurvey'),
                PulseemSurvey3: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion3'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey3" }, 'PulseemSurvey'),
                PulseemSurvey4: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion4'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey4" }, 'PulseemSurvey'),
                PulseemSurvey5: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion5'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey5" }, 'PulseemSurvey'),
                PulseemSurvey6: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion6'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey6" }, 'PulseemSurvey'),
                PulseemSurvey7: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion7'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey7" }, 'PulseemSurvey'),
                PulseemSurvey8: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion8'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey8" }, 'PulseemSurvey'),
                PulseemSurvey9: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion9'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey9" }, 'PulseemSurvey'),
                PulseemSurvey10: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion10'), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion'), name: "PulseemSurvey10" }, 'PulseemSurvey')
            }
            if (extraFields && Object.keys(extraFields)?.length > 0) {
                Object.keys(extraFields).forEach((key) => {
                    const val = extraFields[key];
                    if (val !== '') {
                        clientForm[key] = new BeeFormModel(ElementTypes.text, val, true, { placeholder: t('landingPages.placeholder.typeHere') + ' ' + val, name: key }, key?.toLowerCase()?.indexOf('date') > -1 && 'frm-1 bee-date');
                    }
                });
            }
            resolve(clientForm);
        } catch (e) {
            reject(e);
        }
    });
}