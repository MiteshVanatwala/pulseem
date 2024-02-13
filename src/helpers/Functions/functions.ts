import { actionURL } from "../../config/index";
import { TYPE_PATH, TYPE_URL } from "../Types/common";

export const openInNewTab = (url: TYPE_URL = "") => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

export const pulseemNewTab = (path: TYPE_PATH = "") => {
  const newWindow = window.open(
    `${actionURL}${path}`,
    "_blank",
    "noopener,noreferrer"
  );
  if (newWindow) newWindow.opener = null;
};

export const RandomID = () => {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
};

export const whatsappStatusToString = (status: number) => {
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

export const whatsappStatusColor = (status: number) => {
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

