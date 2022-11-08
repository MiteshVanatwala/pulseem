import React, { useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { WhatsappCreatorProps, core } from "./types";
import { TextField, Typography, MenuItem, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const RenderFields = ({
  classes,
  templateName,
  savedTemplate,
  onTemplateNameChange,
  onSavedTemplateChange,
}: WhatsappCreatorProps) => {
  const { windowSize } = useSelector((state: { core: core }) => state.core);
  const { t: translator } = useTranslation();
  const [campaignBool, setcampaignBool] = useState(false);

  const names = [
    "Oliver Hansen",
    "Van Henry",
    "April Tucker",
    "Ralph Hubbard",
    "Omar Alexander",
    "Carlos Abbott",
    "Miriam Wagner",
    "Bradley Wilkerson",
    "Virginia Andrews",
    "Kelly Snyder",
  ];

  return (
    <>
      {" "}
      <Grid
        container
        spacing={windowSize === "xs" ? 0 : 2}
        className={classes.fieldDiv}
      >
        <Grid item xs={12} md={4} sm={12} className={classes.buttonForm}>
          <Typography className={classes.buttonHead}>
            {translator("whatsapp.templateName")}
          </Typography>

          <TextField
            required
            id="templateName"
            type="text"
            placeholder={translator("whatsapp.templateNamePlaceholder")}
            className={
              campaignBool
                ? clsx(classes.buttonField, classes.error)
                : clsx(classes.buttonField, classes.success)
            }
            onChange={onTemplateNameChange}
            value={templateName}
          />

          <Typography className={classes.buttonContent}>
            {translator("whatsapp.templateDesc")}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4} sm={12} className={classes.buttonForm}>
          <Typography className={classes.buttonHead}>
            {translator("whatsapp.selectSavedTemplate")}
          </Typography>

          <TextField
            required
            select
            id="selectSavedTemplate"
            type="text"
            placeholder={translator("whatsapp.selectSavedTemplatePlaceholder")}
            className={
              campaignBool
                ? clsx(classes.buttonField, classes.error)
                : clsx(classes.buttonField, classes.success)
            }
            onChange={onSavedTemplateChange}
            value={savedTemplate}
          >
            {names.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </>
  );
};

export default React.memo(RenderFields);
