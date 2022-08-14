export const translateKeys = (key, t) => {
    key = key.trim().replace(' ', '').toLowerCase();
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
        case 'zipcode':
            { return { key: "Zip", value: t("common.zip") }; }
        case 'תאריךלידה':
        case 'birthdate':
        case 'birthday':
            { return { key: "BirthDate", value: t("common.birthDate") }; }
        case 'ארץ':
        case 'country':
            { return { key: "Country", value: t("common.country") }; }
        case 'חברה':
        case 'company':
            { return { key: "Company", value: t("common.company") }; }
        case 'תאריךתזכורת':
        case 'reminderdate':
            { return { key: "ReminderDate", value: t("recipient.reminderDate") }; }
        default: { return { key: 'adjustTitle', value: t("sms.adjustTitle") } }
    }
}