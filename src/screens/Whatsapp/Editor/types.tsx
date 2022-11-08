import { BaseSyntheticEvent } from "react";

export type WhatsappCreatorProps = {
  classes: { [key: string]: string };
  templateName: String;
  savedTemplate: String;
  onTemplateNameChange: (e: BaseSyntheticEvent) => void;
  onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
};

export type RenderPhoneProps = {
  classes: { [key: string]: string };
};

export type RenderButtonsProps = {
  classes: { [key: string]: string };
};

export type core = {
  windowSize: String;
  isRTL: Boolean;
};
