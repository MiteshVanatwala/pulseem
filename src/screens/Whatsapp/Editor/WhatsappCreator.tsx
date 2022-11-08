import React, { BaseSyntheticEvent, useState } from "react";
import { useSelector } from "react-redux";
import DefaultScreen from "../../DefaultScreen";
import WizardTitle from "../../../components/Wizard/WizardTitle";
import RenderFields from "./RenderFields";
import RenderButtons from "./RenderButtons";
import RenderPhone from "./RenderPhone";
import { WhatsappCreatorProps, core } from "./types";
import { useTranslation } from "react-i18next";
import { Box, Grid } from "@material-ui/core";

const WhatsappCreator = ({ classes }: WhatsappCreatorProps) => {
  const { windowSize } = useSelector((state: { core: core }) => state.core);
  const { t: translator } = useTranslation();

  const [templateName, setTemplateName] = useState<String>("");
  const [savedTemplate, setSavedTemplate] = useState<String>("");

  const onTemplateNameChange = (e: BaseSyntheticEvent) => {
    console.log(e.target.value);
    setTemplateName(e.target.value.toLowerCase());
  };

  const onSavedTemplateChange = (e: BaseSyntheticEvent) => {
    console.log(e.target.value);
    setSavedTemplate(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTemplateName("");
    setSavedTemplate("");
    console.log("Form Submitted with these - ", templateName, savedTemplate);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <DefaultScreen
          subPage={"create"}
          currentPage="whatsapp"
          classes={classes}
          customPadding={true}
        >
          <Grid
            container
            spacing={windowSize === "xs" ? 0 : 3}
            className={
              windowSize === "xs" || windowSize === "sm"
                ? classes.mobileGrid
                : ""
            }
            style={{
              height: windowSize !== "xs" ? "calc(100vh - 75px)" : "auto",
            }}
          >
            <Grid item sm={12} md={12} lg={8}>
              <WizardTitle
                title={translator("whatsapp.whatsappTemplate")}
                classes={classes}
                tooltip={translator("whatsapp.toolTip1")}
                stepNumber={1}
                subTitle={translator("whatsapp.createContent")}
                topZero={false}
              />
              <RenderFields
                classes={classes}
                templateName={templateName}
                savedTemplate={savedTemplate}
                onTemplateNameChange={(e) => onTemplateNameChange(e)}
                onSavedTemplateChange={(e) => onSavedTemplateChange(e)}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={4}>
              <Box style={{ maxWidth: 420, marginTop: 20 }}>
                <RenderPhone classes={classes} />
              </Box>
            </Grid>
            <RenderButtons classes={classes} />
          </Grid>
        </DefaultScreen>
      </form>
    </>
  );
};

export default WhatsappCreator;
