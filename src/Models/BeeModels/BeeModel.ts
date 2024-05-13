import { isProdMode } from "../../config";

export enum ElementTypes {
  text = 'text',
  email = 'email',
  tel = 'tel',
  select = 'select',
  checkbox = 'checkbox',
  date = 'date',
  textarea = 'textarea',
  submit = 'submit',
  number = 'digit'
}
export class BeeFormModel {
  type?: ElementTypes;
  label?: string;
  canBeRemovedFromLayout?: boolean;
  removeFromLayout?: boolean;
  attributes?: any;
  classes?: any;
  constructor(_type: ElementTypes | never | any, _label: string | never | any, _canBeRemovedFromLayout: boolean, _removeFromLayout: boolean, _attr: any, _classes: string | never | any) {
    this.type = _type ?? 'text';
    this.label = _label ?? '';
    this.canBeRemovedFromLayout = _canBeRemovedFromLayout ?? false;
    this.removeFromLayout = _removeFromLayout ?? false
    this.classes = _classes || '';
    this.attributes = {
      "class": `form-control ${_classes || ''}`,
      "data-action": "submit",
      "data-sitekey": isProdMode ? "6LcY9cwjAAAAAGxR66dKqOoLMGVPQ--8nRxWpHJl" : "6LcY9cwjAAAAAG5_zmvxFOEpAB20OEPaJRBWiSXe",
      ..._attr
    };
  }
  beeForm() {
    return { type: this.type, label: this.label, canBeRemovedFromLayout: this.canBeRemovedFromLayout };
  }
}
export interface ClientForm {
  Email?: BeeFormModel | any | never | null | undefined;
  FirstName?: BeeFormModel | any | never;
  LastName?: BeeFormModel | any | never;
  Telephone?: BeeFormModel | any | never;
  Cellphone?: BeeFormModel | any | never;
  Address?: BeeFormModel | any | never;
  City?: BeeFormModel | any | never;
  State?: BeeFormModel | any | never;
  Country?: BeeFormModel | any | never;
  Zip?: BeeFormModel | any | never;
  Company?: BeeFormModel | any | never;
  ExtraDate1?: BeeFormModel | any | never;
  ExtraDate2?: BeeFormModel | any | never;
  ExtraDate3?: BeeFormModel | any | never;
  ExtraDate4?: BeeFormModel | any | never;
  ExtraField1?: BeeFormModel | any | never;
  ExtraField2?: BeeFormModel | any | never;
  ExtraField3?: BeeFormModel | any | never;
  ExtraField4?: BeeFormModel | any | never;
  ExtraField5?: BeeFormModel | any | never;
  ExtraField6?: BeeFormModel | any | never;
  ExtraField7?: BeeFormModel | any | never;
  ExtraField8?: BeeFormModel | any | never;
  ExtraField9?: BeeFormModel | any | never;
  ExtraField10?: BeeFormModel | any | never;
  ExtraField11?: BeeFormModel | any | never;
  ExtraField12?: BeeFormModel | any | never;
  ExtraField13?: BeeFormModel | any | never;
  BirthDate?: BeeFormModel | any | never;
  ReminderDate?: BeeFormModel | any | never;
  PulseemSurvey1?: BeeFormModel | any | never;
}