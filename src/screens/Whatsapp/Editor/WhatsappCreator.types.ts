import { ClassesType } from "../../Classes.types";
import { BaseSyntheticEvent } from "react";

export type WhatsappCreatorProps = {
  classes: ClassesType[];
  onButtonClick(button: actionButtonProps): void;
};

export type TemplateFieldsProps = {
  classes: ClassesType[];
  templateName: string;
  savedTemplate: string;
  onTemplateNameChange: (e: BaseSyntheticEvent) => void;
  onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
};

export type MessageEditorProps = {
  classes: ClassesType;
};

export type PhoneProps = {
  classes: ClassesType;
};

export type ButtonsProps = {
  classes: ClassesType;
};

export type coreProps = {
  windowSize: string;
  isRTL: boolean;
};

export type actionButtonProps = {
  tooltipTitle: string;
  buttonTitle: string;
  isDisable: boolean;
};
