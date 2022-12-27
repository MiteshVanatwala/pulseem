import { ClassesType } from "../../Classes.types";
import DefaultScreen from "../../DefaultScreen";
import WizardTitle from "../../../components/Wizard/WizardTitle";
import { Grid } from "@material-ui/core";
import { WhatsappCampaignSecondProps } from "./Types/WhatsappCampaign.types";
import { useTranslation } from "react-i18next";
import RightPane from "./Components/RightPane";
import LeftPane from "./Components/LeftPane";
import { useState } from "react";
import SummaryModal from "./Popups/SummaryModal";

const SendCampaign = ({
  classes,
}: ClassesType & WhatsappCampaignSecondProps) => {
  const { t: translator } = useTranslation();
  const [grps, setGrps] = useState<string[]>([]);

  return (
    <DefaultScreen
      subPage={"send2"}
      currentPage="whatsapp"
      classes={classes}
      customPadding={true}
    >
      <div>
        <div>
          <WizardTitle
            title={translator("mainReport.smsCampaign")}
            classes={classes}
            stepNumber={2}
            subTitle={translator("mainReport.sendSetting")}
          />
          <Grid container style={{ marginBottom: "40px" }}>
            <Grid item md={7} xs={12}>
              <LeftPane classes={classes} />
            </Grid>
            <Grid item md={1} xs={12}></Grid>
            <Grid item md={4} xs={12}>
              <RightPane classes={classes} />
            </Grid>
          </Grid>
        </div>
        <SummaryModal
          classes={classes}
          open={false}
          campaignName={""}
          fromNumber={""}
          summaryPayload={undefined}
          onConfirm={function (): void {
            throw new Error("Function not implemented.");
          }}
          textMsg={""}
          groups={[]}
          filteredGroups={undefined}
          filteredCampaigns={undefined}
        />
      </div>
    </DefaultScreen>
  );
};

export default SendCampaign;
