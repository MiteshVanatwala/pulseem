export enum SourceType {
    SMS = 1,
    EMAIL = 2,
    WHATSAPP = 3
}
export const ConvertColorStatus = (value: string, type: SourceType) => {
    if (type === SourceType.SMS) {
        switch (value.toString()) {
            default:
            case '-1':
            case '1': {
                return '#000';
            }
            case '2': {
                return '#F59A23';
            }
            case '3': {
                return '#27AE60';
            }
            case '4':
            case '7':
            case '8':
            case '9':
            case '10':
            case '11':
            case '12': {
                return '#E74C3C';
            }
            case '6':
            case '5': {
                return '#0371AD';
            }
        }
    }
    if (type === SourceType.EMAIL) {
        switch (value.toString()) {
            default:
            case '1': {
                return '#000';
            }
            case '2': {
                return '#F59A23';
            }
            case '3': {
                return '#27AE60';
            }
            case '4':
            case '7':
            case '8':
            case '9':
            case '10':
            case '11':
            case '12': {
                return '#E74C3C';
            }
            case '6':
            case '5': {
                return '#0371AD';
            }
        }
    }
    if (type === SourceType.WHATSAPP) {
        switch (value.toString()) {
            case "-1": {
                return '#000';
            }
            default:
            case '1': {
                return '#959595';
            }
            case '2': {
                return '#F59A23';
            }
            case '3': {
                return '#27AE60';
            }
            case '4': {
                return '#E74C3C';
            }
            case '5': {
                return '#E74C3C';
            }
            case '6': {
                return '#27AE60';
            }
            case '7': {
                return '#E74C3C';
            }
            case '8': {
                return '#E74C3C';
            }
            case '9': {
                return '#E74C3C';
            }
            case '10': {
                return '#E74C3C';
            }
            case '11': {
                return '#959595';
            }
        }
    }
}
export const ConvertSmsStatusText = (value: string) => {
    if (value && value !== '') {
        switch (value) {
            case "-1": {
                return "report.takenBySender";
            }
            case "0": {
                return 0;
            }
            case "1": {
                return "report.pending";
            }
            case "2": {
                return "report.directReport.statuses.sending";
            }
            case "3": {
                return "campaigns.successSent";
            }
            case "4": {
                return "report.error";
            }
            case "5": {
                return "report.directReport.statuses.removed";
            }
            case "6": {
                return "report.stopped";
            }
            case "7": {
                return "report.canceled";
            }
            case "8": {
                return "report.deleted";
            }
            case "9": {
                return "report.suspended";
            }
            case "10": {
                return "report.requireAproval";
            }
            case "12": {
                return "report.invalidFromNumber";
            }
            case "13": {
                return "report.toNumberLonger";
            }
            case "20": {
                return "report.blockedSync";
            }
            case "21": {
                return "report.blockedRemoval";
            }
            default: {
                return null;
            }
        }
    }
    return null;
}
export const ConvertNewsletterStatusText = (value: number) => {
    switch (value) {
        case 0:
            {
                return "campaigns.successSent";
            }
        case 1:
        case 2:
        case 3:
        case 4: {
            return "emailStatus.error";
        }
        case 5: {
            return "common.Unsubscribed";
        }
    }
}
export const ConvertEmailStatusText = (value: string) => {
    if (value && value !== '') {
        switch (value.toString()) {
            case "1": {
                return "emailStatus.pending";
            }
            case "2": {
                return "emailStatus.sending";
            }
            case "3": {
                return "emailStatus.succeeded";
            }
            case "4": {
                return "emailStatus.error";
            }
            case "5": {
                return "emailStatus.retry";
            }
            case "6": {
                return "emailStatus.paused";
            }
            case "7": {
                return "emailStatus.cancelled";
            }
            case "8": {
                return "emailStatus.badError";
            }
            case "9": {
                return "emailStatus.mediumError";
            }
            case "10": {
                return "emailStatus.spam";
            }
            case "11": {
                return "emailStatus.removed";
            }
            case "12": {
                return "emailStatus.removedBySystem";
            }
            default: {
                return "emailStatus.noStatus";
            }
        }
    }
    return null;
}
export const ConvertWhatsappStatusText = (value: string) => {
    if (value) {
        switch (value.toString()) {
            case "-1": {
                return "report.takenBySender";
            }
            case "1": { // Pending
                return "common.Pending";
            }
            case "2": { // Sent
                return "common.Sent";
            }
            case "3": { //Success
                return "common.delivered";
            }
            case "4": { // Failed
                return "common.failedStatus";
            }
            case "5": { //Unsubscribe
                return "common.Unsubscribed";
            }
            case "6": { // read
                return "common.read";
            }
            case "7": { // Canceled
                return "report.canceled";
            }
            case "8": { // Stopped
                return "common.stopped";
            }
            case "9": { // Removed
                return "common.removed";
            }
            case "10": { // InvalidFromNumber
                return "report.invalidFromNumber";
            }
            case "11": { // NoInboundIn24Session
                return "common.NoInboundIn24Session";
            }
            default: {
                return null;
            }
        }
    }
    return null;
}
export const EllipsisText = (value: string, len: number) => {
    const length = value.length;
    if (length > len) {
        return value.substring(0, len) + '...';
    }
    return value;
}
export const TranslateKeys = (key: string, t: any) => {
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
export const ConvertClientStatus = (statusType: SourceType, statusId: number) => {
    switch (statusType) {
        case SourceType.SMS: {
            switch (statusId.toString()) {
                case '-1':
                default: {
                    return 'client.clientStatus.sms.NoSms';
                }
                case '0': {
                    return 'client.clientStatus.sms.Active';
                }
                case '1': {
                    return 'client.clientStatus.sms.Removed';
                }
                case '4': {
                    return 'client.clientStatus.sms.Invalid';
                }
                case '5': {
                    return 'client.clientStatus.sms.Pending';
                }
            }
        }
        case SourceType.EMAIL:
        default: {
            switch (statusId.toString()) {
                case '1': {
                    return 'client.clientStatus.email.Active';
                }
                case '2': {
                    return 'client.clientStatus.email.Removed';
                }
                case '3': {
                    return 'client.clientStatus.email.Restricted';
                }
                case '4': {
                    return 'client.clientStatus.email.Invalid';
                }
                case '5': {
                    return 'client.clientStatus.email.Pending';
                }
                case '-1':
                default: {
                    return 'client.clientStatus.email.NoEmail';
                }
            }
        }
    }
}

export const WhatsappStatusToString = (status: string) => {
    if (status) {
        switch (status.toString()) {
            case "-1": {
                return "report.takenBySender";
            }
            case "1": { // Pending
                return "common.Pending";
            }
            case "2": { // Sent
                return "common.Sent";
            }
            case "3": { //Success
                return "report.directReport.statuses.sentSuccessfuly";
            }
            case "4": { // Failed
                return "common.failedStatus";
            }
            case "5": { //Unsubscribe
                return "common.Unsubscribed";
            }
            case "6": { // read
                return "common.read";
            }
            case "7": { // Canceled
                return "report.canceled";
            }
            case "8": { // Stopped
                return "common.stopped";
            }
            case "9": { // Removed
                return "common.removed";
            }
            case "10": { // InvalidFromNumber
                return "report.invalidFromNumber";
            }
            case "11": { // NoInboundIn24Session
                return "common.NoInboundIn24Session";
            }
            default: {
                return null;
            }
        }
    }
    return null;
}

export const WhatsappStatusColor = (status: string) => {
    switch (status.toString()) {
        case "-1": {
            return '#000';
        }
        default:
        case '1': {
            return '#959595';
        }
        case '2': {
            return '#F59A23';
        }
        case '3': {
            return '#27AE60';
        }
        case '4': {
            return '#E74C3C';
        }
        case '5': {
            return '#E74C3C';
        }
        case '6': {
            return '#27AE60';
        }
        case '7': {
            return '#E74C3C';
        }
        case '8': {
            return '#E74C3C';
        }
        case '9': {
            return '#E74C3C';
        }
        case '10': {
            return '#E74C3C';
        }
        case '11': {
            return '#959595';
        }
    }
}