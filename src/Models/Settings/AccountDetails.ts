import React from "react";
import { AccountSettings } from '../Account/AccountSettings';

export type AccDtlPropTypes = {
    setToastMessage: React.Dispatch<React.SetStateAction<null>>;
    ToastMessages: {
        [key: string]: any;
    };
    Settings: AccountSettings | null,
    OnUpdate: Function
};
