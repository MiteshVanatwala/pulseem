export type Verification_Dialog_Popup = {
    variant: string;
    isOpen: boolean;
    onClose: Function;
    children: POPUP_OBJECT_TYPE;
    classes: any;
  };
  
  export type POPUP_OBJECT_TYPE = {
    step?: Number,
    title: any;
    icon: any;
    content: any;
    renderButtons: any;
  };
  export type verificationErrorType = {
    email?: string;
    Number?: string;
    code?: string;
  };