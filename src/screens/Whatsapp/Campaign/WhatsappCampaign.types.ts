import { ClassesType } from "../../Classes.types";

export type coreProps = {
  windowSize: string;
  isRTL: boolean;
};

export type WhatsappCampaignProps = {
  classes: ClassesType[];
};

export type dynamicButtonProps = {
  tooltipTitle: string;
  buttonTitle: string;
};
