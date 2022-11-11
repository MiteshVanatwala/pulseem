import React, { BaseSyntheticEvent, useState } from "react";
import { useSelector } from "react-redux";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";
import TemplateFields from "./TemplateFields";
import Buttons from "./Buttons";
import Phone from "./Phone";
import { WhatsappCreatorProps, core } from "./WhatsappCreator.types";
import { ClassesType } from "../../Classes.types";
import { useTranslation } from "react-i18next";
import { Box, Grid } from "@material-ui/core";
import WhatsappTemplateEditor from "./WhatsappTemplateEditor";

const WhatsappCreator = ({ classes }: WhatsappCreatorProps & ClassesType) => {
  const { windowSize } = useSelector((state: { core: core }) => state.core);
  const { t: translator } = useTranslation();

  const [templateName, setTemplateName] = useState<string>("");
  const [savedTemplate, setSavedTemplate] = useState<string>("");

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
            windowSize === "xs" || windowSize === "sm" ? classes.mobileGrid : ""
          }
          style={{
            height: windowSize !== "xs" ? "calc(100vh - 75px)" : "auto",
          }}
        >
          <Grid sm={12} md={12} lg={12}>
            <Title
              Text={translator("whatsapp.header")}
              Classes={classes.whatsappTemplateTitle}
              ContainerStyle={{}}
              Element={null}
            />
            <TemplateFields
              classes={classes}
              templateName={templateName}
              savedTemplate={savedTemplate}
              onTemplateNameChange={(e) => onTemplateNameChange(e)}
              onSavedTemplateChange={(e) => onSavedTemplateChange(e)}
            />
          </Grid>

          <Grid container>
            <Grid item xs={12} sm={12} md={12} lg={5}>
              <WhatsappTemplateEditor classes={classes} />
            </Grid>

            <Grid container xs={12} sm={12} md={12} lg={7}>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                <Box style={{ maxWidth: 420, marginTop: 20 }}>
                  <Phone classes={classes} />
                </Box>
              </Grid>
              <Buttons classes={classes} />
            </Grid>
          </Grid>
        </Grid>
      </DefaultScreen>
    </form>
  );
};

export default WhatsappCreator;
