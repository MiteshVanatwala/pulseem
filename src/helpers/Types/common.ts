export type TYPE_URL = string;
export type TYPE_PATH = string;
export type TYPE_STATUS = Number;
export type TYPE_STATUSID = Number;
export type TYPE_JSX = JSX.Element;
export type TYPE_KEY_VAL_OBJECT = { [key: string]: any };
export type ERROR_TYPE = {
  severity: "success" | "error";
  color: "success" | "error";
  message: string;
  showAnimtionCheck: boolean;
} | null;
export const VoidFunction: () => void = () => {
  return false;
};
