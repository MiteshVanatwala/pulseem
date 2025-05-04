import { BASED_ON_LANG } from '../../../helpers/Constants';
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

export const initClientForm = (extraFields, t, language) => {
    return new Promise((resolve, reject) => {
        try {
            const clientForm = {
                FirstName: new BeeFormModel(ElementTypes.text, t('common.first_name', { lng: BASED_ON_LANG[language] }), false, { placeholder: t('landingPages.placeholder.first_name', { lng: BASED_ON_LANG[language] }) }),
                LastName: new BeeFormModel(ElementTypes.text, t('common.last_name', { lng: BASED_ON_LANG[language] }), false, { placeholder: t('landingPages.placeholder.last_name', { lng: BASED_ON_LANG[language] }) }),
                Email: new BeeFormModel(ElementTypes.text, t('common.email', { lng: BASED_ON_LANG[language] }), false, { maxlength: '100', required: 'true', placeholder: t('landingPages.placeholder.email', { lng: BASED_ON_LANG[language] }) }),
                Cellphone: new BeeFormModel(ElementTypes.text, t('common.cellphone', { lng: BASED_ON_LANG[language] }), false, { pattern: '\\d*', required: 'true', placeholder: t('landingPages.placeholder.cellphone', { lng: BASED_ON_LANG[language] }) }),
                Zip: new BeeFormModel(ElementTypes.text, t('common.zip', { lng: BASED_ON_LANG[language] }), true, { maxlength: '50', pattern: '\\d*', placeholder: t('landingPages.placeholder.zip', { lng: BASED_ON_LANG[language] }) }),
                City: new BeeFormModel(ElementTypes.text, t('common.city', { lng: BASED_ON_LANG[language] }), true, { maxlength: '100', placeholder: t('landingPages.placeholder.city', { lng: BASED_ON_LANG[language] }) }),
                State: new BeeFormModel(ElementTypes.text, t('common.state', { lng: BASED_ON_LANG[language] }), true, { maxlength: '100', placeholder: t('landingPages.placeholder.state', { lng: BASED_ON_LANG[language] }) }),
                Company: new BeeFormModel(ElementTypes.text, t('common.company', { lng: BASED_ON_LANG[language] }), true, { maxlength: '100', placeholder: t('landingPages.placeholder.company', { lng: BASED_ON_LANG[language] }) }),
                Country: new BeeFormModel(ElementTypes.text, t('common.country', { lng: BASED_ON_LANG[language] }), true, { maxlength: '100', placeholder: t('landingPages.placeholder.country', { lng: BASED_ON_LANG[language] }) }),
                Address: new BeeFormModel(ElementTypes.text, t('common.address', { lng: BASED_ON_LANG[language] }), true, { maxlength: '100', placeholder: t('landingPages.placeholder.address', { lng: BASED_ON_LANG[language] }) }),
                Telephone: new BeeFormModel(ElementTypes.text, t('common.telephone', { lng: BASED_ON_LANG[language] }), true, { size: '100', pattern: '\\d*', placeholder: t('landingPages.placeholder.telephone', { lng: BASED_ON_LANG[language] }) }),
                BirthDate: new BeeFormModel(ElementTypes.text, t('common.birth_date', { lng: BASED_ON_LANG[language] }), true, { placeholder: t('landingPages.placeholder.birth_date', { lng: BASED_ON_LANG[language] }) }, 'frm-1 bee-date'),
                ReminderDate: new BeeFormModel(ElementTypes.text, t('common.reminder_date', { lng: BASED_ON_LANG[language] }), true, { placeholder: t('landingPages.placeholder.reminder_date', { lng: BASED_ON_LANG[language] }) }, 'frm-1 bee-date'),
                PulseemSurvey1: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey1" }, 'PulseemSurvey'),
                PulseemSurvey2: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion2', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey2" }, 'PulseemSurvey'),
                PulseemSurvey3: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion3', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey3" }, 'PulseemSurvey'),
                PulseemSurvey4: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion4', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey4" }, 'PulseemSurvey'),
                PulseemSurvey5: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion5', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey5" }, 'PulseemSurvey'),
                PulseemSurvey6: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion6', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey6" }, 'PulseemSurvey'),
                PulseemSurvey7: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion7', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey7" }, 'PulseemSurvey'),
                PulseemSurvey8: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion8', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey8" }, 'PulseemSurvey'),
                PulseemSurvey9: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion9', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey9" }, 'PulseemSurvey'),
                PulseemSurvey10: new BeeFormModel(ElementTypes.text, t('landingPages.surveyQuestion10', { lng: BASED_ON_LANG[language] }), true, { required: 'true', placeholder: t('landingPages.placeholder.surveyQuestion', { lng: BASED_ON_LANG[language] }), name: "PulseemSurvey10" }, 'PulseemSurvey')
            }
            if (extraFields && Object.keys(extraFields)?.length > 0) {
                Object.keys(extraFields).forEach((key) => {
                    const val = extraFields[key];
                    if (val !== '') {
                        clientForm[key] = new BeeFormModel(ElementTypes.text, val, true, { placeholder: t('landingPages.placeholder.typeHere', { lng: BASED_ON_LANG[language] }) + ' ' + val, name: key }, key?.toLowerCase()?.indexOf('date') > -1 && 'frm-1 bee-date');
                    }
                });
            }
            resolve(clientForm);
        } catch (e) {
            reject(e);
        }
    });
}