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
