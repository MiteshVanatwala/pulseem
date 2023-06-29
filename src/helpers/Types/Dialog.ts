import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { TYPE_JSX } from "./common";
export type DialogOptions = {
  childrenPadding?: boolean;
  open: boolean;
  title?: any;
  icon?: any;
  children: TYPE_JSX;
  showDivider?: boolean;
  onClose?: Function;
  onCancel?: Function;
  onConfirm?: Function;
  renderButtons?: any;
  renderTitle?: any;
  disableBackdropClick?: boolean;
  customContainerStyle?: Object | string | null;
  paperStyle?: Object | string | null;
  childrenStyle?: Object | string | null;
  contentStyle?: Object | string | null;
  cancelText?: string;
  confirmText?: string;
  showDefaultButtons?: boolean;
  style?: CSSProperties | undefined;
  exitButton?: any;
  maxHeight?: string | number | undefined;
  reduceTitle?: boolean;
  confirmDisabled?: boolean;
  classes?: any;
  className?: string;
};

export type Slide_PropTypes = {
  children: any;
  className_SlideBody?: any;
  style_SlideBody?: CSSProperties;
  slideStyle?: CSSProperties;
};

export type Slider_Dialog_PropTypes = {
  classes: any;
  slides: Slide_PropTypes[];
  isOpen: boolean;
  VARIABLE_SLIDE_HEIGHTS?: null | String[];
  navigationButtons?: boolean;
  defaultButtons?: boolean;
  customButtons?: TYPE_JSX | null;
  confirmText?: string;
  backText?: string;
  onClose?: Function;
  onConfirm?: Function;
  rollBack?: boolean;
  currentStep?: number;
  setCurrentStep?: Function;
};

export type Verification_Dailog_PropTypes = {
  isOpen: boolean;
  onClose: Function;
};
