import { ClassesType } from "../../screens/Classes.types";

export type NoCreditsModel = {
    isOpen: boolean,
    classes: ClassesType,
    popUpType: CreditType,
    bulkLeft: Number,
    Charge: Number,
    OnCancel: Function,
    OnConfirm: Function
}

export enum CreditType {
    SMS = 3,
    EMAIL = 2
}