import React, { useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { coreProps, TemplateFieldsProps } from "./WhatsappCreator.types";
import { ClassesType } from "../../Classes.types";
import { TextField, Typography, MenuItem, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const TemplateFields = ({
  classes,
  templateName,
  savedTemplate,
  onTemplateNameChange,
  onSavedTemplateChange,
}: TemplateFieldsProps & ClassesType) => {
  const { windowSize } = useSelector((state: { core: coreProps }) => state.core);
  const { t: translator } = useTranslation();
  const [isCampaign, setIsCampaign] = useState(false);

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
    <Grid
      container
      spacing={windowSize === "xs" ? 0 : 2}
    >
      <Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
        <Typography className={classes.buttonHead}>
          {translator("whatsapp.templateName")}
        </Typography>

        <TextField
          required
          id="templateName"
          type="text"
          placeholder={translator("whatsapp.templateNamePlaceholder")}
          className={
            isCampaign
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

      <Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
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
            isCampaign
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
  );
};

export default React.memo(TemplateFields);
