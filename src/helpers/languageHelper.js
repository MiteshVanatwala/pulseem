export const translateKeys = (key, t) => {
    key = key.replaceAll(' ', '').trim().toLowerCase();
    switch (key) {
        case 'שםפרטי':
        case 'firstname':
            { return { key: "FirstName", value: t("smsReport.firstName") }; }
        case 'שםמשפחה':
        case 'lastname':
            { return { key: "LastName", value: t("smsReport.lastName") }; }
        case 'סלולרי':
        case 'cellphone':
            { return { key: "Cellphone", value: t("common.cellphone") }; }
        case 'דואראלקטרוני':
        case 'email':
            { return { key: "Email", value: t("common.email") }; }
        case 'טלפון':
        case 'telephone':
            { return { key: "Telephone", value: t("common.telephone") }; }
        case 'כתובת':
        case 'address':
            { return { key: "Address", value: t("common.address") }; }
        case 'עיר':
        case 'city':
            { return { key: "City", value: t("common.city") }; }
        case 'מיקוד':
        case 'zip':
            { return { key: "Zip", value: t("common.zip") }; }
        case 'תאריךלידה':
        case 'birthdate':
        case 'birthday':
            { return { key: "BirthDate", value: t("common.birthDate") }; }
        default: { return { key: 'adjustTitle', value: t("sms.adjustTitle") } }
    }
}