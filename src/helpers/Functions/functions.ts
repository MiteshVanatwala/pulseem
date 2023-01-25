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
