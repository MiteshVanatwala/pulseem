import { ClassesType } from "../../Classes.types";
import { BaseSyntheticEvent } from "react";

export type WhatsappCreatorProps = {
  classes: ClassesType;
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

export type core = {
  windowSize: string;
  isRTL: boolean;
};
