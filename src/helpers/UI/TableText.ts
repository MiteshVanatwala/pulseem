export class StatusColor {
    Sms(value: string) {
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
    Email(value: string) {
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
}

export class StatusText {
    Sms(value: string) {
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
                    return "report.directReport.statuses.sentSuccessfuly";
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
    Email(value: string) {
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
    Ellipsis(value: string, len: number) {
        const length = value.length;
        if (length > len) {
            return value.substring(0, len) + '...';
        }
        return value;
    }
}