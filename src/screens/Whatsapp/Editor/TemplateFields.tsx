import React, { BaseSyntheticEvent, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { coreProps, TemplateFieldsProps } from "./WhatsappCreator.types";
import { ClassesType } from "../../Classes.types";
import {
  TextField,
  Typography,
  MenuItem,
  Grid,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import AlertModal from "./AlertModal";

const TemplateFields = ({
  classes,
  templateName,
  savedTemplate,
  onTemplateNameChange,
  onSavedTemplateChange,
}: TemplateFieldsProps & ClassesType) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleAlertModalClose = () => {
    setIsOpen(false);
  };
  const handleAlertModalOpen = () => {
    setIsOpen(true);
  };
  const { windowSize } = useSelector(
    (state: { core: coreProps }) => state.core
  );
  const { t: translator } = useTranslation();
  const [isCampaign, setIsCampaign] = useState(false);

  const units = ["bytes", "KB", "MB"];

  function niceBytes(x: string) {
    let l = 0,
      n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
  }

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const onFileUploadChange = (e: BaseSyntheticEvent) => {
    if (e.target.files?.length > 0) {
      if (e.target.files[0].size < 16777216) {
        setFileName(e.target.files[0].name);
        setFileSize(niceBytes(e.target.files[0].size));
      } else {
        alert("File size should be less than 16MB");
      }
    }
  };

  const onFileDeselect = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setFileName("");
  };

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
    <Grid container spacing={windowSize === "xs" ? 0 : 2}>
      <Grid item xs={12} sm={12} md={12} lg={5}>
        <Grid container spacing={windowSize === "xs" ? 0 : 2}>
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
              placeholder={translator(
                "whatsapp.selectSavedTemplatePlaceholder"
              )}
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
      </Grid>
      <Button variant="outlined" onClick={handleAlertModalOpen}>
        Open responsive dialog
      </Button>
      <AlertModal
        isOpen={isOpen}
        handleClose={handleAlertModalClose}
        title="Update Roles"
        subtitle="Jonak Testing"
        children=""
      />

      <Grid item xs={12} sm={12} md={12} lg={5}>
        <Grid container spacing={windowSize === "xs" ? 0 : 2}>
          <Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
            <Typography className={classes.buttonHead}>
              Upload File-PNG,JPG,PDF,MP4
            </Typography>
            <label
              className={classes.customFileUpload}
              style={{
                padding:
                  fileName?.length > 0
                    ? "14px 15px 12px 7px"
                    : "17px 15px 15px 7px",
              }}
            >
              <input
                required
                type="file"
                className={classes.formFieldInput}
                accept="image/png, image/jpeg, application/pdf, video/mp4"
                onChange={(e) => onFileUploadChange(e)}
              />
              {fileName ? (
                <div style={{ marginRight: "auto" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{
                      borderRadius: "22px",
                      padding: "0px 10px 0px 10px",
                    }}
                    onClick={(e) => onFileDeselect(e)}
                  >
                    {fileName.substring(0, 10) + "..."}&emsp;
                    <i className="zmdi zmdi-close"></i>
                  </Button>
                </div>
              ) : (
                <i className="zmdi zmdi-upload"></i>
              )}
            </label>

            <Typography className={classes.buttonContent}>
              {fileName
                ? `Total Size ${fileSize}`
                : "Only one file - up to 16 MB"}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(TemplateFields);
