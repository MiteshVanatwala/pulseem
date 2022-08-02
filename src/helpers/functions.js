import { actionURL } from '../config/index';

export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const pulseemNewTab = (path) => {
  const newWindow = window.open(`${actionURL}${path}`, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const verifyGetUrl = (url) => {
  return new Promise((resolve, reject) => {
    try {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            resolve(true);
          }
          //resolve(xmlhttp.status && xmlhttp.status !== 404)
        }
      }
      xmlhttp.open("HEAD", url, true);
      xmlhttp.send();
    } catch (error) {
      reject(false);
    }
  });
}

export const emailStatusToString = (statusId) => {
  if (statusId) {
    switch (statusId.toString()) {
      case '1': {
        return 'emailStatus.pending';
      }
      case '2': {
        return 'emailStatus.sending';
      }
      case '3': {
        return 'emailStatus.succeeded';
      }
      case '4': {
        return 'emailStatus.error';
      }
      case '5': {
        return 'emailStatus.retry';
      }
      case '6': {
        return 'emailStatus.paused';
      }
      case '7': {
        return 'emailStatus.cancelled';
      }
      case '8': {
        return 'emailStatus.badError';
      }
      case '9': {
        return 'emailStatus.mediumError';
      }
      case '10': {
        return 'emailStatus.spam';
      }
      case '11': {
        return 'emailStatus.removed';
      }
      case '12': {
        return 'emailStatus.removedBySystem';
      }
      default: {
        return 'emailStatus.noStatus';
      }
    }
  }
  return null;
}

export const smsStatusToString = (status) => {
  if (status) {
    switch (status.toString()) {
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

export const smsStatusColor = (status) => {
  switch (status.toString()) {
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

export const emailStatusColor = (status) => {
  switch (status.toString()) {
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

export const makeId = () => {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
}
export const switchClientStatus = (statusType, statusId) => {
  switch (statusType) {
    case "sms": {
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
      }
    }
    default: {
      switch (statusId.toString()) {
        case '-1':
        default: {
          return 'client.clientStatus.email.NoEmail';
        }
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
      }
    }
  }
}
